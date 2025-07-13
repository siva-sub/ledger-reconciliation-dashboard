import {
  Card,
  Grid,
  Text,
  Group,
  Stack,
  Badge,
  Progress,
  ThemeIcon,
  ActionIcon,
  Tooltip,
  NumberFormatter,
} from '@mantine/core';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconCurrency,
  IconShield,
  IconInfoCircle,
} from '@tabler/icons-react';
import { ProcessingMetrics } from '@/types';

interface ExecutiveKPIDashboardProps {
  metrics: ProcessingMetrics;
  dateRange?: string;
  isLoading?: boolean;
}

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
  description?: string;
  target?: number;
  unit?: string;
  subtitle?: string;
}

function KPICard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  color, 
  description,
  target,
  unit = '',
  subtitle
}: KPICardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    
    if (changeType === 'increase') {
      return <IconTrendingUp size={16} color="green" />;
    } else if (changeType === 'decrease') {
      return <IconTrendingDown size={16} color="red" />;
    }
    return <IconMinus size={16} color="gray" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return 'gray';
    return changeType === 'increase' ? 'green' : changeType === 'decrease' ? 'red' : 'gray';
  };

  const progressValue = target ? (Number(value) / target) * 100 : undefined;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Group>
          <ThemeIcon color={color} variant="light" size="lg">
            {icon}
          </ThemeIcon>
          <Stack gap={0}>
            <Text size="sm" c="dimmed" fw={500}>
              {title}
            </Text>
            {subtitle && (
              <Text size="xs" c="dimmed">
                {subtitle}
              </Text>
            )}
          </Stack>
        </Group>
        {description && (
          <Tooltip label={description} multiline w={220}>
            <ActionIcon variant="subtle" color="gray" size="sm">
              <IconInfoCircle size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      <Group align="flex-end" justify="space-between">
        <Stack gap={4}>
          <Group align="baseline" gap="xs">
            <Text size="xl" fw={700} c={color}>
              {typeof value === 'number' ? (
                <NumberFormatter value={value} thousandSeparator />
              ) : (
                value
              )}
            </Text>
            <Text size="sm" c="dimmed">{unit}</Text>
          </Group>
          
          {change !== undefined && (
            <Group gap={4}>
              {getTrendIcon()}
              <Text size="sm" c={getTrendColor()} fw={500}>
                {change > 0 ? '+' : ''}{change}%
              </Text>
              <Text size="xs" c="dimmed">vs last period</Text>
            </Group>
          )}
        </Stack>
      </Group>

      {target && progressValue !== undefined && (
        <Stack mt="md" gap={4}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">Target: {target}{unit}</Text>
            <Text size="xs" c="dimmed">{Math.round(progressValue)}%</Text>
          </Group>
          <Progress value={progressValue} color={color} size="sm" />
        </Stack>
      )}
    </Card>
  );
}

export function ExecutiveKPIDashboard({ metrics, dateRange, isLoading }: ExecutiveKPIDashboardProps) {
  if (isLoading) {
    return (
      <Grid>
        {Array.from({ length: 8 }).map((_, i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <div style={{ height: 120, backgroundColor: '#f8f9fa', borderRadius: 4 }} />
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  // Calculate derived metrics
  const reconciliationRate = ((metrics.successfulTransactions / metrics.totalTransactions) * 100);
  const fxConversionRate = metrics.foreignCurrencyCount > 0 
    ? ((metrics.successfulConversions / metrics.foreignCurrencyCount) * 100) 
    : 100;
  
  const totalRiskExposure = Object.values(metrics.riskDistribution).reduce((sum, count) => sum + count, 0);
  const highRiskPercentage = totalRiskExposure > 0 ? (metrics.riskDistribution.HIGH / totalRiskExposure) * 100 : 0;
  
  const totalCurrencyVolume = Object.values(metrics.currencyDistribution)
    .reduce((sum, curr) => sum + curr.totalAmount, 0);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Stack gap={4}>
          <Text size="xl" fw={700}>Executive KPI Dashboard</Text>
          <Text size="sm" c="dimmed">
            Real-time financial processing metrics and performance indicators
            {dateRange && ` • ${dateRange}`}
          </Text>
        </Stack>
        <Group>
          <Badge color="green" variant="light">
            <Group gap={4}>
              <IconCircleCheck size={12} />
              System Healthy
            </Group>
          </Badge>
          <Text size="xs" c="dimmed">
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </Group>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Transaction Volume"
            subtitle="Total processed today"
            value={metrics.totalTransactions}
            change={12.5}
            changeType="increase"
            icon={<IconCurrency />}
            color="blue"
            unit=" txns"
            target={1000}
            description="Total number of transactions processed through the ETL pipeline"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Reconciliation Rate"
            subtitle="Auto-match success"
            value={reconciliationRate.toFixed(1)}
            change={2.3}
            changeType="increase"
            icon={<IconCircleCheck />}
            color="green"
            unit="%"
            target={95}
            description="Percentage of transactions automatically reconciled without manual intervention"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Processing Time"
            subtitle="Average pipeline duration"
            value={metrics.processingTime.total}
            change={-5.8}
            changeType="increase"
            icon={<IconClock />}
            color="orange"
            unit=" ms"
            target={300}
            description="Average time taken to process transactions through the entire ETL pipeline"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Quality Score"
            subtitle="Data integrity rating"
            value={metrics.qualityScore}
            change={0.8}
            changeType="increase"
            icon={<IconShield />}
            color="teal"
            unit="%"
            target={98}
            description="Overall data quality score based on validation rules and completeness"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <KPICard
            title="FX Conversion Rate"
            subtitle="Currency processing success"
            value={fxConversionRate.toFixed(1)}
            change={1.2}
            changeType="increase"
            icon={<IconCurrency />}
            color="indigo"
            unit="%"
            target={99}
            description="Success rate of foreign exchange conversions"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <KPICard
            title="High Risk Exposure"
            subtitle="Transactions requiring review"
            value={highRiskPercentage.toFixed(1)}
            change={-2.1}
            changeType="increase"
            icon={<IconAlertTriangle />}
            color="red"
            unit="%"
            target={5}
            description="Percentage of transactions flagged as high risk requiring manual review"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Total Value Processed"
            subtitle="Cumulative transaction value"
            value={totalCurrencyVolume.toFixed(0)}
            change={8.7}
            changeType="increase"
            icon={<IconCurrency />}
            color="purple"
            unit=" SGD"
            description="Total monetary value of all transactions processed (converted to SGD)"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Exception Rate"
            subtitle="Failed transactions"
            value={((metrics.failedTransactions / metrics.totalTransactions) * 100).toFixed(1)}
            change={-1.5}
            changeType="increase"
            icon={<IconAlertTriangle />}
            color="yellow"
            unit="%"
            target={2}
            description="Percentage of transactions that failed processing and require intervention"
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}