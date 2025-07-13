import { useMemo, useState } from 'react';
import {
  Card,
  Grid,
  Text,
  Group,
  Stack,
  Badge,
  Progress,
  Table,
  Select,
  ActionIcon,
  ThemeIcon,
  Alert,
  Tabs,
  RingProgress,
  Switch,
} from '@mantine/core';
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import {
  IconTarget,
  IconTrendingUp,
  IconTrendingDown,
  IconGauge,
  IconChartLine,
  IconAward,
  IconAlertTriangle,
  IconCheck,
  IconRefresh,
  IconDownload,
  IconSpeedboat,
} from '@tabler/icons-react';
import { ProcessingMetrics } from '@/types';

interface PerformanceBenchmarksProps {
  metrics: ProcessingMetrics;
  isLoading?: boolean;
}

type BenchmarkViewType = 'sla' | 'efficiency' | 'quality' | 'trends';
type ComparisonPeriod = '24h' | '7d' | '30d' | '90d';

interface BenchmarkTarget {
  metric: string;
  current: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: number;
  category: 'performance' | 'quality' | 'efficiency' | 'reliability';
  priority: 'high' | 'medium' | 'low';
  description: string;
}

const PERFORMANCE_COLORS = {
  excellent: '#51cf66',
  good: '#74c0fc',
  warning: '#ffd43b',
  critical: '#ff6b6b',
} as const;

const SLA_TARGETS: BenchmarkTarget[] = [
  {
    metric: 'Processing Time',
    current: 415,
    target: 300,
    unit: 'ms',
    status: 'warning',
    trend: -5.2,
    category: 'performance',
    priority: 'high',
    description: 'End-to-end transaction processing time',
  },
  {
    metric: 'Reconciliation Rate',
    current: 95.5,
    target: 98.0,
    unit: '%',
    status: 'good',
    trend: 2.1,
    category: 'quality',
    priority: 'high',
    description: 'Successful auto-reconciliation percentage',
  },
  {
    metric: 'Data Quality Score',
    current: 95.5,
    target: 99.0,
    unit: '%',
    status: 'good',
    trend: 0.8,
    category: 'quality',
    priority: 'high',
    description: 'Overall data quality and completeness',
  },
  {
    metric: 'System Uptime',
    current: 99.95,
    target: 99.9,
    unit: '%',
    status: 'excellent',
    trend: 0.02,
    category: 'reliability',
    priority: 'high',
    description: 'System availability and reliability',
  },
  {
    metric: 'Error Rate',
    current: 0.05,
    target: 0.1,
    unit: '%',
    status: 'excellent',
    trend: -0.02,
    category: 'reliability',
    priority: 'medium',
    description: 'Transaction processing error rate',
  },
  {
    metric: 'Throughput',
    current: 1250,
    target: 1000,
    unit: 'txn/hr',
    status: 'excellent',
    trend: 12.5,
    category: 'performance',
    priority: 'medium',
    description: 'Transaction processing throughput',
  },
  {
    metric: 'Memory Utilization',
    current: 78,
    target: 85,
    unit: '%',
    status: 'good',
    trend: 2.3,
    category: 'efficiency',
    priority: 'medium',
    description: 'System memory usage efficiency',
  },
  {
    metric: 'CPU Utilization',
    current: 65,
    target: 80,
    unit: '%',
    status: 'good',
    trend: -1.5,
    category: 'efficiency',
    priority: 'low',
    description: 'System CPU usage efficiency',
  },
];

export function PerformanceBenchmarks({ metrics, isLoading }: PerformanceBenchmarksProps) {
  const [benchmarkView, setBenchmarkView] = useState<BenchmarkViewType>('sla');
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>('7d');
  const [showTargets, setShowTargets] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Update SLA targets with actual metrics
  const updatedTargets = useMemo(() => {
    return SLA_TARGETS.map(target => {
      switch (target.metric) {
        case 'Processing Time':
          return { ...target, current: metrics.processingTime.total };
        case 'Reconciliation Rate':
          return { 
            ...target, 
            current: (metrics.successfulTransactions / metrics.totalTransactions) * 100 
          };
        case 'Data Quality Score':
          return { ...target, current: metrics.qualityScore };
        default:
          return target;
      }
    }).map(target => ({
      ...target,
      status: getPerformanceStatus(target.current, target.target, target.metric),
    }));
  }, [metrics]);

  function getPerformanceStatus(current: number, target: number, metric: string): 'excellent' | 'good' | 'warning' | 'critical' {
    const isReversed = metric === 'Processing Time' || metric === 'Error Rate' || metric.includes('Utilization');
    const ratio = isReversed ? target / current : current / target;
    
    if (ratio >= 1.05) return 'excellent';
    if (ratio >= 0.95) return 'good';
    if (ratio >= 0.85) return 'warning';
    return 'critical';
  }

  // Generate historical performance data
  const historicalData = useMemo(() => {
    const days = comparisonPeriod === '24h' ? 24 : comparisonPeriod === '7d' ? 7 : comparisonPeriod === '30d' ? 30 : 90;
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      if (comparisonPeriod === '24h') {
        date.setHours(date.getHours() - (days - i - 1));
      } else {
        date.setDate(date.getDate() - (days - i - 1));
      }
      
      return {
        date: comparisonPeriod === '24h' 
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString(),
        processingTime: 350 + Math.random() * 150,
        reconciliationRate: 92 + Math.random() * 8,
        qualityScore: 94 + Math.random() * 6,
        throughput: 1000 + Math.random() * 500,
        errorRate: Math.random() * 0.2,
        uptime: 99.8 + Math.random() * 0.2,
        cpuUtilization: 50 + Math.random() * 30,
        memoryUtilization: 60 + Math.random() * 25,
      };
    });
  }, [comparisonPeriod]);

  // Calculate performance scores
  const performanceScores = useMemo(() => {
    const categoryScores = {
      performance: 0,
      quality: 0,
      efficiency: 0,
      reliability: 0,
    };

    const categoryCounts = {
      performance: 0,
      quality: 0,
      efficiency: 0,
      reliability: 0,
    };

    updatedTargets.forEach(target => {
      const score = target.status === 'excellent' ? 100 : 
                   target.status === 'good' ? 85 : 
                   target.status === 'warning' ? 65 : 40;
      
      categoryScores[target.category] += score;
      categoryCounts[target.category]++;
    });

    Object.keys(categoryScores).forEach(category => {
      const key = category as keyof typeof categoryScores;
      categoryScores[key] = categoryCounts[key] > 0 ? categoryScores[key] / categoryCounts[key] : 0;
    });

    const overallScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / 4;

    return { ...categoryScores, overall: overallScore };
  }, [updatedTargets]);

  // Efficiency metrics
  const efficiencyData = useMemo(() => {
    return [
      { name: 'CPU', usage: 65, target: 80, efficiency: 81.25 },
      { name: 'Memory', usage: 78, target: 85, efficiency: 91.76 },
      { name: 'Disk I/O', usage: 45, target: 70, efficiency: 64.29 },
      { name: 'Network', usage: 23, target: 60, efficiency: 38.33 },
      { name: 'Database', usage: 56, target: 75, efficiency: 74.67 },
    ];
  }, []);

  if (isLoading) {
    return (
      <Grid>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid.Col key={i} span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <div style={{ height: 300, backgroundColor: '#f8f9fa', borderRadius: 4 }} />
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Stack gap={4}>
          <Text size="xl" fw={700}>Performance Benchmarks</Text>
          <Text size="sm" c="dimmed">
            SLA monitoring, efficiency metrics, and performance optimization insights
          </Text>
        </Stack>
        
        <Group>
          <Switch
            label="Show Targets"
            checked={showTargets}
            onChange={(event) => setShowTargets(event.currentTarget.checked)}
            size="sm"
          />
          
          <Select
            value={comparisonPeriod}
            onChange={(value) => setComparisonPeriod(value as ComparisonPeriod)}
            data={[
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
            ]}
            size="sm"
            w={150}
          />
          
          <ActionIcon variant="subtle">
            <IconRefresh size={16} />
          </ActionIcon>
          
          <ActionIcon variant="subtle">
            <IconDownload size={16} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Performance Score Cards */}
      <Grid>
        <Grid.Col span={{ base: 6, sm: 3 }}>
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Stack align="center" gap="xs">
              <ThemeIcon color="blue" variant="light" size="lg">
                <IconTarget />
              </ThemeIcon>
              <Text size="xs" c="dimmed" ta="center">Overall Score</Text>
              <Text size="xl" fw={700} c="blue">
                {performanceScores.overall.toFixed(0)}
              </Text>
              <Badge color={performanceScores.overall > 85 ? 'green' : performanceScores.overall > 70 ? 'yellow' : 'red'} variant="light" size="sm">
                {performanceScores.overall > 85 ? 'Excellent' : performanceScores.overall > 70 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 3 }}>
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Stack align="center" gap="xs">
              <ThemeIcon color="green" variant="light" size="lg">
                <IconSpeedboat />
              </ThemeIcon>
              <Text size="xs" c="dimmed" ta="center">Performance</Text>
              <Text size="xl" fw={700} c="green">
                {performanceScores.performance.toFixed(0)}
              </Text>
              <Badge color={performanceScores.performance > 85 ? 'green' : performanceScores.performance > 70 ? 'yellow' : 'red'} variant="light" size="sm">
                {performanceScores.performance > 85 ? 'Fast' : performanceScores.performance > 70 ? 'Good' : 'Slow'}
              </Badge>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 3 }}>
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Stack align="center" gap="xs">
              <ThemeIcon color="purple" variant="light" size="lg">
                <IconAward />
              </ThemeIcon>
              <Text size="xs" c="dimmed" ta="center">Quality</Text>
              <Text size="xl" fw={700} c="purple">
                {performanceScores.quality.toFixed(0)}
              </Text>
              <Badge color={performanceScores.quality > 85 ? 'green' : performanceScores.quality > 70 ? 'yellow' : 'red'} variant="light" size="sm">
                {performanceScores.quality > 85 ? 'High' : performanceScores.quality > 70 ? 'Good' : 'Low'}
              </Badge>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 3 }}>
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Stack align="center" gap="xs">
              <ThemeIcon color="orange" variant="light" size="lg">
                <IconGauge />
              </ThemeIcon>
              <Text size="xs" c="dimmed" ta="center">Reliability</Text>
              <Text size="xl" fw={700} c="orange">
                {performanceScores.reliability.toFixed(0)}
              </Text>
              <Badge color={performanceScores.reliability > 85 ? 'green' : performanceScores.reliability > 70 ? 'yellow' : 'red'} variant="light" size="sm">
                {performanceScores.reliability > 85 ? 'Stable' : performanceScores.reliability > 70 ? 'Good' : 'Unstable'}
              </Badge>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Tabs value={benchmarkView} onChange={(value) => setBenchmarkView(value as BenchmarkViewType)}>
        <Tabs.List>
          <Tabs.Tab value="sla" leftSection={<IconTarget size={16} />}>
            SLA Compliance
          </Tabs.Tab>
          <Tabs.Tab value="efficiency" leftSection={<IconGauge size={16} />}>
            Resource Efficiency
          </Tabs.Tab>
          <Tabs.Tab value="quality" leftSection={<IconAward size={16} />}>
            Quality Metrics
          </Tabs.Tab>
          <Tabs.Tab value="trends" leftSection={<IconChartLine size={16} />}>
            Performance Trends
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="sla" pt="lg">
          <Grid>
            {/* SLA Status Overview */}
            <Grid.Col span={12}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Text fw={600}>SLA Compliance Overview</Text>
                  <Select
                    value={selectedCategory}
                    onChange={(value) => setSelectedCategory(value || 'all')}
                    data={[
                      { value: 'all', label: 'All Categories' },
                      { value: 'performance', label: 'Performance' },
                      { value: 'quality', label: 'Quality' },
                      { value: 'efficiency', label: 'Efficiency' },
                      { value: 'reliability', label: 'Reliability' },
                    ]}
                    size="sm"
                    w={150}
                  />
                </Group>
                
                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Metric</Table.Th>
                      <Table.Th ta="center">Current</Table.Th>
                      <Table.Th ta="center">Target</Table.Th>
                      <Table.Th ta="center">Performance</Table.Th>
                      <Table.Th ta="center">Status</Table.Th>
                      <Table.Th ta="center">Trend</Table.Th>
                      <Table.Th ta="center">Priority</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {updatedTargets
                      .filter(target => selectedCategory === 'all' || target.category === selectedCategory)
                      .map((target) => {
                        const isReversed = target.metric === 'Processing Time' || target.metric === 'Error Rate';
                        const performanceRatio = isReversed 
                          ? (target.target / target.current) * 100
                          : (target.current / target.target) * 100;
                        
                        return (
                          <Table.Tr key={target.metric}>
                            <Table.Td>
                              <Stack gap={0}>
                                <Text size="sm" fw={500}>{target.metric}</Text>
                                <Text size="xs" c="dimmed">{target.description}</Text>
                              </Stack>
                            </Table.Td>
                            <Table.Td ta="center">
                              <Text size="sm" fw={600}>
                                {target.current.toFixed(target.unit === '%' ? 1 : 0)} {target.unit}
                              </Text>
                            </Table.Td>
                            <Table.Td ta="center">
                              <Text size="sm" c="dimmed">
                                {target.target.toFixed(target.unit === '%' ? 1 : 0)} {target.unit}
                              </Text>
                            </Table.Td>
                            <Table.Td ta="center">
                              <Stack gap={4} align="center">
                                <Progress
                                  value={Math.min(100, performanceRatio)}
                                  color={PERFORMANCE_COLORS[target.status]}
                                  size="sm"
                                  w={60}
                                />
                                <Text size="xs" c="dimmed">
                                  {performanceRatio.toFixed(0)}%
                                </Text>
                              </Stack>
                            </Table.Td>
                            <Table.Td ta="center">
                              <Badge color={PERFORMANCE_COLORS[target.status]} variant="light" size="sm">
                                {target.status.charAt(0).toUpperCase() + target.status.slice(1)}
                              </Badge>
                            </Table.Td>
                            <Table.Td ta="center">
                              <Group gap={4} justify="center">
                                {target.trend > 0 ? (
                                  <IconTrendingUp size={14} color="green" />
                                ) : (
                                  <IconTrendingDown size={14} color="red" />
                                )}
                                <Text size="sm" c={target.trend > 0 ? 'green' : 'red'}>
                                  {target.trend > 0 ? '+' : ''}{target.trend.toFixed(1)}%
                                </Text>
                              </Group>
                            </Table.Td>
                            <Table.Td ta="center">
                              <Badge
                                color={target.priority === 'high' ? 'red' : target.priority === 'medium' ? 'yellow' : 'blue'}
                                variant="light"
                                size="sm"
                              >
                                {target.priority.charAt(0).toUpperCase() + target.priority.slice(1)}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="efficiency" pt="lg">
          <Grid>
            {/* Resource Utilization */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Resource Utilization Efficiency</Text>
                
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    
                    <Bar yAxisId="left" dataKey="usage" fill="#228be6" name="Current Usage %" />
                    <Bar yAxisId="left" dataKey="target" fill="#e9ecef" name="Target %" />
                    <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#40c057" strokeWidth={3} name="Efficiency Score" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>

            {/* Efficiency Summary */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Efficiency Summary</Text>
                
                <Stack gap="md">
                  {efficiencyData.map((resource) => (
                    <Stack key={resource.name} gap="xs">
                      <Group justify="space-between">
                        <Text size="sm">{resource.name}</Text>
                        <Badge
                          color={resource.efficiency > 80 ? 'green' : resource.efficiency > 60 ? 'yellow' : 'red'}
                          variant="light"
                          size="sm"
                        >
                          {resource.efficiency.toFixed(0)}%
                        </Badge>
                      </Group>
                      <Progress
                        value={resource.efficiency}
                        color={resource.efficiency > 80 ? 'green' : resource.efficiency > 60 ? 'yellow' : 'red'}
                        size="md"
                      />
                      <Text size="xs" c="dimmed">
                        {resource.usage}% / {resource.target}% utilization
                      </Text>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="quality" pt="lg">
          <Grid>
            {/* Quality Score Breakdown */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Quality Score Breakdown</Text>
                
                <Stack align="center" gap="md">
                  <RingProgress
                    size={200}
                    thickness={20}
                    sections={[
                      { value: metrics.qualityScore, color: 'blue' },
                    ]}
                    label={
                      <Stack align="center" gap={0}>
                        <Text size="xl" fw={700}>
                          {metrics.qualityScore.toFixed(1)}%
                        </Text>
                        <Text size="sm" c="dimmed">Quality Score</Text>
                      </Stack>
                    }
                  />
                  
                  <Stack gap="xs" w="100%">
                    <Group justify="space-between">
                      <Text size="sm">Data Completeness</Text>
                      <Text size="sm" fw={600}>{metrics.dataCompleteness.toFixed(1)}%</Text>
                    </Group>
                    <Progress value={metrics.dataCompleteness} color="blue" size="md" />
                    
                    <Group justify="space-between">
                      <Text size="sm">Validation Score</Text>
                      <Text size="sm" fw={600}>{(metrics.qualityScore * 0.95).toFixed(1)}%</Text>
                    </Group>
                    <Progress value={metrics.qualityScore * 0.95} color="green" size="md" />
                    
                    <Group justify="space-between">
                      <Text size="sm">Consistency Score</Text>
                      <Text size="sm" fw={600}>{(metrics.qualityScore * 1.02).toFixed(1)}%</Text>
                    </Group>
                    <Progress value={Math.min(100, metrics.qualityScore * 1.02)} color="purple" size="md" />
                  </Stack>
                </Stack>
              </Card>
            </Grid.Col>

            {/* Quality Alerts */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Quality Alerts & Recommendations</Text>
                
                <Stack gap="md">
                  {metrics.qualityScore < 98 && (
                    <Alert color="yellow" icon={<IconAlertTriangle size={16} />} variant="light">
                      <Text size="sm" fw={500}>Quality Improvement Opportunity</Text>
                      <Text size="sm">
                        Current quality score is {metrics.qualityScore.toFixed(1)}%. 
                        Consider implementing additional validation rules to reach 98% target.
                      </Text>
                    </Alert>
                  )}
                  
                  {metrics.dataCompleteness < 99 && (
                    <Alert color="blue" icon={<IconAlertTriangle size={16} />} variant="light">
                      <Text size="sm" fw={500}>Data Completeness Alert</Text>
                      <Text size="sm">
                        Data completeness at {metrics.dataCompleteness.toFixed(1)}%. 
                        Review data sources for missing fields.
                      </Text>
                    </Alert>
                  )}
                  
                  <Alert color="green" icon={<IconCheck size={16} />} variant="light">
                    <Text size="sm" fw={500}>Quality Status: Good</Text>
                    <Text size="sm">
                      Overall data quality metrics are within acceptable ranges. 
                      Continue monitoring for trends.
                    </Text>
                  </Alert>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="trends" pt="lg">
          <Grid>
            <Grid.Col span={12}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Text fw={600}>Performance Trends Over Time</Text>
                  <Badge color="blue" variant="light">
                    {comparisonPeriod === '24h' ? 'Hourly' : 'Daily'} Data
                  </Badge>
                </Group>
                
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    
                    <Line yAxisId="left" type="monotone" dataKey="processingTime" stroke="#228be6" strokeWidth={2} name="Processing Time (ms)" />
                    <Line yAxisId="right" type="monotone" dataKey="reconciliationRate" stroke="#40c057" strokeWidth={2} name="Reconciliation Rate %" />
                    <Line yAxisId="right" type="monotone" dataKey="qualityScore" stroke="#fd7e14" strokeWidth={2} name="Quality Score %" />
                    
                    {showTargets && (
                      <>
                        <Line yAxisId="left" type="monotone" dataKey={() => 300} stroke="#228be6" strokeDasharray="5 5" name="Processing Target" />
                        <Line yAxisId="right" type="monotone" dataKey={() => 98} stroke="#40c057" strokeDasharray="5 5" name="Reconciliation Target" />
                        <Line yAxisId="right" type="monotone" dataKey={() => 99} stroke="#fd7e14" strokeDasharray="5 5" name="Quality Target" />
                      </>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}