'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TestCall() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isCalling, setIsCalling] = useState(false)
  const [error, setError] = useState('')

  const handleMakeCall = async () => {
    try {
      setIsCalling(true)
      setError('')

      const response = await fetch('/api/calls/make', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: phoneNumber }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to make call')
      }

      // Call initiated successfully
      console.log('Call initiated:', data)
    } catch (error) {
      console.error('Error making call:', error)
      setError(error instanceof Error ? error.message : 'Failed to make call')
    } finally {
      setIsCalling(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make Test Call</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="tel"
              placeholder="Enter phone number (e.g., +1234567890)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button 
            onClick={handleMakeCall} 
            disabled={isCalling || !phoneNumber}
          >
            {isCalling ? 'Calling...' : 'Make Call'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 