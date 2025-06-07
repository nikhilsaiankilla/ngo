import DonationForm from '@/components/forms/DonationForm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation'; // 'unauthorized' doesn't exist
import React from 'react';

const Page = async () => {
  const cookiesStore = await cookies(); // don't need await, it's synchronous
  const userId = cookiesStore.get('userId')?.value;

  if (!userId) {
    return redirect('/unauthorized'); // or wherever you want to handle unauthorized
  }

  return (
    <div>
      <DonationForm userId={userId} />
    </div>
  );
};

export default Page;
