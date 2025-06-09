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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const ITEMS_PER_PAGE = 5;

const Page = async ({ searchParams }: PageProps) => {
  const cookieStore = await cookies();

  const userId = cookieStore.get("userId")?.value;

  const params = await searchParams;  // <-- await here

  const cursor = typeof params.cursor === 'string' ? params.cursor : undefined;

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
    <div className="w-full mx-auto py-12 px-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900">
        Your Donations
      </h1>

      {transactions.length === 0 ? (
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="pt-10 pb-8 flex flex-col items-center">
            <p className="text-gray-600 text-lg mb-6 text-center">
              No donations found.
            </p>
            <Link href="/donate" passHref>
              <Button
                className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white transition"
                size="lg"
              >
                Make a Donation
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-6">
          {transactions.map((txn) => (
            <Card
              key={txn.razorpay_payment_id}
              className="w-full border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="bg-blue-50 rounded-t-lg p-4">
                <CardTitle className="text-xl font-semibold text-blue-800">
                  Donation: ₹{txn.amount.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <p className="text-sm text-gray-500">
                  {txn.timestamp.toDate().toLocaleString() || "Unknown"}
                </p>
                <p className="text-sm text-gray-700 font-medium">
                  Method: <span className="capitalize">{txn.method}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </ul>
      )}

      <div className="flex justify-between mt-10">
        {cursor && (
          <Link href="/dashboard/my-donations" passHref>
            <Button
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-100 transition"
            >
              ← Previous
            </Button>
          </Link>
        )}
        {hasNextPage && nextCursor && (
          <Link href={`/dashboard/my-donations?cursor=${nextCursor}`} passHref>
            <Button
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-100 transition"
            >
              Next →
            </Button>
          </Link>
        )}
      </div>
    </div>

  );
};

export default Page;