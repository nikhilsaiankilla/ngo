import MemberGrowthChart from '@/components/charts/MemberGrowthChart'
import { Card } from '@/components/ui/card'
import React from 'react'

const page = () => {
  return (
    <div className='w-full'>
      <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-5'>
        <Card className='p-5'>
          <MemberGrowthChart year={2025} />
        </Card>
        <Card className='p-5'>
          <MemberGrowthChart year={2025} />
        </Card>
      </div>
    </div>
  )
}

export default page