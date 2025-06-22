"use server";

import { cookies } from "next/headers";

export const getCookiesFromServer = async () => {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    const accessToken = cookieStore.get('accessToken')?.value;

    return { userId, accessToken }
}