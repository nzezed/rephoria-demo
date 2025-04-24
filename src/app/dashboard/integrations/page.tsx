'use client'

import { useState, useEffect, FormEvent } from 'react'
import {
  Card, Title, Text, Button,
  Table, TableHead, TableRow, TableHeaderCell,
  TableBody, TableRow as BodyRow, TableCell,
  TextInput, TextArea,
} from '@tremor/react'

interface Integration {
  id: string
  provider: string
  type: string
  config: Record<string, any>
  status: string
  createdAt: string
}

export default function IntegrationsPage() {
  const [list, setList] = useState<Integration[]>([])
  const [provider, setProvider] = useState('')
  const [type, setType] = useState('')
  const [configJSON, setConfigJSON] = useState('{}')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  async function fetchIntegrations() {
    try {
      const res = await fetch('/api/integrations')
      const data = await res.json()
      setList(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setError('Failed to load integrations')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    let config: any
    try {
      config = JSON.parse(configJSON)
    } catch {
      setError('Config must be valid JSON')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, type, config }),
      })
      if (!res.ok) throw new Error('Failed to create')
      setProvider('')
      setType('')
      setConfigJSON('{}')
      await fetchIntegrations()
    } catch (err) {
      console.error(err)
      setError('Error creating integration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-4xl space-y-8">
      <Title>Integrations</Title>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <Text>Provider</Text>
              <TextInput
                placeholder="e.g. steam-connect"
                value={provider}
                onChange={(e) => setProvider(e.currentTarget.value)}
                required
              />
            </div>
            <div className="flex-1">
              <Text>Type</Text>
              <TextInput
                placeholder="e.g. call_platform"
                value={type}
                onChange={(e) => setType(e.currentTarget.value)}
                required
              />
            </div>
          </div>

          <div>
            <Text>Config (JSON)</Text>
            <TextArea
              rows={4}
              value={configJSON}
              onChange={(e) => setConfigJSON(e.currentTarget.value)}
              className="w-full font-mono text-sm"
            />
          </div>

          {error && <Text className="text-red-500">{error}</Text>}
          <Button type="submit" loading={loading}>
            Add Integration
          </Button>
        </form>
      </Card>

      <Card>
        <Title>Existing Integrations</Title>
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Provider</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((i) => (
              <BodyRow key={i.id}>
                <TableCell>{i.provider}</TableCell>
                <TableCell>{i.type}</TableCell>
                <TableCell>{i.status}</TableCell>
                <TableCell>
                  {new Date(i.createdAt).toLocaleDateString()}
                </TableCell>
              </BodyRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  )
}