"use server"

import { adminDb } from "@/firebase/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Retrieves or creates a Zoho contact for the given customer.
 * If the contact already exists in Firestore, it returns the existing Zoho contact ID.
 * If not, it creates a new contact in Zoho and stores it in Firestore.
 */
export async function getOrCreateZohoContact({
    accessToken,
    customerEmail,
    customerName,
}: {
    accessToken: string;
    customerEmail: string;
    customerName: string;
}) {
    // Basic input validations
    if (!accessToken) {
        throw new Error("Access token is required");
    }
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        throw new Error(`Invalid email: ${customerEmail}`);
    }
    if (!customerName || customerName.trim().length === 0) {
        throw new Error(`Invalid customer name: ${customerName}`);
    }
    if (!process.env.ZOHO_ORG_ID) {
        throw new Error("ZOHO_ORG_ID environment variable is missing");
    }

    const orgId = process.env.ZOHO_ORG_ID;

    try {
        // Step 1: Check if Zoho contact already exists in Firestore
        const contactQuery = adminDb
            .collection('zohoContact')
            .where('email', '==', customerEmail);
        const contactSnapshot = await contactQuery.get();

        if (!contactSnapshot.empty) {
            const contactDoc = contactSnapshot.docs[0];
            const contactData = contactDoc.data();
            if (contactData.zohoContactId) {
                return contactData.zohoContactId;
            }
        }

        // Step 2: Create a new contact in Zoho
        const createRes = await fetch(
            `https://invoice.zoho.in/api/v3/contacts?organization_id=${orgId}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contact_name: customerName.trim(),
                    contact_persons: [{ email: customerEmail }],
                }),
            }
        );

        const createData = await createRes.json();

        // Step 3: Handle API failure
        if (!createRes.ok || createData.code !== 0) {
            throw new Error(
                `Contact creation failed: code=${createData.code}, message=${createData.message}`
            );
        }

        // Step 4: Extract contact ID from response
        const contactId = createData?.contact?.contact_id;
        if (!contactId) {
            throw new Error("No contact ID returned from Zoho");
        }

        // Step 5: Save new contact in Firestore
        await adminDb.collection('zohoContact').add({
            email: customerEmail,
            zohoContactId: contactId,
            updatedAt: FieldValue.serverTimestamp(),
        });

        // Step 6: Return new contact ID
        return contactId;
    } catch (error: unknown) {
        // Log the error details and rethrow
        console.error("getOrCreateZohoContact failed:", {
            error: error instanceof Error ? error.message : String(error),
            customerEmail,
            customerName,
            accessToken: accessToken ? "Provided" : "Missing",
        });
        throw error;
    }
}
