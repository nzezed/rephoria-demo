'use client'

import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
} 