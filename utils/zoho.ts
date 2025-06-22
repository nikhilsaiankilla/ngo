import { getOrCreateZohoContact } from "@/actions/getOrCreateZohoContact";

import { adminDb } from "@/firebase/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

// Global promise to track ongoing token fetch
let ongoingFetchPromise: Promise<string> | null = null;

// Validate environment variables at module load
const requiredEnvVars = [
    "ZOHO_REFRESH_TOKEN",
    "ZOHO_CLIENT_ID",
    "ZOHO_CLIENT_SECRET",
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing environment variable: ${envVar}`);
    }
}

/**
 * Retrieves a valid Zoho access token.
 * 
 * - Checks Firestore for a cached token and ensures it's not close to expiration.
 * - If no valid token exists, it refreshes the token using Zoho OAuth refresh_token flow.
 * - Caches the new token in Firestore with an expiration timestamp.
 * - Ensures only one token fetch is in progress at a time using a shared `ongoingFetchPromise`.
 * 
 * @returns A Promise that resolves to a valid Zoho access token.
 */

export async function getZohoAccessToken(): Promise<string> {
    // Reference to the Firestore document where the Zoho token is stored
    const tokenDocRef = adminDb.collection("tokens").doc("zoho");
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5-minute buffer before expiration to ensure we don't use an expiring token

    // If another fetch request is already in progress, wait for it to complete
    if (ongoingFetchPromise) {
        return ongoingFetchPromise;
    }

    try {
        // Try to retrieve the existing token from Firestore
        const tokenDoc = await tokenDocRef.get();
        const tokenData = tokenDoc.data();

        // Check if the token exists and is still valid (with buffer)
        if (
            tokenData &&
            tokenData.accessToken &&
            tokenData.expiresAt &&
            now < tokenData.expiresAt - buffer
        ) {
            // Return the cached valid token
            return tokenData.accessToken;
        }

        // If token is missing or expired, initiate a new token fetch
        ongoingFetchPromise = (async () => {
            try {
                // Make a request to Zoho to refresh the access token using the refresh token
                const res = await fetch("https://accounts.zoho.in/oauth/v2/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
                        client_id: process.env.ZOHO_CLIENT_ID!,
                        client_secret: process.env.ZOHO_CLIENT_SECRET!,
                        grant_type: "refresh_token",
                    }),
                });

                // Parse the response JSON
                const data = await res.json();

                // If the request failed or token is missing, throw an error
                if (!res.ok || !data.access_token) {
                    throw new Error(`Failed to refresh Zoho token: ${data.error || "Unknown error"}`);
                }

                // Calculate the new expiration timestamp
                const expiresAt = now + (data.expires_in * 1000); // Zoho returns expiration in seconds

                // Store the new token details in Firestore
                await tokenDocRef.set({
                    accessToken: data.access_token,
                    expiresAt,
                    updatedAt: Timestamp.fromMillis(now),
                });

                // Return the new access token
                return data.access_token;
            } catch (error) {
                // Propagate the error to the outer catch block
                throw error;
            } finally {
                // Always clear the ongoing fetch promise after completion or failure
                ongoingFetchPromise = null;
            }
        })();

        // Return the promise that resolves to the new token
        return ongoingFetchPromise;
    } catch (error) {
        // Log and rethrow any error that occurred while accessing Firestore
        console.error("Error checking Firestore for Zoho token:", error);
        throw error;
    }
}

/**
 * Creates a Zoho Invoice for a customer donation.
 * 
 * - Retrieves or creates a Zoho contact for the provided customer email.
 * - Creates an invoice with the specified amount and payment ID.
 * - Sends the invoice directly to the customer via email (if Zoho is configured).
 * 
 * @param accessToken - Zoho OAuth access token
 * @param customerEmail - Email of the customer/donor
 * @param customerName - Name of the customer/donor
 * @param amount - Donation amount
 * @param paymentId - Payment transaction ID
 * @returns The full Zoho invoice response
 */

export async function createZohoInvoice({
    accessToken,
    customerEmail,
    customerName,
    amount,
    paymentId,
}: {
    accessToken: string;
    customerEmail: string;
    customerName: string;
    amount: number;
    paymentId: string;
}) {
    try {
        // Step 1: Get or create the Zoho contact using provided customer info
        const contactId = await getOrCreateZohoContact({
            accessToken,
            customerEmail,
            customerName,
        });

        // If contact ID couldn't be retrieved or created, throw an error
        if (!contactId) throw new Error("No Zoho contact ID found");

        // Step 2: Send request to Zoho to create an invoice
        const invoiceRes = await fetch(
            `https://invoice.zoho.in/api/v3/invoices?organization_id=${process.env.ZOHO_ORG_ID}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customer_id: contactId,
                    line_items: [
                        {
                            name: `Donation to Hussani Welfare Association – Payment ID: ${paymentId}`,
                            rate: amount,  // Donation amount
                            quantity: 1,   // Single item
                        },
                    ],
                    payment_terms: 0,      // Due immediately
                    status: "sent",        // Mark as sent instead of draft
                    send: true,            // Trigger email to customer
                    notes: "Thank you for your generous donation!",
                }),
            }
        );

        // Parse JSON response from Zoho
        const invoiceData = await invoiceRes.json();

        // If response indicates error, throw with specific message
        if (!invoiceRes.ok || invoiceData.code !== 0) {
            throw new Error(
                `Zoho invoice creation failed: code=${invoiceData.code}, message=${invoiceData.message}`
            );
        }

        // Return invoice data if successful
        return invoiceData;
    } catch (error: unknown) {
        // Propagate any caught error
        throw error;
    }
}
/**
 * Sends a Zoho invoice to a donor via email.
 * 
 * - Uses the Zoho Invoice API to send the invoice email directly.
 * - Requires the invoice ID, valid Zoho OAuth token, and recipient's email.
 * - Customizes subject and message body for the donor.
 * 
 * @param invoiceId - ID of the invoice to be sent
 * @param accessToken - Zoho OAuth access token
 * @param email - Donor's email address
 * @returns true if the email was sent successfully, otherwise throws an error
 */

export async function sendInvoiceViaZohoMail(invoiceId: string, accessToken: string, email: string) {
    try {
        // Validate required parameters
        if (!invoiceId || !accessToken || !email) {
            throw new Error("Missing required parameters for sending Zoho email");
        }

        // Send email using Zoho Invoice API
        const emailRes = await fetch(
            `https://invoice.zoho.in/api/v3/invoices/${invoiceId}/email?organization_id=${process.env.ZOHO_ORG_ID}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to_mail_ids: [email], // Recipient list
                    subject: "Thank You for Your Donation – Here's Your Invoice", // Email subject
                    body: `Thank You for Your Support!\n\nDear donor,\n\nWe sincerely appreciate your generous contribution. Your support helps us continue our mission to serve the community with greater impact.\n\nYour official donation invoice is attached to this email.\n\nIf you do not see the attachment, you can always download it from your dashboard on our website\n\nThank you once again for being a part of our journey. Every donation counts 💚\n\nHussaini Welfare Association`,
                }),
            }
        );

        // Parse the API response
        const emailData = await emailRes.json();

        // If Zoho API returns error, throw with specific message
        if (!emailRes.ok || emailData.code !== 0) {
            throw new Error(`Failed to send Zoho email: ${emailData.message}`);
        }

        // Email sent successfully
        return true;
    } catch (error: unknown) {
        throw error; // Propagate error to caller
    }
}
