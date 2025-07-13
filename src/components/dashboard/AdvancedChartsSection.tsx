import { useMemo, useState } from 'react';
import {
  Card,
  Grid,
  Text,
  Group,
  Stack,
  SegmentedControl,
  ActionIcon,
  Tooltip,
  Badge,
  Table,
} from '@mantine/core';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ComposedChart,
} from 'recharts';
import {
  IconDownload,
  IconMaximize,
  IconRefresh,
} from '@tabler/icons-react';
import { ProcessingMetrics } from '@/types';

interface AdvancedChartsSectionProps {
  metrics: ProcessingMetrics;
  transactions?: unknown[];
  isLoading?: boolean;
}

type ChartTimeframe = '24h' | '7d' | '30d' | '90d';
type ChartType = 'area' | 'bar' | 'line' | 'pie';

const COLORS = {
  primary: '#228be6',
  secondary: '#40c057',
  accent: '#fd7e14',
  warning: '#fab005',
  danger: '#fa5252',
  info: '#15aabf',
  purple: '#9c88ff',
  pink: '#f06595',
} as const;

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.warning,
  COLORS.danger,
  COLORS.info,
  COLORS.purple,
  COLORS.pink,
];

export function AdvancedChartsSection({ metrics, isLoading }: AdvancedChartsSectionProps) {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('7d');
  const [volumeChartType, setVolumeChartType] = useState<ChartType>('area');

  // Generate mock time series data based on timeframe
  const timeSeriesData = useMemo(() => {
    const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const intervals = timeframe === '24h' ? 24 : days;
    
    return Array.from({ length: intervals }, (_, i) => {
      const date = new Date();
      if (timeframe === '24h') {
        date.setHours(date.getHours() - (intervals - i - 1));
      } else {
        date.setDate(date.getDate() - (intervals - i - 1));
      }
      
      const baseVolume = Math.floor(Math.random() * 50) + 20;
      const successRate = 85 + Math.random() * 15;
      const avgProcessingTime = 300 + Math.random() * 200;
      
      return {
        time: timeframe === '24h' ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString(),
        volume: baseVolume,
        successful: Math.floor(baseVolume * (successRate / 100)),
        failed: baseVolume - Math.floor(baseVolume * (successRate / 100)),
        processingTime: avgProcessingTime,
        value: baseVolume * (1000 + Math.random() * 5000),
        riskHigh: Math.floor(baseVolume * 0.1),
        riskMedium: Math.floor(baseVolume * 0.3),
        riskLow: Math.floor(baseVolume * 0.6),
      };
    });
  }, [timeframe]);

  // Currency distribution pie chart data
  const currencyData = useMemo(() => {
    return Object.entries(metrics.currencyDistribution)
      .filter(([, data]) => data.count > 0)
      .map(([currency, data]) => ({
        name: currency,
        value: data.count,
        amount: data.totalAmount,
        percentage: ((data.count / metrics.totalTransactions) * 100).toFixed(1),
      }));
  }, [metrics]);

  // Risk distribution data
  const riskData = useMemo(() => {
    return Object.entries(metrics.riskDistribution).map(([risk, count]) => ({
      name: risk.charAt(0) + risk.slice(1).toLowerCase(),
      value: count,
      percentage: ((count / metrics.totalTransactions) * 100).toFixed(1),
    }));
  }, [metrics]);

  // Processing performance data
  const performanceData = useMemo(() => {
    return [
      { name: 'Parsing', time: metrics.processingTime.parsing, percentage: (metrics.processingTime.parsing / metrics.processingTime.total) * 100 },
      { name: 'Transformation', time: metrics.processingTime.transformation, percentage: (metrics.processingTime.transformation / metrics.processingTime.total) * 100 },
      { name: 'Validation', time: metrics.processingTime.validation, percentage: (metrics.processingTime.validation / metrics.processingTime.total) * 100 },
      { name: 'Loading', time: metrics.processingTime.loading, percentage: (metrics.processingTime.loading / metrics.processingTime.total) * 100 },
    ];
  }, [metrics]);


  const renderVolumeChart = () => {
    const ChartComponent = volumeChartType === 'area' ? AreaChart : volumeChartType === 'bar' ? BarChart : LineChart;
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={timeSeriesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
          <XAxis dataKey="time" stroke="#868e96" fontSize={12} />
          <YAxis stroke="#868e96" fontSize={12} />
          <RechartsTooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e9ecef', 
              borderRadius: '4px',
              fontSize: '12px'
            }}
          />
          <Legend />
          
          {volumeChartType === 'area' && (
            <>
              <Area type="monotone" dataKey="successful" stackId="1" stroke={COLORS.secondary} fill={COLORS.secondary} fillOpacity={0.6} name="Successful" />
              <Area type="monotone" dataKey="failed" stackId="1" stroke={COLORS.danger} fill={COLORS.danger} fillOpacity={0.6} name="Failed" />
            </>
          )}
          
          {volumeChartType === 'bar' && (
            <>
              <Bar dataKey="successful" fill={COLORS.secondary} name="Successful" />
              <Bar dataKey="failed" fill={COLORS.danger} name="Failed" />
            </>
          )}
          
          {volumeChartType === 'line' && (
            <>
              <Line type="monotone" dataKey="volume" stroke={COLORS.primary} strokeWidth={3} name="Total Volume" />
              <Line type="monotone" dataKey="successful" stroke={COLORS.secondary} strokeWidth={2} name="Successful" />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

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
          <Text size="xl" fw={700}>Advanced Analytics</Text>
          <Text size="sm" c="dimmed">
            Interactive charts and visualizations for comprehensive business insights
          </Text>
        </Stack>
        
        <Group>
          <SegmentedControl
            value={timeframe}
            onChange={(value) => setTimeframe(value as ChartTimeframe)}
            data={[
              { label: '24H', value: '24h' },
              { label: '7D', value: '7d' },
              { label: '30D', value: '30d' },
              { label: '90D', value: '90d' },
            ]}
            size="sm"
          />
          
          <Tooltip label="Refresh data">
            <ActionIcon variant="subtle">
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label="Export charts">
            <ActionIcon variant="subtle">
              <IconDownload size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Grid>
        {/* Transaction Volume Trends */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Stack gap={4}>
                <Text fw={600}>Transaction Volume Trends</Text>
                <Text size="sm" c="dimmed">Success/failure rates over time</Text>
              </Stack>
              <Group>
                <SegmentedControl
                  value={volumeChartType}
                  onChange={(value) => setVolumeChartType(value as ChartType)}
                  data={[
                    { label: 'Area', value: 'area' },
                    { label: 'Bar', value: 'bar' },
                    { label: 'Line', value: 'line' },
                  ]}
                  size="xs"
                />
                <ActionIcon variant="subtle" size="sm">
                  <IconMaximize size={14} />
                </ActionIcon>
              </Group>
            </Group>
            
            {renderVolumeChart()}
            
            <Group justify="space-between" mt="md">
              <Badge color="green" variant="light">
                Success Rate: {((metrics.successfulTransactions / metrics.totalTransactions) * 100).toFixed(1)}%
              </Badge>
              <Badge color="blue" variant="light">
                Avg Volume: {(timeSeriesData.reduce((sum, d) => sum + d.volume, 0) / timeSeriesData.length).toFixed(0)} txns
              </Badge>
            </Group>
          </Card>
        </Grid.Col>

        {/* Currency Distribution */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Stack gap={4}>
                <Text fw={600}>Currency Distribution</Text>
                <Text size="sm" c="dimmed">Transaction volume by currency</Text>
              </Stack>
            </Group>
            
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={currencyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  labelLine={false}
                >
                  {currencyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => [
                    `${value} transactions`,
                    'Count'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            <Stack mt="md" gap="xs">
              {currencyData.slice(0, 3).map((currency, index) => (
                <Group key={currency.name} justify="space-between">
                  <Group gap="xs">
                    <div 
                      style={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: 2, 
                        backgroundColor: CHART_COLORS[index] 
                      }} 
                    />
                    <Text size="sm">{currency.name}</Text>
                  </Group>
                  <Text size="sm" c="dimmed">{currency.percentage}%</Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Processing Performance Breakdown */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Stack gap={4}>
                <Text fw={600}>Processing Performance</Text>
                <Text size="sm" c="dimmed">ETL pipeline step breakdown</Text>
              </Stack>
            </Group>
            
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" stroke="#868e96" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#868e96" fontSize={12} width={80} />
                <RechartsTooltip 
                  formatter={(value) => [`${value}ms`, 'Processing Time']}
                />
                <Bar dataKey="time" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>

            <Table mt="md">
              <Table.Tbody>
                {performanceData.map((step) => (
                  <Table.Tr key={step.name}>
                    <Table.Td>{step.name}</Table.Td>
                    <Table.Td ta="right">{step.time}ms</Table.Td>
                    <Table.Td ta="right">{step.percentage.toFixed(1)}%</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>

        {/* Risk Assessment Matrix */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Stack gap={4}>
                <Text fw={600}>Risk Assessment</Text>
                <Text size="sm" c="dimmed">Transaction risk distribution</Text>
              </Stack>
            </Group>
            
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.name === 'High' ? COLORS.danger :
                      entry.name === 'Medium' ? COLORS.warning :
                      entry.name === 'Low' ? COLORS.secondary :
                      COLORS.info
                    } />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>

            <Stack mt="md" gap="xs">
              {riskData.map((risk) => (
                <Group key={risk.name} justify="space-between">
                  <Group gap="xs">
                    <Badge 
                      color={
                        risk.name === 'High' ? 'red' :
                        risk.name === 'Medium' ? 'yellow' :
                        risk.name === 'Low' ? 'green' : 'blue'
                      }
                      variant="light"
                      size="sm"
                    >
                      {risk.name}
                    </Badge>
                  </Group>
                  <Text size="sm">{risk.value} ({risk.percentage}%)</Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Processing Time Trend */}
        <Grid.Col span={12}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Stack gap={4}>
                <Text fw={600}>Processing Time & Quality Trends</Text>
                <Text size="sm" c="dimmed">Performance metrics correlation analysis</Text>
              </Stack>
            </Group>
            
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                <XAxis dataKey="time" stroke="#868e96" fontSize={12} />
                <YAxis yAxisId="left" stroke="#868e96" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#868e96" fontSize={12} />
                <RechartsTooltip />
                <Legend />
                
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="processingTime" 
                  stroke={COLORS.accent} 
                  strokeWidth={2} 
                  name="Avg Processing Time (ms)" 
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="volume" 
                  fill={COLORS.primary} 
                  fillOpacity={0.3} 
                  name="Transaction Volume" 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}