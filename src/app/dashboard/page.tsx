'use client'

import { useEffect, useState } from 'react'
import { Title, Text, Card } from '@tremor/react'
import { CallMonitoring } from '../../components/CallMonitoring'

export default function Dashboard() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Dashboard</Title>
      <Text>Overview of your call center performance</Text>
      
      <div className="mt-6">
        <CallMonitoring />
      </div>

      <div className="mt-6">
        <Card>
          <Title>Detailed Analytics</Title>
          <Text>Connect a call platform integration to view detailed analytics.</Text>
        </Card>
      </div>
    </main>
  )
} 