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

export async function getZohoAccessToken(): Promise<string> {
    const tokenDocRef = adminDb.collection("tokens").doc("zoho");
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5-minute buffer before expiration

    // If a fetch is already in progress, wait for it
    if (ongoingFetchPromise) {
        console.log("Waiting for ongoing Zoho token fetch");
        return ongoingFetchPromise;
    }

    try {
        // Check Firestore for a valid token
        const tokenDoc = await tokenDocRef.get();
        const tokenData = tokenDoc.data();

        if (
            tokenData &&
            tokenData.accessToken &&
            tokenData.expiresAt &&
            now < tokenData.expiresAt - buffer
        ) {
            console.log("Returning Zoho access token from Firestore");
            return tokenData.accessToken;
        }

        // Fetch a new token
        ongoingFetchPromise = (async () => {
            try {
                console.log("Fetching new Zoho access token");
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

                const data = await res.json();
                console.log("Zoho token response:", JSON.stringify(data, null, 2));

                if (!res.ok || !data.access_token) {
                    throw new Error(`Failed to refresh Zoho token: ${data.error || "Unknown error"}`);
                }

                // Store the new token in Firestore
                const expiresAt = now + (data.expires_in * 1000); // Convert seconds to milliseconds
                await tokenDocRef.set({
                    accessToken: data.access_token,
                    expiresAt,
                    updatedAt: Timestamp.fromMillis(now),
                });

                console.log(`New Zoho token stored in Firestore, expires at: ${new Date(expiresAt).toISOString()}`);
                return data.access_token;
            } catch (error) {
                console.error("getZohoAccessToken error:", error);
                throw error;
            } finally {
                // Clear the fetch promise
                ongoingFetchPromise = null;
            }
        })();

        return ongoingFetchPromise;
    } catch (error) {
        console.error("Error checking Firestore for Zoho token:", error);
        throw error;
    }
}

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
        const contactId = await getOrCreateZohoContact({
            accessToken,
            customerEmail,
            customerName,
        });
        if (!contactId) throw new Error("No Zoho contact ID found");
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
                            name: `Donation - Payment ID: ${paymentId}`,
                            rate: amount,
                            quantity: 1,
                        },
                    ],
                    payment_terms: 0,
                    notes: "Thank you for your generous donation!",
                }),
            }
        );
        const invoiceData = await invoiceRes.json();
        if (!invoiceRes.ok || invoiceData.code !== 0) {
            throw new Error(`Zoho invoice creation failed: code=${invoiceData.code}, message=${invoiceData.message}`);
        }
        return invoiceData;
    } catch (error: unknown) {
        console.error("Zoho invoice generation failed:", {
            error: error instanceof Error ? error.message : String(error),
            customerEmail,
            customerName,
            paymentId,
        });
        throw error;
    }
}

export async function sendInvoiceViaZohoMail(invoiceId: string, accessToken: string, email: string) {
    try {
        if (!invoiceId || !accessToken || !email) {
            throw new Error("Missing required parameters for sending Zoho email");
        }
        const emailRes = await fetch(
            `https://invoice.zoho.in/api/v3/invoices/${invoiceId}/email?organization_id=${process.env.ZOHO_ORG_ID}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to_mail_ids: [email],
                    subject: "Thank You for Your Donation – Here's Your Invoice",
                    body: `Thank You for Your Support!\n\nDear donor,\n\nWe sincerely appreciate your generous contribution. Your support helps us continue our mission to serve the community with greater impact.\n\nYour official donation invoice is attached to this email.\n\nIf you do not see the attachment, you can always download it from your dashboard on our website\n\nThank you once again for being a part of our journey. Every donation counts 💚\n\nHussaini Welfare Association`,
                }),
            }
        );
        const emailData = await emailRes.json();
        if (!emailRes.ok || emailData.code !== 0) {
            throw new Error(`Failed to send Zoho email: ${emailData.message}`);
        }
        return true;
    } catch (error: unknown) {
        console.error("Zoho email sending failed:", error);
        throw error; // Propagate error
    }
}