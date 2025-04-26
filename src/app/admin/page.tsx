'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  Title,
  Text,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Button,
  Select,
  SelectItem,
} from '@tremor/react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AdminUser, UserRole } from '@/lib/admin/types'

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { data: session } = useSession()

  // Protect the route
  useEffect(() => {
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [session, router])

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users')
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        ))
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ))
      }
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId))
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  if (!session?.user || session.user.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <Card>
          <div className="h-64 bg-gray-200 rounded"></div>
        </Card>
      </div>
    )
  }

  return (
    <main className="p-4">
      <div className="space-y-2 mb-6">
        <Title>Admin Dashboard</Title>
        <Text>Manage users and their permissions</Text>
      </div>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Last Login</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.name || '-'}</TableCell>
                <TableCell>
                  <Select 
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                  >
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge color={user.isActive ? 'emerald' : 'red'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.lastLoginAt 
                    ? new Date(user.lastLoginAt).toLocaleDateString()
                    : 'Never'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="xs"
                      color={user.isActive ? 'red' : 'emerald'}
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                    >
                      {user.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      variant="secondary"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  )
} 