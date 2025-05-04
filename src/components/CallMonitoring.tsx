'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Call } from '@prisma/client';

interface CallStats {
  totalCalls: number;
  activeCalls: number;
  averageDuration: number;
  callsByStatus: Record<string, number>;
}

export function CallMonitoring() {
  const [stats, setStats] = useState<CallStats>({
    totalCalls: 0,
    activeCalls: 0,
    averageDuration: 0,
    callsByStatus: {},
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/calls/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch call stats:', error);
      }
    }

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCalls}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCalls}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(stats.averageDuration / 60)} min
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Call Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(stats.callsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 