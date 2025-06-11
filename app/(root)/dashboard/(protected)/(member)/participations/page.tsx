import { adminDb } from '@/firebase/firebaseAdmin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DataTable } from '../../(upper-trustie)/manage-members/data-table';
import { attendanceColumns } from './columns';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type AttendanceRecord = {
  eventId: string;
  userId: string;
  attended: 'attended' | 'not_attended' | 'not_confirmed';
  confirmedAt: string | null;
};

const PAGE_SIZE = 20;

// Define props type for Next.js App Router
interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const page = async ({ searchParams }: PageProps) => {
  const cookiesStore = await cookies();
  const userId = cookiesStore.get('userId')?.value;

  const params = await searchParams; // Await searchParams
  const cursor = typeof params.cursor === 'string' ? params.cursor : undefined;

  if (!userId) {
    redirect('/unauthorized'); // Redirect to unauthorized page
  }

  let attendanceQuery = adminDb
    .collection('event_attendance')
    .where('userId', '==', userId)
    .orderBy('confirmedAt', 'desc')
    .select('userId', 'eventId', 'attended', 'confirmedAt')
    .limit(PAGE_SIZE);

  if (cursor) {
    try {
      const cursorDoc = await adminDb.collection('event_attendance').doc(cursor).get();
      if (cursorDoc.exists) {
        attendanceQuery = attendanceQuery.startAfter(cursorDoc);
      }
    } catch (error) {
      console.error('Error fetching cursor document:', error);
    }
  }

  let enrichedEvents = [];

  try {
    const attendanceSnapshot = await attendanceQuery.get();

    const attendanceList = attendanceSnapshot.docs.map((doc) => {
      const data = doc.data() as AttendanceRecord;
      return {
        id: doc.id,
        ...data,
      };
    });

    enrichedEvents = await Promise.all(
      attendanceList.map(async (attendance) => {
        const eventSnap = await adminDb.collection('events').doc(attendance.eventId).get();
        const eventData = eventSnap.exists ? eventSnap.data() : null;

        return {
          ...attendance,
          eventTitle: eventData?.title ?? 'Unknown Event',
          eventDate: eventData?.startDate
            ?.toDate()
            .toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }) ?? null,
        };
      })
    );
  } catch (error: unknown) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-2xl font-semibold mb-4">Your Participations</h1>
        <p className="text-red-500">Something went Wrong while Fetching</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Event Attendance</h1>

      <DataTable columns={attendanceColumns} data={enrichedEvents} />

      {cursor && (
        <div className="mt-6 flex justify-end">
          <Link
            href={`?cursor=${cursor}`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
          >
            Next Page <ArrowRight />
          </Link>
        </div>
      )}
    </div>
  );
};

export default page;