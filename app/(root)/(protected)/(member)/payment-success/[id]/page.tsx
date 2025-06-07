// app/payment-success/page.tsx
import { adminDb } from "@/firebase/firebaseAdmin";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

const PaymentSuccessPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  if (!id) return notFound();

  // Fetch payment details directly from your DB
  const fetchedPayment = await adminDb.collection('transactions').where('payment_id', "==", id).limit(1).get();

  const payment = fetchedPayment.empty ? null : fetchedPayment.docs[0].data();

  if (!payment) return notFound();

  return (
    <div className="max-w-xl mx-auto bg-white p-6 mt-10 shadow rounded-xl text-gray-800">
      <h1 className="text-2xl font-bold text-green-600 mb-4">🎉 Payment Successful!</h1>

      <div className="space-y-2">
        <p><strong>Payment ID:</strong> {payment.payment_id}</p>
        <p><strong>Amount:</strong> ₹{payment.amount}</p>
        <p><strong>Status:</strong> {payment.status}</p>
        <p><strong>Method:</strong> {payment.method}</p>
        <p><strong>Currency:</strong> {payment.currency}</p>
        <p><strong>Email:</strong> {payment.email}</p>
        <p><strong>Contact:</strong> {payment.contact}</p>
        {payment.notes && <p><strong>Note:</strong> {payment.notes}</p>}
      </div>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg">
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
