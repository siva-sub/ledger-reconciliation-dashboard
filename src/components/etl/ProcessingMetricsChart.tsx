import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Grid,
  Paper,
  Badge,
  Progress,
  ThemeIcon,
  ActionIcon,
  Select,
  Switch,
  Alert,
  Table,
  RingProgress,
  Center
} from '@mantine/core';
import {
  IconClock,
  IconTrendingUp,
  IconTrendingDown,
  IconDatabase,
  IconCpu,
  IconNetwork,
  IconRefresh,
  IconInfoCircle,
  IconActivity,
  IconGauge,
  IconAlertTriangle,
  IconCheck
} from '@tabler/icons-react';
import { ProcessingMetrics } from '@/types/etl';

interface ProcessingMetricsChartProps {
  metrics: ProcessingMetrics;
  realTimeMode?: boolean;
}

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactElement;
  trend: 'up' | 'down' | 'stable';
  threshold: { warning: number; critical: number };
}

interface PerformanceHistory {
  timestamp: Date;
  throughput: number;
  latency: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

export function ProcessingMetricsChart({ metrics, realTimeMode = false }: ProcessingMetricsChartProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'system'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(realTimeMode);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistory[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      id: 'cpu',
      name: 'CPU Usage',
      value: 45,
      unit: '%',
      status: 'good',
      icon: <IconCpu size={20} />,
      trend: 'stable',
      threshold: { warning: 70, critical: 90 }
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      value: 68,
      unit: '%',
      status: 'warning',
      icon: <IconCpu size={20} />,
      trend: 'up',
      threshold: { warning: 80, critical: 95 }
    },
    {
      id: 'network',
      name: 'Network I/O',
      value: 23,
      unit: 'MB/s',
      status: 'good',
      icon: <IconNetwork size={20} />,
      trend: 'down',
      threshold: { warning: 100, critical: 150 }
    },
    {
      id: 'disk',
      name: 'Disk Usage',
      value: 34,
      unit: '%',
      status: 'good',
      icon: <IconDatabase size={20} />,
      trend: 'stable',
      threshold: { warning: 85, critical: 95 }
    }
  ]);

  const updateMetrics = useCallback(() => {
    // Simulate real-time metric updates
    setSystemMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10)),
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
    })));

    // Add to performance history
    const newEntry: PerformanceHistory = {
      timestamp: new Date(),
      throughput: Math.floor(Math.random() * 1000) + 500,
      latency: Math.floor(Math.random() * 50) + 10,
      errorRate: Math.random() * 2,
      cpuUsage: systemMetrics.find(m => m.id === 'cpu')?.value || 0,
      memoryUsage: systemMetrics.find(m => m.id === 'memory')?.value || 0
    };

    setPerformanceHistory(prev => [...prev.slice(-9), newEntry]);
  }, [systemMetrics]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        updateMetrics();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, updateMetrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'green';
      case 'warning': return 'orange';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <IconTrendingUp size={14} color="red" />;
      case 'down': return <IconTrendingDown size={14} color="green" />;
      default: return <IconActivity size={14} color="gray" />;
    }
  };

  const calculateThroughput = () => {
    const totalRecords = metrics.totalTransactions;
    const totalTime = metrics.processingTime.total / 1000; // Convert to seconds
    return Math.round(totalRecords / totalTime);
  };

  const calculateEfficiencyScore = () => {
    const successRate = (metrics.successfulTransactions / metrics.totalTransactions) * 100;
    const errorRate = (metrics.failedTransactions / metrics.totalTransactions) * 100;
    const qualityScore = metrics.qualityScore;
    
    return Math.round((successRate * 0.4) + ((100 - errorRate) * 0.3) + (qualityScore * 0.3));
  };

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Group justify="space-between" mb="lg">
        <div>
          <Text size="xl" fw={700} mb="xs">Processing Metrics Dashboard</Text>
          <Text size="sm" c="dimmed">
            Real-time performance monitoring and analytics
          </Text>
        </div>
        
        <Group>
          <Select
            value={viewMode}
            onChange={(value) => setViewMode(value as 'overview' | 'detailed' | 'system')}
            data={[
              { value: 'overview', label: 'Overview' },
              { value: 'detailed', label: 'Detailed' },
              { value: 'system', label: 'System Health' }
            ]}
          />
          <Switch
            label="Auto-refresh"
            checked={autoRefresh}
            onChange={(event) => setAutoRefresh(event.currentTarget.checked)}
          />
          <ActionIcon variant="light" onClick={updateMetrics}>
            <IconRefresh size={16} />
          </ActionIcon>
        </Group>
      </Group>

      {viewMode === 'overview' && (
        <Stack gap="xl">
          {/* Key Performance Indicators */}
          <Grid>
            <Grid.Col span={3}>
              <Paper p="md" bg="blue.0" radius="sm" ta="center">
                <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
                  <IconTrendingUp size={24} />
                </ThemeIcon>
                <Text size="xl" fw={700}>{calculateThroughput()}</Text>
                <Text size="sm" c="dimmed">Records/Second</Text>
                <Text size="xs" c="blue" mt="xs">
                  +12% from last hour
                </Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={3}>
              <Paper p="md" bg="green.0" radius="sm" ta="center">
                <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
                  <IconCheck size={24} />
                </ThemeIcon>
                <Text size="xl" fw={700}>{((metrics.successfulTransactions / metrics.totalTransactions) * 100).toFixed(1)}%</Text>
                <Text size="sm" c="dimmed">Success Rate</Text>
                <Text size="xs" c="green" mt="xs">
                  Target: &gt;95%
                </Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={3}>
              <Paper p="md" bg="orange.0" radius="sm" ta="center">
                <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
                  <IconClock size={24} />
                </ThemeIcon>
                <Text size="xl" fw={700}>{metrics.processingTime.total}ms</Text>
                <Text size="sm" c="dimmed">Total Time</Text>
                <Text size="xs" c="orange" mt="xs">
                  -5% improvement
                </Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={3}>
              <Paper p="md" bg="purple.0" radius="sm" ta="center">
                <ThemeIcon size="lg" color="purple" variant="light" mx="auto" mb="md">
                  <IconGauge size={24} />
                </ThemeIcon>
                <Text size="xl" fw={700}>{calculateEfficiencyScore()}</Text>
                <Text size="sm" c="dimmed">Efficiency Score</Text>
                <Text size="xs" c="purple" mt="xs">
                  Out of 100
                </Text>
              </Paper>
            </Grid.Col>
          </Grid>

          {/* Processing Time Breakdown */}
          <Card padding="md" withBorder>
            <Text fw={600} mb="md">Processing Time Breakdown</Text>
            <Grid>
              <Grid.Col span={6}>
                <Stack gap="md">
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">XML Parsing</Text>
                      <Text size="sm" fw={600}>{metrics.processingTime.parsing}ms</Text>
                    </Group>
                    <Progress value={(metrics.processingTime.parsing / metrics.processingTime.total) * 100} size="md" />
                  </div>
                  
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Data Transformation</Text>
                      <Text size="sm" fw={600}>{metrics.processingTime.transformation}ms</Text>
                    </Group>
                    <Progress value={(metrics.processingTime.transformation / metrics.processingTime.total) * 100} size="md" color="orange" />
                  </div>
                  
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Validation</Text>
                      <Text size="sm" fw={600}>{metrics.processingTime.validation}ms</Text>
                    </Group>
                    <Progress value={(metrics.processingTime.validation / metrics.processingTime.total) * 100} size="md" color="green" />
                  </div>
                  
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Database Loading</Text>
                      <Text size="sm" fw={600}>{metrics.processingTime.loading}ms</Text>
                    </Group>
                    <Progress value={(metrics.processingTime.loading / metrics.processingTime.total) * 100} size="md" color="purple" />
                  </div>
                </Stack>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Center h="100%">
                  <RingProgress
                    size={200}
                    thickness={20}
                    sections={[
                      { value: (metrics.processingTime.parsing / metrics.processingTime.total) * 100, color: 'blue', tooltip: `Parsing: ${metrics.processingTime.parsing}ms` },
                      { value: (metrics.processingTime.transformation / metrics.processingTime.total) * 100, color: 'orange', tooltip: `Transform: ${metrics.processingTime.transformation}ms` },
                      { value: (metrics.processingTime.validation / metrics.processingTime.total) * 100, color: 'green', tooltip: `Validation: ${metrics.processingTime.validation}ms` },
                      { value: (metrics.processingTime.loading / metrics.processingTime.total) * 100, color: 'purple', tooltip: `Loading: ${metrics.processingTime.loading}ms` }
                    ]}
                    label={
                      <div style={{ textAlign: 'center' }}>
                        <Text size="xl" fw={700}>{metrics.processingTime.total}ms</Text>
                        <Text size="sm" c="dimmed">Total Time</Text>
                      </div>
                    }
                  />
                </Center>
              </Grid.Col>
            </Grid>
          </Card>

          {/* Quality Metrics */}
          <Grid>
            <Grid.Col span={6}>
              <Card padding="md" withBorder>
                <Text fw={600} mb="md">Data Quality</Text>
                <Stack gap="md">
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Overall Quality Score</Text>
                      <Text size="sm" fw={600}>{metrics.qualityScore}%</Text>
                    </Group>
                    <Progress value={metrics.qualityScore} size="lg" color={metrics.qualityScore > 90 ? 'green' : metrics.qualityScore > 70 ? 'orange' : 'red'} />
                  </div>
                  
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Data Completeness</Text>
                      <Text size="sm" fw={600}>{metrics.dataCompleteness}%</Text>
                    </Group>
                    <Progress value={metrics.dataCompleteness} size="lg" color={metrics.dataCompleteness > 95 ? 'green' : 'orange'} />
                  </div>
                </Stack>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Card padding="md" withBorder>
                <Text fw={600} mb="md">Transaction Summary</Text>
                <Table>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td>Total Processed</Table.Td>
                      <Table.Td fw={600}>{metrics.totalTransactions}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Successful</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Text fw={600} c="green">{metrics.successfulTransactions}</Text>
                          <Badge color="green" size="xs">
                            {((metrics.successfulTransactions / metrics.totalTransactions) * 100).toFixed(1)}%
                          </Badge>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Failed</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Text fw={600} c="red">{metrics.failedTransactions}</Text>
                          <Badge color="red" size="xs">
                            {((metrics.failedTransactions / metrics.totalTransactions) * 100).toFixed(1)}%
                          </Badge>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>FX Conversions</Table.Td>
                      <Table.Td fw={600}>{metrics.successfulConversions}</Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      )}

      {viewMode === 'detailed' && (
        <Stack gap="md">
          <Alert icon={<IconInfoCircle size={16} />} title="Detailed Analytics">
            Advanced metrics and performance breakdowns for deep analysis
          </Alert>
          
          {/* Currency Distribution */}
          <Card padding="md" withBorder>
            <Text fw={600} mb="md">Currency Distribution</Text>
            <Grid>
              {Object.entries(metrics.currencyDistribution).filter(([, data]) => data.count > 0).map(([currency, data]) => (
                <Grid.Col key={currency} span={4}>
                  <Paper p="md" bg="gray.0" radius="sm">
                    <Text fw={600} mb="xs">{currency}</Text>
                    <Text size="lg" fw={700}>{data.count}</Text>
                    <Text size="xs" c="dimmed">transactions</Text>
                    <Text size="sm" mt="xs">Avg: {data.averageAmount.toLocaleString()}</Text>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Card>

          {/* Risk Distribution */}
          <Card padding="md" withBorder>
            <Text fw={600} mb="md">Risk Level Distribution</Text>
            <Grid>
              {Object.entries(metrics.riskDistribution).map(([risk, count]) => (
                <Grid.Col key={risk} span={3}>
                  <Paper p="md" bg={risk === 'HIGH' ? 'red.0' : risk === 'MEDIUM' ? 'orange.0' : 'green.0'} radius="sm" ta="center">
                    <Text fw={600} c={risk === 'HIGH' ? 'red' : risk === 'MEDIUM' ? 'orange' : 'green'}>
                      {risk}
                    </Text>
                    <Text size="xl" fw={700}>{count}</Text>
                    <Text size="xs" c="dimmed">
                      {((count / metrics.totalTransactions) * 100).toFixed(1)}%
                    </Text>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Card>

          {/* Performance Trends */}
          {performanceHistory.length > 0 && (
            <Card padding="md" withBorder>
              <Text fw={600} mb="md">Performance Trends (Last 10 intervals)</Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Time</Table.Th>
                    <Table.Th>Throughput</Table.Th>
                    <Table.Th>Latency</Table.Th>
                    <Table.Th>Error Rate</Table.Th>
                    <Table.Th>CPU</Table.Th>
                    <Table.Th>Memory</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {performanceHistory.slice(-5).map((entry, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>{entry.timestamp.toLocaleTimeString()}</Table.Td>
                      <Table.Td>{entry.throughput} rec/s</Table.Td>
                      <Table.Td>{entry.latency}ms</Table.Td>
                      <Table.Td>{entry.errorRate.toFixed(2)}%</Table.Td>
                      <Table.Td>{entry.cpuUsage.toFixed(1)}%</Table.Td>
                      <Table.Td>{entry.memoryUsage.toFixed(1)}%</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          )}
        </Stack>
      )}

      {viewMode === 'system' && (
        <Stack gap="md">
          <Alert icon={<IconActivity size={16} />} title="System Health Monitoring">
            Real-time infrastructure and resource utilization metrics
          </Alert>
          
          <Grid>
            {systemMetrics.map((metric) => (
              <Grid.Col key={metric.id} span={6}>
                <Card padding="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <Group>
                      <ThemeIcon variant="light" color={getStatusColor(metric.status)}>
                        {metric.icon}
                      </ThemeIcon>
                      <div>
                        <Text fw={600}>{metric.name}</Text>
                        <Group gap="xs">
                          <Text size="sm" c="dimmed">{metric.value.toFixed(1)}{metric.unit}</Text>
                          {getTrendIcon(metric.trend)}
                        </Group>
                      </div>
                    </Group>
                    <Badge color={getStatusColor(metric.status)} variant="light">
                      {metric.status}
                    </Badge>
                  </Group>
                  
                  <Progress
                    value={metric.value}
                    size="lg"
                    color={getStatusColor(metric.status)}
                    mb="xs"
                  />
                  
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Warning: {metric.threshold.warning}{metric.unit}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Critical: {metric.threshold.critical}{metric.unit}
                    </Text>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          {/* System Alerts */}
          <Card padding="md" withBorder>
            <Text fw={600} mb="md">System Alerts</Text>
            <Stack gap="xs">
              {systemMetrics.filter(m => m.status !== 'good').length === 0 ? (
                <Group>
                  <IconCheck size={16} color="green" />
                  <Text size="sm" c="green">All systems operating normally</Text>
                </Group>
              ) : (
                systemMetrics.filter(m => m.status !== 'good').map(metric => (
                  <Alert
                    key={metric.id}
                    icon={<IconAlertTriangle size={16} />}
                    color={getStatusColor(metric.status)}
                  >
                    {metric.name} is at {metric.value.toFixed(1)}{metric.unit} 
                    ({metric.status === 'warning' ? 'approaching' : 'exceeding'} threshold)
                  </Alert>
                ))
              )}
            </Stack>
          </Card>
        </Stack>
      )}
    </Card>
  );
}