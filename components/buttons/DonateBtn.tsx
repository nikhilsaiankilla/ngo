import Link from 'next/link'
import { Heart } from 'lucide-react'
import React from 'react'

const DonateBtn = () => {
  return (
    <Link
      href='/donate'
      className='relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-warn text-white font-semibold shadow-md hover:bg-brand transition-all duration-300 ease-in-out group overflow-hidden'
    >
      {/* Soft glow using your color theme */}
      <span className='absolute inset-0 rounded-2xl bg-glow opacity-20 blur-md group-hover:opacity-40 group-hover:blur-lg transition duration-300 z-0'></span>

      <Heart size={18} className='z-10' />
      <span className='z-10'>Donate</span>
    </Link>
  )
}

export default DonateBtn
