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
  RingProgress,
  NumberFormatter,
  Tabs,
} from '@mantine/core';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ComposedChart,
  Line,
  Bar,
} from 'recharts';
import {
  IconAlertTriangle,
  IconShield,
  IconTrendingUp,
  IconEye,
  IconAlertCircle,
  IconCheck,
  IconTarget,
  IconFilter,
} from '@tabler/icons-react';
import { ProcessingMetrics } from '@/types';

interface RiskAnalyticsDashboardProps {
  metrics: ProcessingMetrics;
  transactions?: any[];
  isLoading?: boolean;
}

type RiskViewType = 'overview' | 'detailed' | 'trends' | 'heatmap';

const RISK_COLORS = {
  HIGH: '#fa5252',
  MEDIUM: '#fd7e14',
  LOW: '#51cf66',
  NONE: '#74c0fc',
} as const;

const RISK_THRESHOLDS = {
  critical: 15, // > 15% high risk is critical
  warning: 10,  // > 10% high risk is warning
  healthy: 5,   // < 5% high risk is healthy
} as const;

export function RiskAnalyticsDashboard({ metrics, isLoading }: RiskAnalyticsDashboardProps) {
  const [riskView, setRiskView] = useState<RiskViewType>('overview');
  const [timeframe, setTimeframe] = useState<string>('7d');

  // Calculate risk metrics
  const riskMetrics = useMemo(() => {
    const totalTransactions = Object.values(metrics.riskDistribution).reduce((sum, count) => sum + count, 0);
    const highRiskCount = metrics.riskDistribution.HIGH;
    const mediumRiskCount = metrics.riskDistribution.MEDIUM;
    const lowRiskCount = metrics.riskDistribution.LOW;
    
    const highRiskPercentage = totalTransactions > 0 ? (highRiskCount / totalTransactions) * 100 : 0;
    const mediumRiskPercentage = totalTransactions > 0 ? (mediumRiskCount / totalTransactions) * 100 : 0;
    const lowRiskPercentage = totalTransactions > 0 ? (lowRiskCount / totalTransactions) * 100 : 0;

    const riskScore = 100 - (highRiskPercentage * 0.8 + mediumRiskPercentage * 0.3);
    
    const alertLevel = highRiskPercentage > RISK_THRESHOLDS.critical ? 'critical' :
                     highRiskPercentage > RISK_THRESHOLDS.warning ? 'warning' : 'healthy';

    return {
      totalTransactions,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      highRiskPercentage,
      mediumRiskPercentage,
      lowRiskPercentage,
      riskScore,
      alertLevel,
    };
  }, [metrics]);

  // Generate risk trend data
  const riskTrendData = useMemo(() => {
    const days = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      const baseHigh = Math.floor(Math.random() * 8) + 2;
      const baseMedium = Math.floor(Math.random() * 15) + 10;
      const baseLow = Math.floor(Math.random() * 20) + 40;
      const total = baseHigh + baseMedium + baseLow;
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString(),
        high: baseHigh,
        medium: baseMedium,
        low: baseLow,
        total,
        riskScore: 100 - ((baseHigh / total) * 80 + (baseMedium / total) * 30),
        alerts: Math.floor(Math.random() * 3),
      };
    });
  }, [timeframe]);

  // Currency risk analysis
  const currencyRiskData = useMemo(() => {
    return Object.entries(metrics.currencyDistribution)
      .filter(([_, data]) => data.count > 0)
      .map(([currency, data]) => {
        const totalRisk = Object.values(data.riskDistribution).reduce((sum, count) => sum + count, 0);
        const riskScore = totalRisk > 0 ? 
          100 - ((data.riskDistribution.HIGH / totalRisk) * 80 + (data.riskDistribution.MEDIUM / totalRisk) * 30) : 100;
        
        return {
          currency,
          count: data.count,
          totalAmount: data.totalAmount,
          averageAmount: data.averageAmount,
          highRisk: data.riskDistribution.HIGH,
          mediumRisk: data.riskDistribution.MEDIUM,
          lowRisk: data.riskDistribution.LOW,
          riskScore,
          exposure: (data.totalAmount / Object.values(metrics.currencyDistribution).reduce((sum, d) => sum + d.totalAmount, 0)) * 100,
        };
      })
      .sort((a, b) => b.exposure - a.exposure);
  }, [metrics]);

  // Risk correlation matrix data
  const correlationData = useMemo(() => {
    return [
      { metric: 'Amount', high: 0.73, medium: 0.45, low: -0.23 },
      { metric: 'Currency', high: 0.34, medium: 0.12, low: -0.18 },
      { metric: 'Counterparty', high: 0.67, medium: 0.39, low: -0.45 },
      { metric: 'Processing Time', high: 0.29, medium: 0.15, low: -0.12 },
      { metric: 'Geography', high: 0.56, medium: 0.28, low: -0.31 },
    ];
  }, []);

  // Risk radar chart data
  const radarData = useMemo(() => {
    return [
      { subject: 'Transaction Volume', score: 85, fullMark: 100 },
      { subject: 'Currency Exposure', score: currencyRiskData.length > 0 ? Math.min(100, 120 - currencyRiskData[0].exposure) : 90, fullMark: 100 },
      { subject: 'Processing Quality', score: metrics.qualityScore, fullMark: 100 },
      { subject: 'Risk Management', score: riskMetrics.riskScore, fullMark: 100 },
      { subject: 'Compliance', score: 92, fullMark: 100 },
      { subject: 'Operational Efficiency', score: Math.max(0, 100 - (metrics.processingTime.total / 10)), fullMark: 100 },
    ];
  }, [metrics, currencyRiskData, riskMetrics]);

  const getRiskAlertContent = () => {
    const { alertLevel, highRiskPercentage, highRiskCount } = riskMetrics;
    
    const alertConfig = {
      critical: {
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
        title: 'Critical Risk Alert',
        message: `High risk transactions at ${highRiskPercentage.toFixed(1)}% (${highRiskCount} transactions). Immediate review required.`,
      },
      warning: {
        color: 'yellow',
        icon: <IconAlertCircle size={16} />,
        title: 'Risk Warning',
        message: `Elevated risk detected at ${highRiskPercentage.toFixed(1)}% (${highRiskCount} transactions). Monitor closely.`,
      },
      healthy: {
        color: 'green',
        icon: <IconCheck size={16} />,
        title: 'Risk Status: Healthy',
        message: `Risk levels within acceptable limits at ${highRiskPercentage.toFixed(1)}% (${highRiskCount} transactions).`,
      },
    };

    const config = alertConfig[alertLevel as keyof typeof alertConfig];
    
    return (
      <Alert color={config.color} icon={config.icon} variant="light">
        <Text fw={600} size="sm">{config.title}</Text>
        <Text size="sm">{config.message}</Text>
      </Alert>
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
          <Text size="xl" fw={700}>Risk Analytics Dashboard</Text>
          <Text size="sm" c="dimmed">
            Comprehensive risk assessment and monitoring for financial transactions
          </Text>
        </Stack>
        
        <Group>
          <Select
            value={timeframe}
            onChange={(value) => setTimeframe(value || '7d')}
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
            <IconFilter size={16} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Risk Alert */}
      <Grid>
        <Grid.Col span={12}>
          {getRiskAlertContent()}
        </Grid.Col>
      </Grid>

      <Tabs value={riskView} onChange={(value) => setRiskView(value as RiskViewType)}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconShield size={16} />}>
            Risk Overview
          </Tabs.Tab>
          <Tabs.Tab value="detailed" leftSection={<IconEye size={16} />}>
            Detailed Analysis
          </Tabs.Tab>
          <Tabs.Tab value="trends" leftSection={<IconTrendingUp size={16} />}>
            Risk Trends
          </Tabs.Tab>
          <Tabs.Tab value="heatmap" leftSection={<IconTarget size={16} />}>
            Risk Radar
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="lg">
          <Grid>
            {/* Risk Score Ring */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack align="center" gap="md">
                  <Text fw={600} ta="center">Overall Risk Score</Text>
                  <RingProgress
                    size={150}
                    thickness={12}
                    sections={[
                      {
                        value: riskMetrics.riskScore,
                        color: riskMetrics.riskScore > 80 ? 'green' : riskMetrics.riskScore > 60 ? 'yellow' : 'red',
                      },
                    ]}
                    label={
                      <Text size="xl" fw={700} ta="center">
                        {riskMetrics.riskScore.toFixed(0)}
                      </Text>
                    }
                  />
                  <Badge
                    color={riskMetrics.riskScore > 80 ? 'green' : riskMetrics.riskScore > 60 ? 'yellow' : 'red'}
                    variant="light"
                    size="lg"
                  >
                    {riskMetrics.riskScore > 80 ? 'Low Risk' : riskMetrics.riskScore > 60 ? 'Medium Risk' : 'High Risk'}
                  </Badge>
                </Stack>
              </Card>
            </Grid.Col>

            {/* Risk Distribution */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Risk Distribution</Text>
                
                <Stack gap="md">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon color="red" variant="light" size="sm">
                        <IconAlertTriangle size={14} />
                      </ThemeIcon>
                      <Text size="sm">High Risk</Text>
                    </Group>
                    <Group gap="sm">
                      <Text size="sm" fw={600}>{riskMetrics.highRiskCount}</Text>
                      <Text size="sm" c="dimmed">({riskMetrics.highRiskPercentage.toFixed(1)}%)</Text>
                    </Group>
                  </Group>
                  <Progress value={riskMetrics.highRiskPercentage} color="red" size="md" />

                  <Group justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon color="yellow" variant="light" size="sm">
                        <IconAlertCircle size={14} />
                      </ThemeIcon>
                      <Text size="sm">Medium Risk</Text>
                    </Group>
                    <Group gap="sm">
                      <Text size="sm" fw={600}>{riskMetrics.mediumRiskCount}</Text>
                      <Text size="sm" c="dimmed">({riskMetrics.mediumRiskPercentage.toFixed(1)}%)</Text>
                    </Group>
                  </Group>
                  <Progress value={riskMetrics.mediumRiskPercentage} color="yellow" size="md" />

                  <Group justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon color="green" variant="light" size="sm">
                        <IconCheck size={14} />
                      </ThemeIcon>
                      <Text size="sm">Low Risk</Text>
                    </Group>
                    <Group gap="sm">
                      <Text size="sm" fw={600}>{riskMetrics.lowRiskCount}</Text>
                      <Text size="sm" c="dimmed">({riskMetrics.lowRiskPercentage.toFixed(1)}%)</Text>
                    </Group>
                  </Group>
                  <Progress value={riskMetrics.lowRiskPercentage} color="green" size="md" />
                </Stack>
              </Card>
            </Grid.Col>

            {/* Currency Risk Exposure */}
            <Grid.Col span={12}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Currency Risk Exposure</Text>
                
                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Currency</Table.Th>
                      <Table.Th ta="center">Transactions</Table.Th>
                      <Table.Th ta="center">Total Amount</Table.Th>
                      <Table.Th ta="center">Risk Distribution</Table.Th>
                      <Table.Th ta="center">Risk Score</Table.Th>
                      <Table.Th ta="center">Exposure %</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {currencyRiskData.map((currency) => (
                      <Table.Tr key={currency.currency}>
                        <Table.Td>
                          <Badge variant="light" size="sm">
                            {currency.currency}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="center">{currency.count}</Table.Td>
                        <Table.Td ta="center">
                          <NumberFormatter value={currency.totalAmount} thousandSeparator />
                        </Table.Td>
                        <Table.Td ta="center">
                          <Group gap={4} justify="center">
                            {currency.highRisk > 0 && (
                              <Badge color="red" size="xs">{currency.highRisk}H</Badge>
                            )}
                            {currency.mediumRisk > 0 && (
                              <Badge color="yellow" size="xs">{currency.mediumRisk}M</Badge>
                            )}
                            {currency.lowRisk > 0 && (
                              <Badge color="green" size="xs">{currency.lowRisk}L</Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td ta="center">
                          <Badge
                            color={currency.riskScore > 80 ? 'green' : currency.riskScore > 60 ? 'yellow' : 'red'}
                            variant="light"
                            size="sm"
                          >
                            {currency.riskScore.toFixed(0)}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="center">{currency.exposure.toFixed(1)}%</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="detailed" pt="lg">
          <Grid>
            {/* Risk Scatter Plot */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Risk vs. Amount Analysis</Text>
                
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="amount" name="Amount" />
                    <YAxis dataKey="risk" name="Risk Score" />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                    
                    {currencyRiskData.map((currency, index) => (
                      <Scatter
                        key={currency.currency}
                        name={currency.currency}
                        data={[{
                          amount: currency.averageAmount,
                          risk: 100 - currency.riskScore,
                          size: currency.count * 10,
                        }]}
                        fill={`hsl(${index * 50}, 70%, 50%)`}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>

            {/* Risk Correlation Matrix */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Risk Correlation Matrix</Text>
                
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Factor</Table.Th>
                      <Table.Th ta="center">High</Table.Th>
                      <Table.Th ta="center">Med</Table.Th>
                      <Table.Th ta="center">Low</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {correlationData.map((row) => (
                      <Table.Tr key={row.metric}>
                        <Table.Td>{row.metric}</Table.Td>
                        <Table.Td ta="center">
                          <Text size="xs" c={row.high > 0.5 ? 'red' : row.high > 0.3 ? 'yellow' : 'green'}>
                            {row.high.toFixed(2)}
                          </Text>
                        </Table.Td>
                        <Table.Td ta="center">
                          <Text size="xs" c={row.medium > 0.3 ? 'orange' : 'blue'}>
                            {row.medium.toFixed(2)}
                          </Text>
                        </Table.Td>
                        <Table.Td ta="center">
                          <Text size="xs" c={row.low < -0.2 ? 'green' : 'gray'}>
                            {row.low.toFixed(2)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="trends" pt="lg">
          <Grid>
            <Grid.Col span={12}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Risk Trends Over Time</Text>
                
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    
                    <Bar yAxisId="left" dataKey="high" stackId="risk" fill={RISK_COLORS.HIGH} name="High Risk" />
                    <Bar yAxisId="left" dataKey="medium" stackId="risk" fill={RISK_COLORS.MEDIUM} name="Medium Risk" />
                    <Bar yAxisId="left" dataKey="low" stackId="risk" fill={RISK_COLORS.LOW} name="Low Risk" />
                    
                    <Line yAxisId="right" type="monotone" dataKey="riskScore" stroke="#228be6" strokeWidth={3} name="Risk Score" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="heatmap" pt="lg">
          <Grid>
            <Grid.Col span={12}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Risk Assessment Radar</Text>
                
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Risk Score"
                      dataKey="score"
                      stroke="#228be6"
                      fill="#228be6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}