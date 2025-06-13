
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
        // Search for existing contact
        console.log(`Searching for Zoho contact with email: ${customerEmail}`);
        const searchRes = await fetch(
            `https://invoice.zoho.in/api/v3/contacts?email=${encodeURIComponent(customerEmail)}&organization_id=${orgId}`,
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
                },
            }
        );
        const searchData = await searchRes.json();
        console.log("Zoho contact search response:", JSON.stringify(searchData, null, 2));

        if (!searchRes.ok || searchData.code !== 0) {
            throw new Error(`Contact search failed: code=${searchData.code}, message=${searchData.message}`);
        }

        if (searchData.contacts && searchData.contacts.length > 0) {
            const contactId = searchData.contacts[0].contact_id;
            console.log(`Found existing Zoho contact: ${contactId}`);
            return contactId;
        }

        // Create new contact
        console.log(`Creating new Zoho contact: name=${customerName}, email=${customerEmail}`);
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
        console.log("Zoho contact creation response:", JSON.stringify(createData, null, 2));

        if (!createRes.ok || createData.code !== 0) {
            throw new Error(`Contact creation failed: code=${createData.code}, message=${createData.message}`);
        }

        const contactId = createData?.contact?.contact_id;
        if (!contactId) {
            throw new Error("No contact ID returned from Zoho");
        }
        console.log(`Created new Zoho contact: ${contactId}`);
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