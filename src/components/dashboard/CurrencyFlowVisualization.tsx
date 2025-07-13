import { useMemo, useState } from 'react';
import {
  Card,
  Grid,
  Text,
  Group,
  Stack,
  Badge,
  Select,
  ActionIcon,
  Table,
  NumberFormatter,
  Progress,
  ThemeIcon,
  Tabs,
} from '@mantine/core';
import {
  ResponsiveContainer,
  Cell,
  Treemap,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
} from 'recharts';
import {
  IconCurrencyDollar,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowsExchange,
  IconWorld,
  IconRefresh,
  IconDownload,
  IconChartDots,
  IconMap,
} from '@tabler/icons-react';
import { ProcessingMetrics, CurrencyCode } from '@/types';

interface CurrencyFlowVisualizationProps {
  metrics: ProcessingMetrics;
  transactions?: unknown[];
  isLoading?: boolean;
}

type FlowViewType = 'overview' | 'conversions' | 'geographic' | 'trends';

const CURRENCY_COLORS = {
  USD: '#228be6',
  EUR: '#40c057',
  GBP: '#fd7e14',
  SGD: '#fa5252',
  JPY: '#be4bdb',
  CNY: '#15aabf',
  AUD: '#fab005',
  CHF: '#51cf66',
} as const;

const CURRENCY_REGIONS = {
  USD: 'Americas',
  EUR: 'Europe',
  GBP: 'Europe',
  SGD: 'Asia-Pacific',
  JPY: 'Asia-Pacific',
  CNY: 'Asia-Pacific',
  AUD: 'Asia-Pacific',
  CHF: 'Europe',
} as const;

const FX_RATES_MOCK = {
  'USD-SGD': 1.345,
  'EUR-SGD': 1.446,
  'GBP-SGD': 1.683,
  'JPY-SGD': 0.009,
  'CNY-SGD': 0.186,
  'AUD-SGD': 0.896,
  'CHF-SGD': 1.456,
} as const;

export function CurrencyFlowVisualization({ metrics, isLoading }: CurrencyFlowVisualizationProps) {
  const [flowView, setFlowView] = useState<FlowViewType>('overview');
  const [timeframe, setTimeframe] = useState<string>('7d');

  // Calculate currency flow data
  const currencyFlowData = useMemo(() => {
    const activeCurrencies = Object.entries(metrics.currencyDistribution)
      .filter(([, data]) => data.count > 0)
      .map(([currency, data]) => ({
        currency: currency as CurrencyCode,
        count: data.count,
        totalAmount: data.totalAmount,
        averageAmount: data.averageAmount,
        region: CURRENCY_REGIONS[currency as CurrencyCode] || 'Other',
        color: CURRENCY_COLORS[currency as CurrencyCode] || '#868e96',
        sgdEquivalent: data.totalAmount * (FX_RATES_MOCK[`${currency}-SGD` as keyof typeof FX_RATES_MOCK] || 1),
        marketShare: 0, // Will be calculated below
        volatility: Math.random() * 10 + 2, // Mock volatility data
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: (Math.random() - 0.5) * 20, // -10% to +10%
      }));

    const totalSgdValue = activeCurrencies.reduce((sum, curr) => sum + curr.sgdEquivalent, 0);
    activeCurrencies.forEach(curr => {
      curr.marketShare = (curr.sgdEquivalent / totalSgdValue) * 100;
    });

    return activeCurrencies.sort((a, b) => b.marketShare - a.marketShare);
  }, [metrics]);


  // Generate geographic distribution data
  const geographicData = useMemo(() => {
    const regionTotals: Record<string, { value: number; count: number; currencies: string[] }> = {};
    
    currencyFlowData.forEach((currency) => {
      if (!regionTotals[currency.region]) {
        regionTotals[currency.region] = { value: 0, count: 0, currencies: [] };
      }
      regionTotals[currency.region].value += currency.sgdEquivalent;
      regionTotals[currency.region].count += currency.count;
      regionTotals[currency.region].currencies.push(currency.currency);
    });

    return Object.entries(regionTotals).map(([region, data]) => ({
      region,
      value: data.value,
      count: data.count,
      currencies: data.currencies,
      percentage: (data.value / currencyFlowData.reduce((sum, curr) => sum + curr.sgdEquivalent, 0)) * 100,
    })).sort((a, b) => b.value - a.value);
  }, [currencyFlowData]);

  // Generate trend data
  const trendData = useMemo(() => {
    const days = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      const data: Record<string, number | string> & { totalVolume: number } = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString(),
        totalVolume: 0,
      };

      currencyFlowData.forEach((currency) => {
        const dailyVolume = currency.sgdEquivalent / days + (Math.random() - 0.5) * (currency.sgdEquivalent / days * 0.3);
        const volume = Math.max(0, dailyVolume);
        data[currency.currency] = volume;
        data.totalVolume += volume;
      });

      return data;
    });
  }, [currencyFlowData, timeframe]);

  // TreeMap data for currency exposure
  const treeMapData = useMemo(() => {
    return currencyFlowData.map((currency) => ({
      name: currency.currency,
      size: currency.sgdEquivalent,
      count: currency.count,
      region: currency.region,
      color: currency.color,
    }));
  }, [currencyFlowData]);

  if (isLoading) {
    return (
      <Grid>
        {Array.from({ length: 4 }).map((_, i) => (
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
          <Text size="xl" fw={700}>Currency Flow Visualization</Text>
          <Text size="sm" c="dimmed">
            Multi-currency transaction flow analysis and exposure monitoring
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
            <IconRefresh size={16} />
          </ActionIcon>
          
          <ActionIcon variant="subtle">
            <IconDownload size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Tabs value={flowView} onChange={(value) => setFlowView(value as FlowViewType)}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconCurrencyDollar size={16} />}>
            Currency Overview
          </Tabs.Tab>
          <Tabs.Tab value="conversions" leftSection={<IconArrowsExchange size={16} />}>
            FX Conversions
          </Tabs.Tab>
          <Tabs.Tab value="geographic" leftSection={<IconMap size={16} />}>
            Geographic Distribution
          </Tabs.Tab>
          <Tabs.Tab value="trends" leftSection={<IconChartDots size={16} />}>
            Flow Trends
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="lg">
          <Grid>
            {/* Currency Exposure TreeMap */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Stack gap={4}>
                    <Text fw={600}>Currency Exposure Map</Text>
                    <Text size="sm" c="dimmed">Proportional view of currency volumes (SGD equivalent)</Text>
                  </Stack>
                </Group>
                
                <ResponsiveContainer width="100%" height={350}>
                  <Treemap
                    data={treeMapData}
                    dataKey="size"
                    aspectRatio={4/3}
                    stroke="#fff"
                  >
                    {treeMapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Treemap>
                </ResponsiveContainer>

                <Group justify="space-between" mt="md">
                  <Text size="sm" c="dimmed">
                    Total Exposure: <NumberFormatter value={currencyFlowData.reduce((sum, curr) => sum + curr.sgdEquivalent, 0)} prefix="SGD " thousandSeparator />
                  </Text>
                  <Text size="sm" c="dimmed">
                    {currencyFlowData.length} Active Currencies
                  </Text>
                </Group>
              </Card>
            </Grid.Col>

            {/* Currency Performance Summary */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Currency Performance</Text>
                
                <Stack gap="md">
                  {currencyFlowData.slice(0, 5).map((currency) => (
                    <Group key={currency.currency} justify="space-between">
                      <Group gap="sm">
                        <ThemeIcon color={currency.color} variant="light" size="sm">
                          <IconCurrencyDollar size={14} />
                        </ThemeIcon>
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>{currency.currency}</Text>
                          <Text size="xs" c="dimmed">{currency.region}</Text>
                        </Stack>
                      </Group>
                      
                      <Stack gap={0} align="flex-end">
                        <Group gap={4}>
                          <Text size="sm" fw={600}>{currency.marketShare.toFixed(1)}%</Text>
                          {currency.trend === 'up' ? (
                            <IconTrendingUp size={12} color="green" />
                          ) : (
                            <IconTrendingDown size={12} color="red" />
                          )}
                        </Group>
                        <Text size="xs" c={currency.change > 0 ? 'green' : 'red'}>
                          {currency.change > 0 ? '+' : ''}{currency.change.toFixed(1)}%
                        </Text>
                      </Stack>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Currency Details Table */}
            <Grid.Col span={12}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Currency Analysis Details</Text>
                
                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Currency</Table.Th>
                      <Table.Th ta="center">Transactions</Table.Th>
                      <Table.Th ta="center">Original Amount</Table.Th>
                      <Table.Th ta="center">SGD Equivalent</Table.Th>
                      <Table.Th ta="center">Market Share</Table.Th>
                      <Table.Th ta="center">Avg Transaction</Table.Th>
                      <Table.Th ta="center">Volatility</Table.Th>
                      <Table.Th ta="center">Trend</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {currencyFlowData.map((currency) => (
                      <Table.Tr key={currency.currency}>
                        <Table.Td>
                          <Group gap="sm">
                            <div 
                              style={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: 2, 
                                backgroundColor: currency.color 
                              }} 
                            />
                            <Stack gap={0}>
                              <Text size="sm" fw={500}>{currency.currency}</Text>
                              <Text size="xs" c="dimmed">{currency.region}</Text>
                            </Stack>
                          </Group>
                        </Table.Td>
                        <Table.Td ta="center">{currency.count}</Table.Td>
                        <Table.Td ta="center">
                          <NumberFormatter value={currency.totalAmount} thousandSeparator />
                        </Table.Td>
                        <Table.Td ta="center">
                          <NumberFormatter value={currency.sgdEquivalent} prefix="SGD " thousandSeparator />
                        </Table.Td>
                        <Table.Td ta="center">
                          <Badge variant="light" color={currency.color} size="sm">
                            {currency.marketShare.toFixed(1)}%
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="center">
                          <NumberFormatter value={currency.averageAmount} thousandSeparator />
                        </Table.Td>
                        <Table.Td ta="center">
                          <Badge
                            color={currency.volatility < 5 ? 'green' : currency.volatility < 8 ? 'yellow' : 'red'}
                            variant="light"
                            size="sm"
                          >
                            {currency.volatility.toFixed(1)}%
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="center">
                          <Group gap={4} justify="center">
                            {currency.trend === 'up' ? (
                              <IconTrendingUp size={16} color="green" />
                            ) : (
                              <IconTrendingDown size={16} color="red" />
                            )}
                            <Text size="sm" c={currency.change > 0 ? 'green' : 'red'}>
                              {currency.change > 0 ? '+' : ''}{currency.change.toFixed(1)}%
                            </Text>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="conversions" pt="lg">
          <Grid>
            {/* FX Conversion Rates */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Current FX Rates (to SGD)</Text>
                
                <Stack gap="md">
                  {Object.entries(FX_RATES_MOCK).map(([pair, rate]) => {
                    const [from] = pair.split('-');
                    const currency = currencyFlowData.find(c => c.currency === from);
                    if (!currency) return null;
                    
                    return (
                      <Group key={pair} justify="space-between">
                        <Group gap="sm">
                          <div 
                            style={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: 2, 
                              backgroundColor: currency.color 
                            }} 
                          />
                          <Text size="sm">{pair}</Text>
                        </Group>
                        <Text size="sm" fw={600}>{rate.toFixed(4)}</Text>
                      </Group>
                    );
                  })}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Conversion Volume */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">FX Conversion Volume</Text>
                
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={currencyFlowData.filter(c => c.currency !== 'SGD')}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sgdEquivalent"
                      label={({ currency, marketShare }) => `${currency} ${marketShare.toFixed(1)}%`}
                      labelLine={false}
                    >
                      {currencyFlowData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => [
                        `SGD ${new Intl.NumberFormat().format(Number(value))}`,
                        'Converted Amount'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="geographic" pt="lg">
          <Grid>
            {/* Geographic Distribution */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Regional Distribution</Text>
                
                <Stack gap="lg">
                  {geographicData.map((region) => (
                    <Stack key={region.region} gap="xs">
                      <Group justify="space-between">
                        <Group gap="sm">
                          <ThemeIcon color="blue" variant="light" size="sm">
                            <IconWorld size={14} />
                          </ThemeIcon>
                          <Text size="sm" fw={500}>{region.region}</Text>
                          <Badge variant="light" size="xs">
                            {region.currencies.join(', ')}
                          </Badge>
                        </Group>
                        <Group gap="sm">
                          <Text size="sm" fw={600}>{region.percentage.toFixed(1)}%</Text>
                          <Text size="sm" c="dimmed">
                            <NumberFormatter value={region.value} prefix="SGD " thousandSeparator />
                          </Text>
                        </Group>
                      </Group>
                      <Progress value={region.percentage} color="blue" size="md" />
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Regional Summary */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Regional Summary</Text>
                
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Total Regions</Text>
                    <Text size="sm" fw={600}>{geographicData.length}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Largest Region</Text>
                    <Text size="sm" fw={600}>{geographicData[0]?.region}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Top Region Share</Text>
                    <Text size="sm" fw={600}>{geographicData[0]?.percentage.toFixed(1)}%</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Currency Diversity</Text>
                    <Badge color="blue" variant="light">
                      {currencyFlowData.length} currencies
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="trends" pt="lg">
          <Grid>
            <Grid.Col span={12}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={600} mb="md">Currency Flow Trends</Text>
                
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    
                    {currencyFlowData.map((currency) => (
                      <Area
                        key={currency.currency}
                        type="monotone"
                        dataKey={currency.currency}
                        stackId="1"
                        stroke={currency.color}
                        fill={currency.color}
                        fillOpacity={0.6}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}