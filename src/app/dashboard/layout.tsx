'use client'

import Sidebar from '@/components/Sidebar'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }
  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
} 