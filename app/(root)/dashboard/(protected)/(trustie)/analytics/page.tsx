import MemberGrowthChart from '@/components/charts/MemberGrowthChart'
import TrustieGrowthChart from '@/components/charts/TrustieGrowthChart'
import UpperTrustieGrowthChart from '@/components/charts/UpperTrustieGrowthChart'
import { Card } from '@/components/ui/card'
import React from 'react'

const page = () => {
  return (
    <div className='w-full'>
      <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-5'>
        <Card className='p-5'>
          <MemberGrowthChart />
        </Card>
        <Card className='p-5'>
          <TrustieGrowthChart />
        </Card>
      </div>
      <div className='w-full grid grid-cols-1 gap-5 mt-5'>
        <Card className='p-5'>
          <UpperTrustieGrowthChart />
        </Card>
      </div>
    </div>
  )
}

export default page