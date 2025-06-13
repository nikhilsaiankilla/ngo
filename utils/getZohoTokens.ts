export async function exchangeCodeForTokens() {
    const res = await fetch("https://accounts.zoho.in/oauth/v2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: "1000.USN4OE9ZRRLVHZ13E2YXSH5AG1YQJA",
            client_secret: "6d38b071a11a64751c4680eeff14e7e0165a16139b",
            redirect_uri: "https://ngo-two-ivory.vercel.app/",
            code: "1000.27b1f4490d43033e1aa1b85a483f6571.259ff381f2dc461e072b0bd998670d6b",
        }),
    });

    const data = await res.json();
    console.log(data);
}

// {
//   access_token: '1000.641bf9d898b86e56c8ad758e783ba71d.9bf3324a1d252b3ea95c9acd799d0849',
//   refresh_token: '1000.0825c4e7186b944ca1959a47b912b4ed.c2adb2f60e2c62c20b51ff905f307144',
//   scope: 'ZohoInvoice.invoices.CREATE ZohoInvoice.contacts.CREATE ZohoInvoice.invoices.READ',
//   api_domain: 'https://www.zohoapis.in',
//   token_type: 'Bearer',
//   expires_in: 3600
// }