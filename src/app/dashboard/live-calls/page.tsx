'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  Flex,
  Badge,
  Button,
  List,
  ListItem,
} from '@tremor/react';
import {
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { steamConnectService } from '@/services/steam-connect';
import { STEAM_CONNECT_CONFIG } from '@/config/steam-connect';
import type { SteamConnectSession, SteamConnectAgent, SteamConnectQueue } from '@/config/steam-connect';

export default function LiveCallsPage() {
  const [activeSessions, setActiveSessions] = useState<SteamConnectSession[]>([]);
  const [availableAgents, setAvailableAgents] = useState<SteamConnectAgent[]>([]);
  const [queueStatus, setQueueStatus] = useState<SteamConnectQueue | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!STEAM_CONNECT_CONFIG.apiKey) {
      setError('Steam Connect is not configured. Please add your API key to continue.');
      return;
    }

    // Initial data load
    loadData();

    try {
      // Subscribe to real-time updates
      const ws = steamConnectService.subscribeToUpdates((update) => {
        if (update.type === 'session_update') {
          setActiveSessions(prev => 
            prev.map(session => 
              session.sessionId === update.sessionId 
                ? { ...session, ...update.data }
                : session
            )
          );
        } else if (update.type === 'agent_update') {
          setAvailableAgents(prev =>
            prev.map(agent =>
              agent.id === update.agentId
                ? { ...agent, ...update.data }
                : agent
            )
          );
        } else if (update.type === 'queue_update') {
          setQueueStatus(prev => ({ ...prev, ...update.data }));
        }
      });

      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      setError('Failed to connect to Steam Connect. Please check your configuration.');
    }
  }, []);

  const loadData = async () => {
    try {
      const [agents, queueData] = await Promise.all([
        steamConnectService.getAvailableAgents(),
        steamConnectService.getQueueStatus('general'),
      ]);

      setAvailableAgents(agents);
      setQueueStatus(queueData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data from Steam Connect. Please check your configuration.');
    }
  };

  const handleTransferSession = async (sessionId: string, targetAgentId: string) => {
    try {
      await steamConnectService.transferSession(sessionId, targetAgentId);
      // Update will come through WebSocket
    } catch (error) {
      console.error('Error transferring session:', error);
    }
  };

  const getChannelIcon = (channel: SteamConnectSession['channel']) => {
    switch (channel) {
      case 'voice':
        return <PhoneIcon className="h-5 w-5" />;
      case 'chat':
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
    }
  };

  if (error) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Card>
          <Flex alignItems="center" justifyContent="center" className="h-64">
            <div className="text-center space-y-4">
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto" />
              <Title>Configuration Required</Title>
              <Text>{error}</Text>
              <Button
                size="sm"
                onClick={() => window.location.href = '/dashboard/integrations'}
              >
                Configure Steam Connect
              </Button>
            </div>
          </Flex>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mb-6">
        <Card>
          <Flex alignItems="center">
            <div>
              <Text>Active Sessions</Text>
              <Title>{activeSessions.length}</Title>
            </div>
            <Badge color="blue">{queueStatus?.waitingCustomers || 0} in queue</Badge>
          </Flex>
        </Card>
        <Card>
          <Flex alignItems="center">
            <div>
              <Text>Available Agents</Text>
              <Title>{availableAgents.length}</Title>
            </div>
            <Badge color="green">Online</Badge>
          </Flex>
        </Card>
        <Card>
          <Flex alignItems="center">
            <div>
              <Text>Average Wait Time</Text>
              <Title>{queueStatus?.averageWaitTime || 0}m</Title>
            </div>
            <ClockIcon className="h-5 w-5 text-gray-500" />
          </Flex>
        </Card>
      </Grid>

      <TabGroup>
        <TabList>
          <Tab>Active Sessions</Tab>
          <Tab>Available Agents</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Grid numItems={1} className="gap-6 mt-6">
              {activeSessions.map((session) => (
                <Card key={session.sessionId}>
                  <Flex>
                    <Flex alignItems="center" className="space-x-4">
                      {getChannelIcon(session.channel)}
                      <div>
                        <Text>Session {session.sessionId}</Text>
                        <Text className="text-gray-500">
                          {session.customerId} • {session.channel}
                        </Text>
                      </div>
                    </Flex>
                    <Flex className="space-x-2">
                      <Badge color="gray">
                        {Math.floor((Date.now() - new Date(session.startTime).getTime()) / 60000)}m
                      </Badge>
                      {session.agentId && (
                        <Badge color="blue">
                          Agent: {availableAgents.find(a => a.id === session.agentId)?.name}
                        </Badge>
                      )}
                    </Flex>
                  </Flex>
                  {selectedSession === session.sessionId && (
                    <div className="mt-4">
                      <Text className="font-medium mb-2">Transfer to:</Text>
                      <List>
                        {availableAgents.map((agent) => (
                          <ListItem key={agent.id}>
                            <Flex justifyContent="between" alignItems="center">
                              <Flex alignItems="center" className="space-x-2">
                                <UserIcon className="h-5 w-5" />
                                <Text>{agent.name}</Text>
                              </Flex>
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => handleTransferSession(session.sessionId, agent.id)}
                              >
                                Transfer
                              </Button>
                            </Flex>
                          </ListItem>
                        ))}
                      </List>
                    </div>
                  )}
                  <Button
                    size="xs"
                    variant="light"
                    className="mt-4"
                    onClick={() => setSelectedSession(
                      selectedSession === session.sessionId ? null : session.sessionId
                    )}
                  >
                    {selectedSession === session.sessionId ? 'Cancel' : 'Transfer'}
                  </Button>
                </Card>
              ))}
            </Grid>
          </TabPanel>
          <TabPanel>
            <Grid numItems={1} className="gap-6 mt-6">
              {availableAgents.map((agent) => (
                <Card key={agent.id}>
                  <Flex alignItems="center" justifyContent="between">
                    <Flex alignItems="center" className="space-x-4">
                      <UserIcon className="h-5 w-5" />
                      <div>
                        <Text>{agent.name}</Text>
                        <Text className="text-gray-500">{agent.email}</Text>
                      </div>
                    </Flex>
                    <Flex className="space-x-2">
                      <Badge color={agent.status === 'available' ? 'green' : 'yellow'}>
                        {agent.status}
                      </Badge>
                      <Badge color="blue">
                        {agent.currentSessions.length} active
                      </Badge>
                    </Flex>
                  </Flex>
                </Card>
              ))}
            </Grid>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
} 