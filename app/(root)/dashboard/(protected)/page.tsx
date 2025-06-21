import { getUser } from "@/actions/auth";
import EventCard from "@/components/cards/EventCard";
import ServiceCard from "@/components/cards/ServiceCard";
import { CardTitle } from "@/components/ui/card";
import { adminDb } from "@/firebase/firebaseAdmin";
import { ArrowRight, Calendar, Heart, Wallet } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DataTable } from "./(upper-trustie)/manage-members/data-table";
import { columns } from "./(member)/my-donations/columns";
import { Transaction } from "./(member)/my-donations/page";
import { Service } from "./services/page";
import { Event } from "./events/page";
import AttendanceStatus from "@/components/AttendanceStatus";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Dashboard'
}

type User = {
  name: string;
  email: string;
  user_type: "REGULAR" | "MEMBER" | "TRUSTIE" | "UPPER_TRUSTIE"
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return redirect('/');
  }

  const res = await getUser(userId);
  const user: User = {
    name: res?.data?.name || "",
    email: res?.data?.email || "",
    user_type: res?.data?.user_type || "REGULAR"
  };

  const [donationSnap, serviceSnap, eventSnap] = await Promise.all([
    user.email
      ? adminDb
        .collection("transactions")
        .where("email", "==", user.email)
        .orderBy("timestamp", "desc")
        .limit(5)
        .select('razorpay_payment_id', 'captured', 'method', 'status', 'amount', 'invoice_url', 'timestamp')
        .get()
      : Promise.resolve(null),
    adminDb
      .collection("services")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get(),
    adminDb
      .collection("events")
      .orderBy("startDate", "desc")
      .limit(1)
      .get(),
  ]);

  let transactions: Transaction[] = [];

  if (donationSnap && !donationSnap.empty) {
    transactions = donationSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        razorpay_payment_id: data.razorpay_payment_id || "",
        amount: Number(data.amount) || 0,
        captured: data.captured || false,
        method: data.method || "N/A",
        status: data.status || "N/A",
        timestamp: data.timestamp?.toDate().toISOString() || "",
        invoice_url: data.invoice_url || "",
      };
    });
  }

  const latestServiceDoc = serviceSnap.empty ? null : serviceSnap.docs[0];
  const latestEventDoc = eventSnap.empty ? null : eventSnap.docs[0];

  const service: Service | null = latestServiceDoc
    ? {
      id: latestServiceDoc.id,
      ...latestServiceDoc.data(),
    } as Service
    : null;

  const event: Event | null = latestEventDoc
    ? {
      id: latestEventDoc.id,
      ...latestEventDoc.data(),
    } as Event
    : null;

  const formatRole = (user_type: string) => {
    if (user_type === 'REGULAR') {
      return 'Regular'
    }

    if (user_type === 'MEMBER') {
      return 'Member'
    }

    if (user_type === 'TRUSTIE') {
      return 'Trustie'
    }

    if (user_type === 'UPPER_TRUSTIE') {
      return 'Upper Trustie'
    }
  }


  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <CardTitle className="text-3xl font-semibold text-gray-800">
          🖐 Hey {user?.name || "User"}, Welcome Back
        </CardTitle>
        <p className="text-sm text-gray-500 mt-2">Here's what's new for you today.</p>

        {user?.user_type && (
          <span className="inline-block mt-2 text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full border-2 border-green-400">
            Current Role: {formatRole(user.user_type)}
          </span>
        )}
      </div>

      <div className="w-full">
        {
          user?.user_type !== "UPPER_TRUSTIE" && <AttendanceStatus />
        }
      </div>

      {/* CTA Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
        {/* Donate Button */}
        <Link
          href="/dashboard/donate"
          className="group relative w-full rounded-2xl flex items-center justify-center gap-2 px-6 py-20 bg-success text-white text-lg font-semibold hover:opacity-90 transition-all"
        >
          <span className="absolute inset-0 bg-glow opacity-20 blur-md group-hover:opacity-30 transition duration-300 z-0" />
          <span className="relative z-10 flex items-center gap-3"><Heart size={20} /> Donate Now</span>
        </Link>

        {/* Upgrade Button – only if not upper_trustie */}
        {user?.user_type !== "UPPER_TRUSTIE"
          ? (
            <Link
              href="/dashboard/profile"
              className="group relative w-full rounded-2xl flex items-center justify-center gap-2 px-6 py-5 bg-danger text-white text-lg font-semibold hover:opacity-90 transition-all"
            >
              <span className="absolute inset-0 bg-glow opacity-20 blur-md group-hover:opacity-30 transition duration-300 z-0" />
              <span className="relative z-10">🚀 Upgrade Membership</span>
            </Link>
          )
          :
          <AttendanceStatus />
        }
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {service && <ServiceCard service={service} isDashboard={true} />}
        {event && <EventCard event={event} isDashboard={true} />}

        {/* Button Section */}
        <div className="w-full flex flex-col justify-between gap-3 overflow-hidden shadow-sm">
          <Link
            href='/dashboard/services'
            className="group relative w-full rounded-2xl flex-1 flex items-center justify-center gap-2 px-6 py-6 bg-warn text-white text-lg font-semibold transition-all duration-300 hover:opacity-90"
          >
            <span className="absolute inset-0 bg-glow opacity-20 blur-md group-hover:opacity-30 transition duration-300 z-0 rounded-none" />
            <span className="relative z-10 flex items-center gap-2">
              <Calendar size={20} />
              View All Services
            </span>
          </Link>

          <Link
            href='/dashboard/events'
            className="group relative w-full rounded-2xl flex-1 flex items-center justify-center gap-2 px-6 py-6 bg-brand text-white text-lg font-semibold transition-all duration-300 hover:opacity-90"
          >
            <span className="absolute inset-0 bg-glow opacity-20 blur-md group-hover:opacity-30 transition duration-300 z-0 rounded-none" />
            <span className="relative z-10 flex items-center gap-2">
              <Calendar size={20} />
              View All Events
            </span>
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Wallet size={20} className="text-warn" /><span>Recent Donations</span>
            </h2>
            <p className="text-sm text-muted mt-1">
              Here are your most recent contributions — thank you for supporting us!
            </p>
          </div>

          <Link
            href='/dashboard/my-donations'
            className="flex items-center gap-1 text-sm font-medium text-warn hover:underline"
          >
            View All Donations
            <ArrowRight className="h-4 w-4 -rotate-45" />
          </Link>
        </div>
        <DataTable columns={columns} data={transactions} />
      </div>
    </div>
  );
}
