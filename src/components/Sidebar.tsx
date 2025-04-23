'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  PhoneIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Live Calls', href: '/dashboard/calls', icon: PhoneIcon },
  { name: 'Agents', href: '/dashboard/agents', icon: UserGroupIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Follow-up', href: '/dashboard/follow-up', icon: ChatBubbleLeftRightIcon },
  { name: 'Batch Process', href: '/dashboard/batch', icon: DocumentDuplicateIcon },
  { name: 'Integrations', href: '/dashboard/integrations', icon: ArrowPathIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-gray-900">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 bg-gradient-to-br from-blue-400 to-blue-600">
            <span className="text-lg font-bold text-white">R</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight">Rephoria AI</span>
            <span className="text-xs text-blue-400">Call Center Intelligence</span>
          </div>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 mx-2
                        ${isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }
                      `}
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
} 