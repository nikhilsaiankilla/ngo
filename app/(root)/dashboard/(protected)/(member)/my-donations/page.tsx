import { cookies } from "next/headers";
import { adminDb } from "@/firebase/firebaseAdmin";
import { notFound, unauthorized } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timestamp } from "firebase-admin/firestore";
import { DataTable } from "../../(upper-trustie)/manage-members/data-table";
import { columns } from "./columns";
import { ArrowLeft, ArrowRight } from "lucide-react";
import DownloadDonations from "@/components/buttons/DownloadDonations";

export interface Transaction {
  razorpay_payment_id: string;
  captured: boolean;
  method: string;
  status: string;
  timestamp: string;
  amount: number;
  invoice_url: string;
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const ITEMS_PER_PAGE = 20;

const page = async ({ searchParams }: PageProps) => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  const params = await searchParams;
  const cursor = typeof params.cursor === "string" ? params.cursor : undefined;

  if (!userId) return unauthorized();

  const userSnap = await adminDb.collection("users").doc(userId).get();
  if (!userSnap.exists) return notFound();

  const userData = userSnap.data();
  const userType = userData?.user_type as
    | "REGULAR"
    | "MEMBER"
    | "TRUSTIE"
    | "UPPER_TRUSTIE"
    | undefined;

  if (!userType || !["REGULAR", "MEMBER", "TRUSTIE", "UPPER_TRUSTIE"].includes(userType))
    return notFound();

  const email = userData?.email;

  let transactions: Transaction[] = [];
  let hasNextPage = false;
  let nextCursor: string | null = null;
  let errorMessage: string | null = null;

  try {
    let query = adminDb
      .collection("transactions")
      .where("email", "==", email)
      .orderBy("timestamp", "desc")
      .limit(ITEMS_PER_PAGE + 1)
      .select(
        "razorpay_payment_id",
        "captured",
        "method",
        "status",
        "amount",
        "invoice_url",
        "timestamp"
      );

    if (cursor) {
      const cursorDoc = await adminDb.collection("transactions").doc(cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.get();
    const docs = snapshot.docs;

    hasNextPage = docs.length > ITEMS_PER_PAGE;
    const paginatedDocs = hasNextPage ? docs.slice(0, -1) : docs;

    transactions = paginatedDocs.map((doc) => {
      const data = doc.data();
      return {
        razorpay_payment_id: data.razorpay_payment_id || "",
        amount: Number(data.amount) || 0,
        captured: data.captured || false,
        method: data.method || "N/A",
        status: data.status || "N/A",
        timestamp: data.timestamp
          ? Timestamp.fromMillis(data.timestamp._seconds * 1000).toDate().toISOString()
          : "",
        invoice_url: data?.invoice_url || "",
      };
    });

    nextCursor = hasNextPage ? docs[docs.length - 2]?.id : null;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    errorMessage = "Error loading donations. Please try again later.";
  }

  return (
    <div className="w-full mx-auto py-12 px-6">
      {/* Always visible header */}
      <div className="w-full flex items-center justify-between flex-wrap">

        <h1 className="text-3xl font-extrabold mb-8 text-gray-900">Your Donations</h1>
        <DownloadDonations />
      </div>

      {/* Error message if any */}
      {errorMessage && (
        <div className="text-red-500 text-center mb-8">{errorMessage}</div>
      )}

      {/* If no error and no transactions */}
      {!errorMessage && transactions.length === 0 && (
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="pt-10 pb-8 flex flex-col items-center">
            <p className="text-gray-600 text-lg mb-6 text-center">
              No donations found.
            </p>
            <Link href="/dashboard/donate" passHref>
              <Button
                className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white transition"
                size="lg"
              >
                Make a Donation
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Show Data Table if data exists */}
      {!errorMessage && transactions.length > 0 && (
        <>
          <DataTable columns={columns} data={transactions} />

          <div className="flex justify-between mt-10">
            {cursor && (
              <Link href="/dashboard/my-donations" passHref>
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-100 transition flex items-center"
                >
                  <ArrowLeft size={20} /> Previous
                </Button>
              </Link>
            )}
            {hasNextPage && nextCursor && (
              <Link href={`/dashboard/my-donations?cursor=${nextCursor}`} passHref>
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-100 transition flex items-center"
                >
                  Next <ArrowRight size={20} />
                </Button>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default page;
