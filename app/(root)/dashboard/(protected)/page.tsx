import Link from 'next/link'
import React from 'react'

const page = () => {
  // Dummy data
  const user = { name: "Nikhil" }
  const totalDonations = 12
  const totalAmount = 5200
  const successfulPayments = 10
  const pendingPayments = 2

  const recentDonations = [
    { id: 1, date: "2025-06-01", amount: 500, status: "success" },
    { id: 2, date: "2025-06-05", amount: 1200, status: "success" },
    { id: 3, date: "2025-06-07", amount: 1000, status: "pending" },
    { id: 4, date: "2025-06-08", amount: 1500, status: "success" },
    { id: 5, date: "2025-06-09", amount: 1000, status: "pending" },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome back, {user.name}!</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-lg font-semibold">Total Donations</h3>
          <p className="text-2xl font-medium">{totalDonations}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-lg font-semibold">Amount Donated (₹)</h3>
          <p className="text-2xl font-medium">₹{totalAmount}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-lg font-semibold">Successful Payments</h3>
          <p className="text-2xl font-medium">{successfulPayments}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-lg font-semibold">Pending Payments</h3>
          <p className="text-2xl font-medium">{pendingPayments}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Donations</h2>
        <ul>
          {recentDonations.map((donation) => (
            <li
              key={donation.id}
              className="flex justify-between border-b py-2 last:border-none"
            >
              <span>{donation.date}</span>
              <span>₹{donation.amount}</span>
              <span
                className={`font-semibold ${donation.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {donation.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4">
        <Link href='/dashboard/donate' className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-500">
          Make a Donation
        </Link>
        <Link href='/dashboard/profile' className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
          View Profile
        </Link>
      </div>
    </div>
  )
}

export default page
