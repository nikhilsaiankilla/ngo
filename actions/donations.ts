"use server"

import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";

export async function downloadDonations(year: number) {
    const cookiesStore = await cookies();
    const userId = cookiesStore.get("userId")?.value;
    if (!userId) return { success: false, message: "Unauthorized" };

    try {
        const userSnap = await adminDb.collection("users").doc(userId).get();
        const email = userSnap.data()?.email;
        if (!email) return { success: false, message: "User not found" };

        const start = Timestamp.fromDate(new Date(`${year}-01-01T00:00:00Z`));
        const end = Timestamp.fromDate(new Date(`${year + 1}-01-01T00:00:00Z`));

        const snapshot = await adminDb
            .collection("transactions")
            .where("email", "==", email)
            .where("timestamp", ">=", start)
            .where("timestamp", "<", end)
            .get();

        if (snapshot.empty) {
            return { success: false, message: "No donations found" };
        }

        const donations = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                razorpay_payment_id: data.razorpay_payment_id || "-",
                amount: data.amount || 0,
                method: data.method || "-",
                status: data.status || "-",
                timestamp: data.timestamp.toDate().toLocaleString(),
                invoice_url: data.invoice_url || "-",
            };
        });

        return { success: true, data: donations };
    } catch (err) {
        return { success: false, message: getErrorMessage(err) };
    }
}
