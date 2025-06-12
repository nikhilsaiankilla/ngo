import React from 'react'
import MemberGrowthChart from '@/components/charts/MemberGrowthChart'
import TrustieGrowthChart from '@/components/charts/TrustieGrowthChart'
import UpperTrustieGrowthChart from '@/components/charts/UpperTrustieGrowthChart'
import UserGrowthOtherThenRegular from '@/components/charts/UserGrowthOtherThenRegular'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DonationsPerYear from '@/components/charts/DonationsPerYear'
import UserAnalytics from '@/components/UserAnalytics'
import DonationAnalytics from '@/components/DonationAnalytics'

const AnalyticsPage = () => {

  return (
    <div className='w-full space-y-6'>
      {/* Toggle Buttons */}
      <div className='flex gap-4'>
        <Tabs defaultValue="user-analytics" className="w-full">
          <TabsList>
            <TabsTrigger value="user-analytics">User Analytics</TabsTrigger>
            <TabsTrigger value="donation-analytics">Donation Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="user-analytics" className='w-full'>
            <UserAnalytics />
          </TabsContent>
          <TabsContent value="donation-analytics" className='w-full'>
            <DonationAnalytics />
          </TabsContent>
        </Tabs>
      </div>

    </div>
  )
}

export default AnalyticsPage
