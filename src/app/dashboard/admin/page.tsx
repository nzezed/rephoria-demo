'use client';

import { useEffect, useState } from 'react';
import { Card, Title, Text, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, Badge } from '@tremor/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [data, setData] = useState({
    users: [],
    organizations: [],
    integrations: [],
    calls: [],
  });
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, orgsRes, integrationsRes, callsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/organizations'),
          fetch('/api/admin/integrations'),
          fetch('/api/admin/calls'),
        ]);

        const [users, organizations, integrations, calls] = await Promise.all([
          usersRes.json(),
          orgsRes.json(),
          integrationsRes.json(),
          callsRes.json(),
        ]);

        setData({ users, organizations, integrations, calls });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, router]);

  if (loading) {
    return <Text>Loading admin dashboard...</Text>;
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Admin Dashboard</Title>
      <Text>Manage all system data</Text>

      <div className="mt-6 space-y-6">
        <Card>
          <Title>Users</Title>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Organization</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.organizationId}</TableCell>
                  <TableCell>
                    <Badge color={user.isActive ? 'green' : 'red'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <Title>Organizations</Title>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Subdomain</TableHeaderCell>
                <TableHeaderCell>Plan</TableHeaderCell>
                <TableHeaderCell>Users</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.organizations.map((org: any) => (
                <TableRow key={org.id}>
                  <TableCell>{org.name}</TableCell>
                  <TableCell>{org.subdomain}</TableCell>
                  <TableCell>{org.plan}</TableCell>
                  <TableCell>{org.users?.length || 0}</TableCell>
                  <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <Title>Integrations</Title>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Provider</TableHeaderCell>
                <TableHeaderCell>Organization</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Last Sync</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.integrations.map((integration: any) => (
                <TableRow key={integration.id}>
                  <TableCell>{integration.provider}</TableCell>
                  <TableCell>{integration.organizationId}</TableCell>
                  <TableCell>
                    <Badge color={integration.status === 'connected' ? 'green' : 'red'}>
                      {integration.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(integration.lastSync).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <Title>Recent Calls</Title>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>From</TableHeaderCell>
                <TableHeaderCell>To</TableHeaderCell>
                <TableHeaderCell>Organization</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Duration</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.calls.map((call: any) => (
                <TableRow key={call.id}>
                  <TableCell>{call.fromNumber}</TableCell>
                  <TableCell>{call.toNumber}</TableCell>
                  <TableCell>{call.organizationId}</TableCell>
                  <TableCell>
                    <Badge color={call.status === 'completed' ? 'green' : 'yellow'}>
                      {call.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{call.duration}s</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </main>
  );
} 