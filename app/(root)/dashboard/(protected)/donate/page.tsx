import DonationForm from '@/components/forms/DonationForm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

const Page = async () => {
  const cookiesStore = await cookies();
  const userId = cookiesStore.get('userId')?.value;

  if (!userId) {
    return redirect('/unauthorized');
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Make a Donation
        </h1>
        <DonationForm userId={userId} />
      </div>
    </div>
  );
};

export default Page;
