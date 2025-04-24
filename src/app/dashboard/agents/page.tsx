'use client'

import React, { useState, useEffect } from 'react'
import { Card, Title, Text } from '@tremor/react'

interface Agent {
  id: string
  name: string
  createdAt: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])

  async function fetchAgents() {
    try {
      const res = await fetch('/api/agents')
      if (res.ok) {
        const data = await res.json()
        setAgents(data)
      }
    } catch (error) {
      console.error('Failed to fetch agents', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    setLoading(true)
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const newAgent = await res.json()
        setAgents(prev => [newAgent, ...prev])
        setName('')
      }
    } catch (error) {
      console.error('Failed to add agent', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <Title>Agents</Title>
        <Text>Manage your call center agents.</Text>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="Agent name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="px-3 py-2 rounded bg-gray-800 text-white flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Agent'}
          </button>
        </form>

        <div className="space-y-2">
          {agents.length > 0 ? (
            agents.map(agent => (
              <div
                key={agent.id}
                className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
              >
                <Text className="font-medium">{agent.name}</Text>
                <Text className="text-sm text-gray-500">
                  Created {new Date(agent.createdAt).toLocaleDateString()}
                </Text>
              </div>
            ))
          ) : (
            <Text>No agents found. Add your first agent above.</Text>
          )}
        </div>
      </Card>
    </main>
  )
} 