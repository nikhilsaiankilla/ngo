import { adminDb } from "@/firebase/firebaseAdmin";
import { Cross, Hourglass, PartyPopper } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

const PaymentSuccessPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  if (!id) return notFound();

  // Fetch payment details from Firestore using razorpay_payment_id
  const fetchedPayment = await adminDb
    .collection("transactions")
    .where("razorpay_payment_id", "==", id)
    .get();

  const payment = fetchedPayment.empty ? null : fetchedPayment.docs[0].data();

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg transform transition-all duration-300 animate-fade-in">
          <h1 className="text-3xl font-bold text-red-600 mb-4 text-center">
            Payment Not Found
          </h1>
          <p className="text-gray-500 text-base mb-8 text-center leading-relaxed">
            No payment details found for the provided ID. Please check the ID or contact support.
          </p>
          <Link
            href="/"
            className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  // Determine theme based on payment status
  const status = payment.status?.toLowerCase();
  let themeClass = {
    heading: "text-green-600",
    buttonBg: "bg-emerald-600",
    buttonHover: "hover:bg-emerald-500",
    emoji: <PartyPopper />,
    title: "Payment Successful!",
  };

  if (status === "failed") {
    themeClass = {
      heading: "text-red-600",
      buttonBg: "bg-red-600",
      buttonHover: "hover:bg-red-500",
      emoji: <Cross />,
      title: "Payment Failed",
    };
  } else if (status === "pending") {
    themeClass = {
      heading: "text-yellow-600",
      buttonBg: "bg-yellow-600",
      buttonHover: "hover:bg-yellow-500",
      emoji: <Hourglass />,
      title: "Payment Pending",
    };
  }

  return (
    <div className="w-full mx-auto p-6 mt-10 shadow rounded-xl text-gray-800">
      <h1 className={`text-2xl font-bold ${themeClass.heading} flex items-center gap-2 mb-4`}>
        {themeClass.emoji} {themeClass.title}
      </h1>

      <div className="space-y-2">
        <p>
          <strong>Payment ID:</strong> {payment.razorpay_payment_id || "N/A"}
        </p>
        <p>
          <strong>Amount:</strong>{" "}
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: payment.currency || "INR",
            minimumFractionDigits: 2,
          }).format(payment.amount || 0)}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={themeClass.heading}>
            {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : "N/A"}
          </span>
        </p>
        <p>
          <strong>Method:</strong> {payment.method || "N/A"}
        </p>
        <p>
          <strong>Currency:</strong> {payment.currency || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {payment.email || "N/A"}
        </p>
        <p>
          <strong>Contact:</strong> {payment.contact || "N/A"}
        </p>
        {payment.notes && (
          <p>
            <strong>Note:</strong> {payment.notes}
          </p>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="/"
          className={`inline-block ${themeClass.buttonBg} ${themeClass.buttonHover} text-white px-4 py-2 rounded-lg`}
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;