export async function getOrCreateZohoContact({
    accessToken,
    customerEmail,
    customerName,
}: {
    accessToken: string;
    customerEmail: string;
    customerName: string;
}) {
    const orgId = process.env.ZOHO_ORG_ID!;

    // 🔍 1. Try to search for existing contact
    const searchRes = await fetch(
        `https://invoice.zoho.in/api/v3/contacts?email=${customerEmail}&organization_id=${orgId}`,
        {
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
        }
    );

    const searchData = await searchRes.json();

    console.log(searchData);
    
    if (searchData.contacts && searchData.contacts.length > 0) {
        return searchData.contacts[0].contact_id;
    }

    // ✍️ 2. Create new contact
    const createRes = await fetch(
        `https://invoice.zoho.in/api/v3/contacts?organization_id=${process.env.ZOHO_ORG_ID}`,
        {
            method: "POST",
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contact_name: customerName,
                contact_persons: [{ email: customerEmail }],
            }),
        }
    );

    const createData = await createRes.json();

    return createData?.contact?.contact_id;
}
