import { getOrCreateZohoContact } from "@/actions/getOrCreateZohoContact";

export async function getZohoAccessToken() {
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

    if (!res.ok || !data.access_token) {
        console.error("Failed to refresh Zoho token:", data);
        throw new Error("Unable to get Zoho access token");
    }

    return data.access_token;
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

        console.log('contact id ', contactId);

        if (!contactId) throw new Error("No Zoho contact ID found");

        // Create invoice using existing or newly created contact
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

        return await invoiceRes.json();
    } catch (error: unknown) {
        console.log("Zoho invoice generation failed:", error);
    }
}

export async function sendInvoiceViaZohoMail(invoiceId: string, accessToken: string, email: string) {
    try {
        if (!invoiceId || !accessToken || !email) {
            return
        }

        await fetch(`https://invoice.zoho.in/api/v3/invoices/${invoiceId}/email?organization_id=${process.env.ZOHO_ORG_ID}`, {
            method: "POST",
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to_mail_ids: [email],
                subject: "Thank You for Your Donation – Here's Your Invoice",
                body: `Thank You for Your Support!

                Dear donor,

                We sincerely appreciate your generous contribution. Your support helps us continue our mission to serve the community with greater impact.

                Your official donation invoice is attached to this email.

                If you do not see the attachment, you can always download it from your dashboard on our website

                Thank you once again for being a part of our journey. Every donation counts 💚

                Hussaini Welfare Association`,
            })

        });

        return true
    } catch (error: unknown) {
        console.log(error);
    }
}