import { useState, useMemo } from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Badge,
  Select,
  SegmentedControl,
  Stack,
  Progress,
  Alert,
  NumberFormatter,
  Table,
  ActionIcon,
  Tabs,
  ThemeIcon
} from '@mantine/core';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCurrencyEuro,
  IconAlertTriangle,
  IconChecks,
  IconDownload,
  IconRefresh,
  IconAnalyze,
  IconTarget,
  IconShield,
  IconBuilding,
} from '@tabler/icons-react';
import { useETLData } from '@/hooks/useETLData';
import { FinancialTransaction } from '@/types';
import { ExecutiveSummary } from '@/components/executive/ExecutiveSummary';
import { DataQualityScorecard } from '@/components/analytics/DataQualityScorecard';
import { AnalyticsLoadingState, ErrorState } from '@/components/common/LoadingStates';

// Color palette for professional financial charts
const CHART_COLORS = {
  primary: '#228be6',
  success: '#51cf66',
  warning: '#ffd43b', 
  danger: '#ff6b6b',
  info: '#74c0fc',
  secondary: '#9775fa',
  dark: '#495057',
  light: '#f8f9fa'
};

interface TrendAnalysis {
  period: string;
  volume: number;
  value: number;
  creditCount: number;
  debitCount: number;
  avgAmount: number;
  reconciliationRate: number;
  riskScore: number;
}

interface CounterpartyAnalysis {
  name: string;
  transactionCount: number;
  totalValue: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  avgDays: number;
  reconciliationRate: number;
}

interface RiskMetrics {
  category: string;
  count: number;
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export function AnalyticsPage() {
  const { transactions, isLoading, error } = useETLData();
  const [timeRange, setTimeRange] = useState('30d');
  const [analysisType, setAnalysisType] = useState('executive');
  const [selectedCurrency, setSelectedCurrency] = useState('ALL');

  // Advanced analytics calculations
  const analyticsData = useMemo(() => {
    if (!transactions.length) return null;

    // Filter transactions by time range
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    let filteredTransactions = transactions.filter(t => new Date(t.valueDate) >= cutoffDate);
    
    if (selectedCurrency !== 'ALL') {
      filteredTransactions = filteredTransactions.filter(t => t.amount.currency === selectedCurrency);
    }

    // Daily trend analysis
    const dailyTrends: TrendAnalysis[] = [];
    const dayGroups = new Map<string, FinancialTransaction[]>();
    
    filteredTransactions.forEach(transaction => {
      const day = transaction.valueDate.split('T')[0];
      if (!dayGroups.has(day)) dayGroups.set(day, []);
      dayGroups.get(day)!.push(transaction);
    });

    Array.from(dayGroups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([day, dayTransactions]) => {
        const credits = dayTransactions.filter(t => t.creditDebitIndicator === 'CRDT');
        const debits = dayTransactions.filter(t => t.creditDebitIndicator === 'DBIT');
        const matched = dayTransactions.filter(t => t.reconciliationStatus === 'MATCHED');
        const highRisk = dayTransactions.filter(t => t.riskLevel === 'HIGH');
        
        const totalValue = dayTransactions.reduce((sum, t) => sum + t.amount.original, 0);
        
        dailyTrends.push({
          period: day,
          volume: dayTransactions.length,
          value: totalValue,
          creditCount: credits.length,
          debitCount: debits.length,
          avgAmount: totalValue / dayTransactions.length,
          reconciliationRate: (matched.length / dayTransactions.length) * 100,
          riskScore: (highRisk.length / dayTransactions.length) * 100
        });
      });

    // Counterparty analysis
    const counterpartyMap = new Map<string, FinancialTransaction[]>();
    filteredTransactions.forEach(t => {
      if (!counterpartyMap.has(t.counterparty.name)) {
        counterpartyMap.set(t.counterparty.name, []);
      }
      counterpartyMap.get(t.counterparty.name)!.push(t);
    });

    const counterpartyAnalysis: CounterpartyAnalysis[] = Array.from(counterpartyMap.entries())
      .map(([name, txs]) => {
        const totalValue = txs.reduce((sum, t) => sum + t.amount.original, 0);
        const matched = txs.filter(t => t.reconciliationStatus === 'MATCHED');
        const highRisk = txs.filter(t => t.riskLevel === 'HIGH');
        const dates = txs.map(t => new Date(t.valueDate));
        const avgDays = dates.length > 1 ? 
          (Math.max(...dates.map(d => d.getTime())) - Math.min(...dates.map(d => d.getTime()))) / (1000 * 60 * 60 * 24) / (dates.length - 1) : 0;

        return {
          name,
          transactionCount: txs.length,
          totalValue,
          riskLevel: (highRisk.length > txs.length * 0.3 ? 'HIGH' : highRisk.length > txs.length * 0.1 ? 'MEDIUM' : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
          avgDays: Math.round(avgDays),
          reconciliationRate: (matched.length / txs.length) * 100
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

    // Risk analysis
    const riskMetrics: RiskMetrics[] = [
      {
        category: 'High Risk Transactions',
        count: filteredTransactions.filter(t => t.riskLevel === 'HIGH').length,
        value: filteredTransactions.filter(t => t.riskLevel === 'HIGH').reduce((sum, t) => sum + t.amount.original, 0),
        percentage: (filteredTransactions.filter(t => t.riskLevel === 'HIGH').length / filteredTransactions.length) * 100,
        trend: 'stable'
      },
      {
        category: 'Reconciliation Exceptions',
        count: filteredTransactions.filter(t => t.reconciliationStatus === 'EXCEPTION').length,
        value: filteredTransactions.filter(t => t.reconciliationStatus === 'EXCEPTION').reduce((sum, t) => sum + t.amount.original, 0),
        percentage: (filteredTransactions.filter(t => t.reconciliationStatus === 'EXCEPTION').length / filteredTransactions.length) * 100,
        trend: 'down'
      },
      {
        category: 'Large Transactions (>10K)',
        count: filteredTransactions.filter(t => t.amount.original > 10000).length,
        value: filteredTransactions.filter(t => t.amount.original > 10000).reduce((sum, t) => sum + t.amount.original, 0),
        percentage: (filteredTransactions.filter(t => t.amount.original > 10000).length / filteredTransactions.length) * 100,
        trend: 'up'
      },
      {
        category: 'Cross-Border Transactions',
        count: filteredTransactions.filter(t => t.fxConversion !== undefined).length,
        value: filteredTransactions.filter(t => t.fxConversion !== undefined).reduce((sum, t) => sum + (t.fxConversion?.convertedAmount || t.amount.original), 0),
        percentage: (filteredTransactions.filter(t => t.fxConversion !== undefined).length / filteredTransactions.length) * 100,
        trend: 'stable'
      }
    ];

    // Currency distribution
    const currencyMap = new Map<string, { count: number; value: number }>();
    filteredTransactions.forEach(t => {
      const currency = t.amount.currency;
      if (!currencyMap.has(currency)) {
        currencyMap.set(currency, { count: 0, value: 0 });
      }
      const data = currencyMap.get(currency)!;
      data.count++;
      data.value += t.amount.original;
    });

    const currencyDistribution = Array.from(currencyMap.entries()).map(([currency, data]) => ({
      currency,
      count: data.count,
      value: data.value,
      percentage: (data.count / filteredTransactions.length) * 100
    }));

    return {
      dailyTrends,
      counterpartyAnalysis,
      riskMetrics,
      currencyDistribution,
      summary: {
        totalTransactions: filteredTransactions.length,
        totalValue: filteredTransactions.reduce((sum, t) => sum + t.amount.original, 0),
        reconciliationRate: (filteredTransactions.filter(t => t.reconciliationStatus === 'MATCHED').length / filteredTransactions.length) * 100,
        riskScore: (filteredTransactions.filter(t => t.riskLevel === 'HIGH').length / filteredTransactions.length) * 100
      }
    };
  }, [transactions, timeRange, selectedCurrency]);

  const currencies = useMemo(() => {
    const currencySet = new Set(transactions.map(t => t.amount.currency));
    return ['ALL', ...Array.from(currencySet)];
  }, [transactions]);

  if (isLoading) return <Container size="xl"><AnalyticsLoadingState /></Container>;
  if (error) return <Container size="xl"><ErrorState title="Analytics Error" message="Unable to load analytics data. Please check your data connection and try again." /></Container>;
  if (!analyticsData) return <Container size="xl"><ErrorState title="No Data" message="No financial data is available for analysis. Please ensure transactions are loaded." /></Container>;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <IconTrendingUp size={16} color={CHART_COLORS.success} />;
      case 'down': return <IconTrendingDown size={16} color={CHART_COLORS.danger} />;
      default: return <IconTarget size={16} color={CHART_COLORS.info} />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return CHART_COLORS.danger;
      case 'MEDIUM': return CHART_COLORS.warning;
      case 'LOW': return CHART_COLORS.success;
      default: return CHART_COLORS.secondary;
    }
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={1}>Financial Analytics Dashboard</Title>
          <Text size="lg" c="dimmed">
            Advanced transaction analytics with trend analysis and risk assessment
          </Text>
        </div>
        
        <Group gap="sm">
          <ActionIcon variant="light" size="lg">
            <IconRefresh size={20} />
          </ActionIcon>
          <ActionIcon variant="light" size="lg">
            <IconDownload size={20} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Controls */}
      <Card withBorder mb="md" p="md">
        <Group justify="space-between">
          <Group gap="md">
            <Select
              label="Time Range"
              value={timeRange}
              onChange={(value) => setTimeRange(value || '30d')}
              data={[
                { value: '7d', label: 'Last 7 days' },
                { value: '30d', label: 'Last 30 days' },
                { value: '90d', label: 'Last 90 days' },
                { value: '365d', label: 'Last year' }
              ]}
              style={{ minWidth: 120 }}
            />
            
            <Select
              label="Currency"
              value={selectedCurrency}
              onChange={(value) => setSelectedCurrency(value || 'ALL')}
              data={currencies.map(c => ({ value: c, label: c }))}
              style={{ minWidth: 100 }}
            />
          </Group>
          
          <SegmentedControl
            value={analysisType}
            onChange={setAnalysisType}
            data={[
              { label: 'Executive', value: 'executive' },
              { label: 'Trends', value: 'trends' },
              { label: 'Risk', value: 'risk' },
              { label: 'Counterparties', value: 'counterparties' },
              { label: 'Quality', value: 'quality' }
            ]}
          />
        </Group>
      </Card>

      {/* Summary Cards */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" h="100%">
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Transactions</Text>
              <ThemeIcon color="blue" variant="light" size="sm">
                <IconAnalyze size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">{analyticsData.summary.totalTransactions.toLocaleString()}</Text>
            <Progress value={100} color="blue" size="xs" mt="xs" />
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" h="100%">
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Value</Text>
              <ThemeIcon color="green" variant="light" size="sm">
                <IconCurrencyEuro size={16} />
              </ThemeIcon>
            </Group>
            <NumberFormatter 
              value={analyticsData.summary.totalValue} 
              prefix="€ " 
              thousandSeparator 
              decimalScale={0}
              style={{ fontWeight: 700, fontSize: '1.25rem' }}
            />
            <Progress value={100} color="green" size="xs" mt="xs" />
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" h="100%">
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Reconciliation Rate</Text>
              <ThemeIcon color={analyticsData.summary.reconciliationRate > 80 ? 'green' : 'yellow'} variant="light" size="sm">
                <IconChecks size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">{analyticsData.summary.reconciliationRate.toFixed(1)}%</Text>
            <Progress value={analyticsData.summary.reconciliationRate} color={analyticsData.summary.reconciliationRate > 80 ? 'green' : 'yellow'} size="xs" mt="xs" />
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" h="100%">
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Risk Score</Text>
              <ThemeIcon color={analyticsData.summary.riskScore > 20 ? 'red' : analyticsData.summary.riskScore > 10 ? 'yellow' : 'green'} variant="light" size="sm">
                <IconShield size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">{analyticsData.summary.riskScore.toFixed(1)}%</Text>
            <Progress value={analyticsData.summary.riskScore} color={analyticsData.summary.riskScore > 20 ? 'red' : analyticsData.summary.riskScore > 10 ? 'yellow' : 'green'} size="xs" mt="xs" />
          </Card>
        </Grid.Col>
      </Grid>

      <Tabs value={analysisType} onChange={(value) => setAnalysisType(value || 'trends')}>
        <Tabs.List mb="md">
          <Tabs.Tab value="executive" leftSection={<IconTarget size={16} />}>
            Executive Summary
          </Tabs.Tab>
          <Tabs.Tab value="trends" leftSection={<IconTrendingUp size={16} />}>
            Trend Analysis
          </Tabs.Tab>
          <Tabs.Tab value="risk" leftSection={<IconAlertTriangle size={16} />}>
            Risk Analysis
          </Tabs.Tab>
          <Tabs.Tab value="counterparties" leftSection={<IconBuilding size={16} />}>
            Counterparty Analysis
          </Tabs.Tab>
          <Tabs.Tab value="quality" leftSection={<IconShield size={16} />}>
            Data Quality
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="executive">
          <ExecutiveSummary 
            transactions={transactions} 
            timeframe={timeRange === '7d' ? 'weekly' : timeRange === '30d' ? 'monthly' : timeRange === '90d' ? 'quarterly' : 'quarterly'}
          />
        </Tabs.Panel>

        <Tabs.Panel value="trends">
          <Grid>
            {/* Transaction Volume Trend */}
            <Grid.Col span={12}>
              <Card withBorder p="md">
                <Group justify="space-between" mb="md">
                  <Text fw={600} size="lg">Transaction Volume & Value Trends</Text>
                  <Badge color="blue" variant="light">Daily Analysis</Badge>
                </Group>
                
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analyticsData.dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="volume" fill={CHART_COLORS.primary} name="Transaction Count" />
                    <Line yAxisId="right" type="monotone" dataKey="value" stroke={CHART_COLORS.success} name="Total Value" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>
            
            {/* Credit vs Debit Analysis */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder p="md" h="100%">
                <Text fw={600} size="lg" mb="md">Credit vs Debit Distribution</Text>
                
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={analyticsData.dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="creditCount" stackId="1" stroke={CHART_COLORS.success} fill={CHART_COLORS.success} name="Credits" />
                    <Area type="monotone" dataKey="debitCount" stackId="1" stroke={CHART_COLORS.danger} fill={CHART_COLORS.danger} name="Debits" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>
            
            {/* Reconciliation Rate Trend */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder p="md" h="100%">
                <Text fw={600} size="lg" mb="md">Reconciliation Performance</Text>
                
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analyticsData.dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Reconciliation Rate']} />
                    <Line type="monotone" dataKey="reconciliationRate" stroke={CHART_COLORS.info} strokeWidth={3} name="Reconciliation Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="risk">
          <Grid>
            {/* Risk Metrics Overview */}
            <Grid.Col span={12}>
              <Card withBorder p="md">
                <Text fw={600} size="lg" mb="md">Risk Assessment Dashboard</Text>
                
                <Grid>
                  {analyticsData.riskMetrics.map((metric, index) => (
                    <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
                      <Card bg="gray.0" p="md" h="100%">
                        <Group justify="space-between" mb="xs">
                          <Text size="sm" fw={500}>{metric.category}</Text>
                          {getTrendIcon(metric.trend)}
                        </Group>
                        
                        <Group justify="space-between" mb="xs">
                          <Text fw={700} size="xl">{metric.count}</Text>
                          <Badge color={metric.percentage > 20 ? 'red' : metric.percentage > 10 ? 'yellow' : 'green'} variant="light">
                            {metric.percentage.toFixed(1)}%
                          </Badge>
                        </Group>
                        
                        <NumberFormatter 
                          value={metric.value} 
                          prefix="€ " 
                          thousandSeparator 
                          decimalScale={0}
                          style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)' }}
                        />
                        
                        <Progress 
                          value={metric.percentage} 
                          color={metric.percentage > 20 ? 'red' : metric.percentage > 10 ? 'yellow' : 'green'} 
                          size="xs" 
                          mt="xs" 
                        />
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Card>
            </Grid.Col>
            
            {/* Currency Distribution */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder p="md" h="100%">
                <Text fw={600} size="lg" mb="md">Currency Distribution</Text>
                
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.currencyDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      nameKey="currency"
                    >
                      {analyticsData.currencyDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>
            
            {/* Risk Score Timeline */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder p="md" h="100%">
                <Text fw={600} size="lg" mb="md">Daily Risk Score Evolution</Text>
                
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Risk Score']} />
                    <Line 
                      type="monotone" 
                      dataKey="riskScore" 
                      stroke={CHART_COLORS.warning} 
                      strokeWidth={3} 
                      name="Risk Score %" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="counterparties">
          <Grid>
            {/* Top Counterparties Table */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card withBorder p="md">
                <Group justify="space-between" mb="md">
                  <Text fw={600} size="lg">Top Counterparties by Transaction Volume</Text>
                  <Badge color="blue" variant="light">Top 10</Badge>
                </Group>
                
                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Counterparty</Table.Th>
                      <Table.Th>Transactions</Table.Th>
                      <Table.Th>Total Value</Table.Th>
                      <Table.Th>Risk Level</Table.Th>
                      <Table.Th>Reconciliation Rate</Table.Th>
                      <Table.Th>Avg. Days</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {analyticsData.counterpartyAnalysis.map((cp, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <Text size="sm" fw={500} lineClamp={1}>{cp.name}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{cp.transactionCount}</Text>
                        </Table.Td>
                        <Table.Td>
                          <NumberFormatter 
                            value={cp.totalValue} 
                            prefix="€ " 
                            thousandSeparator 
                            decimalScale={0}
                            style={{ fontSize: '0.875rem' }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getRiskColor(cp.riskLevel)} variant="light" size="sm">
                            {cp.riskLevel}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Progress 
                              value={cp.reconciliationRate} 
                              color={cp.reconciliationRate > 80 ? 'green' : 'yellow'} 
                              size="sm" 
                              style={{ width: 60 }} 
                            />
                            <Text size="xs" c="dimmed">{cp.reconciliationRate.toFixed(0)}%</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{cp.avgDays}</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
            
            {/* Counterparty Risk Distribution */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder p="md" h="100%">
                <Text fw={600} size="lg" mb="md">Risk Distribution</Text>
                
                <Stack gap="md">
                  {['HIGH', 'MEDIUM', 'LOW'].map(riskLevel => {
                    const count = analyticsData.counterpartyAnalysis.filter(cp => cp.riskLevel === riskLevel).length;
                    const percentage = (count / analyticsData.counterpartyAnalysis.length) * 100;
                    
                    return (
                      <div key={riskLevel}>
                        <Group justify="space-between" mb="xs">
                          <Text size="sm" fw={500}>{riskLevel} Risk</Text>
                          <Text size="sm" c="dimmed">{count} entities</Text>
                        </Group>
                        <Progress 
                          value={percentage} 
                          color={getRiskColor(riskLevel)} 
                          size="lg" 
                        />
                        <Text size="xs" c="dimmed" mt="xs">{percentage.toFixed(1)}% of total</Text>
                      </div>
                    );
                  })}
                </Stack>
                
                <Alert color="blue" variant="light" mt="md">
                  <Text size="sm">
                    Risk assessment based on transaction patterns, reconciliation rates, and historical performance.
                  </Text>
                </Alert>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="quality">
          <DataQualityScorecard transactions={transactions} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}