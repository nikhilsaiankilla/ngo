"use server"

import { adminDb } from "@/firebase/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function getOrCreateZohoContact({
    accessToken,
    customerEmail,
    customerName,
}: {
    accessToken: string;
    customerEmail: string;
    customerName: string;
}) {
    // Validate inputs
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

        // Check Firestore for existing contact
        const contactRef = adminDb.collection('zohoContact').where('email', '==', customerEmail);
        const contactSnapshot = await contactRef.get();

        if (!contactSnapshot.empty) {
            const contactDoc = contactSnapshot.docs[0];
            const contactData = contactDoc.data();
            if (contactData.zohoContactId) {
                return contactData.zohoContactId;
            }
        }

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

        if (!createRes.ok || createData.code !== 0) {
            throw new Error(`Contact creation failed: code=${createData.code}, message=${createData.message}`);
        }

        const contactId = createData?.contact?.contact_id;
        if (!contactId) {
            throw new Error("No contact ID returned from Zoho");
        }

        await adminDb.collection('zohoContact').add({
            email: customerEmail,
            zohoContactId: contactId,
            updatedAt: FieldValue.serverTimestamp(),
        })

        return contactId;
    } catch (error: unknown) {
        console.error("getOrCreateZohoContact failed:", {
            error: error instanceof Error ? error.message : String(error),
            customerEmail,
            customerName,
            accessToken: accessToken ? "Provided" : "Missing",
        });
        throw error;
    }
}