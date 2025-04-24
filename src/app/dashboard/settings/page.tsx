'use client'

import { signOut } from 'next-auth/react'
import { Card, Title, Text, Button } from '@tremor/react'

export default function SettingsPage() {
  return (
    <main className="space-y-6 p-8">
      <div className="space-y-2">
        <Title>Settings</Title>
        <Text>Manage your account and billing preferences.</Text>
      </div>

      <Card>
        <Title>Account</Title>
        <div className="mt-4 space-y-4">
          <Button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            size="md"
            color="red"
          >
            Sign Out
          </Button>
        </div>
      </Card>

      <Card>
        <Title>Billing</Title>
        <div className="mt-4 space-y-4">
          <Text>Your subscription and payment details will appear here.</Text>
          <Button
            onClick={() => window.alert('Billing portal coming soon!')}
            size="md"
            color="blue"
          >
            Manage Billing
          </Button>
        </div>
      </Card>
    </main>
  )
} 