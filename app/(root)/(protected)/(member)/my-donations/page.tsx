import { cookies } from "next/headers";
import { adminDb } from "@/firebase/firebaseAdmin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Shadcn UI Card
import { Button } from "@/components/ui/button"; // Shadcn UI Button
import { Timestamp } from "firebase-admin/firestore"; // For Firestore Timestamp

// Define Transaction interface
interface Transaction {
  id: string;
  razorpay_payment_id: string;
  amount: number;
  timestamp: Timestamp;
  method: string;
  userId: string;
}

// Define props type for Next.js App Router
interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

const ITEMS_PER_PAGE = 1;

const Page = async ({ searchParams }: PageProps) => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  // Check authentication
  if (!userId) {
    return notFound();
  }

  // Verify user exists and has appropriate role
  const userSnap = await adminDb.collection("users").doc(userId).get();
  if (!userSnap.exists) {
    return notFound();
  }

  const userData = userSnap.data();
  const userType = userData?.user_type as "REGULAR" | "MEMBER" | "TRUSTIE" | "UPPER_TRUSTIE" | undefined;
  if (!userType || !["MEMBER", "TRUSTIE", "UPPER_TRUSTIE"].includes(userType)) {
    return notFound(); // Restrict to MEMBER and above
  }

  const cursor = searchParams.cursor as string | undefined;

  // Build Firestore query
  let query = adminDb
    .collection("transactions")
    .where("userId", "==", userId)
    .orderBy("timestamp", "desc")
    .limit(ITEMS_PER_PAGE + 1);

  if (cursor) {
    try {
      const cursorDoc = await adminDb.collection("transactions").doc(cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    } catch (error) {
      console.error("Error fetching cursor document:", error);
    }
  }

  // Fetch transactions
  let transactions: Transaction[] = [];
  let hasNextPage = false;
  let nextCursor: string | null = null;

  try {
    const snapshot = await query.get();
    const docs = snapshot.docs;

    hasNextPage = docs.length > ITEMS_PER_PAGE;
    const paginatedDocs = hasNextPage ? docs.slice(0, -1) : docs;

    transactions = paginatedDocs.map((doc) => ({
      id: doc.id,
      razorpay_payment_id: doc.data().razorpay_payment_id || "",
      amount: doc.data().amount || 0,
      timestamp: doc.data().timestamp || Timestamp.now(),
      method: doc.data().method || "N/A",
      userId: doc.data().userId || "",
    }));

    nextCursor = hasNextPage ? docs[docs.length - 2]?.id : null;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return (
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-2xl font-semibold mb-4">Your Donations</h1>
        <p className="text-red-500">Error loading donations. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">Your Donations</h1>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center">No donations found.</p>
            <Link href="/donate">
              <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white">
                Make a Donation
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {transactions.map((txn) => (
            <Card key={txn.razorpay_payment_id}>
              <CardHeader>
                <CardTitle className="text-lg">Donation: ₹{txn.amount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {txn.timestamp.toDate().toLocaleString() || "Unknown"}
                </p>
                <p className="text-sm text-gray-700">Method: {txn.method}</p>
              </CardContent>
            </Card>
          ))}
        </ul>
      )}

      <div className="flex justify-between mt-6">
        {cursor && (
          <Link href="/my-donations">
            <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              Previous
            </Button>
          </Link>
        )}
        {hasNextPage && nextCursor && (
          <Link href={`/my-donations?cursor=${nextCursor}`}>
            <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              Next
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Page;