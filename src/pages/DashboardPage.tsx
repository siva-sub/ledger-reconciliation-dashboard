import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Tabs,
  Group,
  ActionIcon,
  Select,
  Badge,
  Alert,
  Button,
} from '@mantine/core';
import {
  IconDashboard,
  IconChartLine,
  IconShield,
  IconCurrencyDollar,
  IconTarget,
  IconCrystalBall,
  IconRefresh,
  IconDownload,
  IconSettings,
  IconFilter,
  IconCalendar,
  IconBell,
} from '@tabler/icons-react';
import { useETLData } from '@/hooks/useETLData';
import {
  ExecutiveKPIDashboard,
  AdvancedChartsSection,
  RiskAnalyticsDashboard,
  CurrencyFlowVisualization,
  PerformanceBenchmarks,
  PredictiveAnalytics,
} from '@/components/dashboard';

type DashboardTab = 'executive' | 'analytics' | 'risk' | 'currency' | 'performance' | 'predictive';

export function DashboardPage() {
  const { metrics, transactions, isLoading, error } = useETLData();
  const [activeTab, setActiveTab] = useState<DashboardTab>('executive');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [refreshInterval] = useState<string>('5m');

  if (isLoading) {
    return (
      <Container size="xl">
        <Stack gap="lg">
          <div style={{ height: 60, backgroundColor: '#f8f9fa', borderRadius: 4 }} />
          <div style={{ height: 200, backgroundColor: '#f8f9fa', borderRadius: 4 }} />
          <div style={{ height: 400, backgroundColor: '#f8f9fa', borderRadius: 4 }} />
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl">
        <Alert color="red" title="Error Loading Dashboard Data">
          <Text>Unable to load dashboard data. Please try refreshing the page or contact support if the issue persists.</Text>
          <Button variant="light" color="red" mt="md" leftSection={<IconRefresh size={16} />}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  const formatDateRange = (range: string) => {
    const ranges = {
      '24h': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days',
    };
    return ranges[range as keyof typeof ranges] || range;
  };

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Dashboard Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Title order={1}>Business Intelligence Dashboard</Title>
            <Text size="lg" c="dimmed">
              Comprehensive financial processing analytics and executive insights
            </Text>
            <Group gap="xs" mt="xs">
              <Badge color="green" variant="light" leftSection={<IconBell size={12} />}>
                Real-time Monitoring
              </Badge>
              <Badge color="blue" variant="light">
                {formatDateRange(dateRange)}
              </Badge>
              <Badge color="gray" variant="light">
                Auto-refresh: {refreshInterval}
              </Badge>
            </Group>
          </Stack>

          <Group>
            <Select
              value={dateRange}
              onChange={(value) => setDateRange(value || '7d')}
              data={[
                { value: '24h', label: 'Last 24 Hours' },
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: '90d', label: 'Last 90 Days' },
              ]}
              leftSection={<IconCalendar size={16} />}
              size="sm"
              w={150}
            />

            <ActionIcon.Group>
              <ActionIcon variant="light" aria-label="Filter">
                <IconFilter size={16} />
              </ActionIcon>
              <ActionIcon variant="light" aria-label="Refresh">
                <IconRefresh size={16} />
              </ActionIcon>
              <ActionIcon variant="light" aria-label="Export">
                <IconDownload size={16} />
              </ActionIcon>
              <ActionIcon variant="light" aria-label="Settings">
                <IconSettings size={16} />
              </ActionIcon>
            </ActionIcon.Group>
          </Group>
        </Group>

        {/* Main Dashboard Content */}
        {metrics && (
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value as DashboardTab)}>
            <Tabs.List grow>
              <Tabs.Tab 
                value="executive" 
                leftSection={<IconDashboard size={18} />}
              >
                Executive KPIs
              </Tabs.Tab>
              <Tabs.Tab 
                value="analytics" 
                leftSection={<IconChartLine size={18} />}
              >
                Advanced Analytics
              </Tabs.Tab>
              <Tabs.Tab 
                value="risk" 
                leftSection={<IconShield size={18} />}
              >
                Risk Management
              </Tabs.Tab>
              <Tabs.Tab 
                value="currency" 
                leftSection={<IconCurrencyDollar size={18} />}
              >
                Currency Flow
              </Tabs.Tab>
              <Tabs.Tab 
                value="performance" 
                leftSection={<IconTarget size={18} />}
              >
                Performance
              </Tabs.Tab>
              <Tabs.Tab 
                value="predictive" 
                leftSection={<IconCrystalBall size={18} />}
              >
                Predictive AI
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="executive" pt="xl">
              <ExecutiveKPIDashboard
                metrics={metrics}
                dateRange={formatDateRange(dateRange)}
                isLoading={isLoading}
              />
            </Tabs.Panel>

            <Tabs.Panel value="analytics" pt="xl">
              <AdvancedChartsSection
                metrics={metrics}
                transactions={transactions}
                isLoading={isLoading}
              />
            </Tabs.Panel>

            <Tabs.Panel value="risk" pt="xl">
              <RiskAnalyticsDashboard
                metrics={metrics}
                transactions={transactions}
                isLoading={isLoading}
              />
            </Tabs.Panel>

            <Tabs.Panel value="currency" pt="xl">
              <CurrencyFlowVisualization
                metrics={metrics}
                transactions={transactions}
                isLoading={isLoading}
              />
            </Tabs.Panel>

            <Tabs.Panel value="performance" pt="xl">
              <PerformanceBenchmarks
                metrics={metrics}
                isLoading={isLoading}
              />
            </Tabs.Panel>

            <Tabs.Panel value="predictive" pt="xl">
              <PredictiveAnalytics
                metrics={metrics}
                transactions={transactions}
                isLoading={isLoading}
              />
            </Tabs.Panel>
          </Tabs>
        )}
      </Stack>
    </Container>
  );
}