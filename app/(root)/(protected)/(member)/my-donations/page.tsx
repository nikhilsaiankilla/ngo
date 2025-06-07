import { adminDb } from '@/firebase/firebaseAdmin';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import React from 'react';

const ITEMS_PER_PAGE = 1;

const Page = async ({ searchParams }: { searchParams: { cursor?: string } }) => {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) return notFound();

  const userSnap = await adminDb.collection('users').doc(userId).get();
  if (!userSnap.exists) return notFound();

  const cursor = searchParams?.cursor ?? null;

  let query = adminDb
    .collection('transactions')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(ITEMS_PER_PAGE + 1); // fetch 1 extra to check for next page

  if (cursor) {
    const cursorDoc = await adminDb.collection('transactions').doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.get();
  const docs = snapshot.docs;

  const hasNextPage = docs.length > ITEMS_PER_PAGE;
  const paginatedDocs = hasNextPage ? docs.slice(0, -1) : docs;

  const transactions = paginatedDocs.map(doc => ({ id: doc.id, ...doc.data() }));

  const nextCursor = hasNextPage ? docs[docs.length - 2]?.id : null;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-4">Your Donations</h1>

      <ul className="space-y-4">
        {transactions.map((txn: any) => (
          <li key={txn.id} className="p-4 bg-white shadow rounded">
            <div className="text-lg font-medium">₹{txn.amount}</div>
            <div className="text-sm text-gray-500">
              {txn.timestamp?.toDate?.().toLocaleString() || 'Unknown'}
            </div>
            <div className="text-sm text-gray-700">Method: {txn.method || 'N/A'}</div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between mt-6">
        {/* This only resets to the first page */}
        {cursor && (
          <a href={`/my-donations`} className="text-blue-600 hover:underline">
            Previous
          </a>
        )}

        {hasNextPage && nextCursor && (
          <a href={`/my-donations?cursor=${nextCursor}`} className="text-blue-600 hover:underline">
            Next
          </a>
        )}
      </div>
    </div>
  );
};

export default Page;
