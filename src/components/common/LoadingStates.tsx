import { Skeleton, Stack, Grid, Card, Text, Center, Loader, Group, ThemeIcon } from '@mantine/core';
import { IconChartBar } from '@tabler/icons-react';

export function TableLoadingState() {
  return (
    <Stack gap="xs">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} height={50} radius="md" />
      ))}
    </Stack>
  );
}

export function CardLoadingState() {
  return (
    <Card withBorder p="md">
      <Group justify="space-between" mb="md">
        <Skeleton height={20} width="40%" />
        <Skeleton height={24} width={80} radius="xl" />
      </Group>
      <Skeleton height={120} mb="md" />
      <Group justify="space-between">
        <Skeleton height={16} width="30%" />
        <Skeleton height={16} width="20%" />
      </Group>
    </Card>
  );
}

export function DashboardLoadingState() {
  return (
    <Stack gap="lg">
      {/* Header skeleton */}
      <Stack gap="xs">
        <Skeleton height={32} width="50%" />
        <Skeleton height={20} width="70%" />
      </Stack>
      
      {/* Metrics cards skeleton */}
      <Grid>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
            <CardLoadingState />
          </Grid.Col>
        ))}
      </Grid>
      
      {/* Chart skeleton */}
      <Card withBorder p="md">
        <Group justify="space-between" mb="md">
          <Skeleton height={24} width="30%" />
          <Skeleton height={32} width={120} radius="xl" />
        </Group>
        <Skeleton height={300} />
      </Card>
      
      {/* Table skeleton */}
      <Card withBorder p="md">
        <Skeleton height={24} width="25%" mb="md" />
        <TableLoadingState />
      </Card>
    </Stack>
  );
}

export function AnalyticsLoadingState() {
  return (
    <Stack gap="lg">
      {/* Header and controls */}
      <Group justify="space-between">
        <Stack gap="xs">
          <Skeleton height={32} width="60%" />
          <Skeleton height={20} width="80%" />
        </Stack>
        <Group gap="sm">
          <Skeleton height={36} width={36} radius="md" />
          <Skeleton height={36} width={36} radius="md" />
        </Group>
      </Group>
      
      {/* Filters */}
      <Card withBorder p="md">
        <Group justify="space-between">
          <Group gap="md">
            <Skeleton height={60} width={120} />
            <Skeleton height={60} width={100} />
          </Group>
          <Skeleton height={36} width={300} radius="xl" />
        </Group>
      </Card>
      
      {/* Summary metrics */}
      <Grid>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder p="md">
              <Group justify="space-between" mb="xs">
                <Skeleton height={16} width="70%" />
                <Skeleton height={24} width={24} radius="sm" />
              </Group>
              <Skeleton height={28} width="50%" mb="xs" />
              <Skeleton height={4} width="100%" radius="xs" />
            </Card>
          </Grid.Col>
        ))}
      </Grid>
      
      {/* Charts grid */}
      <Grid>
        <Grid.Col span={12}>
          <Card withBorder p="md">
            <Group justify="space-between" mb="md">
              <Skeleton height={24} width="40%" />
              <Skeleton height={24} width={80} radius="xl" />
            </Group>
            <Skeleton height={300} />
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="md">
            <Skeleton height={24} width="50%" mb="md" />
            <Skeleton height={250} />
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="md">
            <Skeleton height={24} width="40%" mb="md" />
            <Skeleton height={250} />
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

export function FullPageLoader({ message = "Loading financial data..." }: { message?: string }) {
  return (
    <Center h="60vh">
      <Stack align="center" gap="lg">
        <ThemeIcon color="financial" size="xl" variant="light">
          <IconChartBar size={32} />
        </ThemeIcon>
        <Loader color="financial" size="lg" type="bars" />
        <Text size="lg" fw={600} c="financial">
          {message}
        </Text>
        <Text size="sm" c="dimmed" ta="center" style={{ maxWidth: 300 }}>
          Processing ISO 20022 CAMT.053 transactions and performing advanced analytics...
        </Text>
      </Stack>
    </Center>
  );
}

export function ErrorState({ 
  title = "Unable to Load Data", 
  message = "There was an error loading the financial data. Please try again later.",
  onRetry
}: { 
  title?: string; 
  message?: string; 
  onRetry?: () => void; 
}) {
  return (
    <Center h="60vh">
      <Stack align="center" gap="lg" style={{ maxWidth: 400 }}>
        <ThemeIcon color="danger" size="xl" variant="light">
          <IconChartBar size={32} />
        </ThemeIcon>
        <Stack align="center" gap="xs">
          <Text size="xl" fw={600} c="danger">
            {title}
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            {message}
          </Text>
        </Stack>
        {onRetry && (
          <Group gap="sm">
            <button 
              onClick={onRetry}
              style={{
                background: 'var(--mantine-color-financial-6)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--mantine-radius-md)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Try Again
            </button>
          </Group>
        )}
      </Stack>
    </Center>
  );
}

// Animated loading indicators for specific components
export function MetricCardLoader() {
  return (
    <Card withBorder p="md" h="100%">
      <Group justify="space-between" mb="xs">
        <Skeleton height={12} width="60%" />
        <Skeleton height={20} width={20} radius="sm" />
      </Group>
      <Skeleton height={24} width="40%" mb="xs" />
      <Skeleton height={4} width="100%" radius="xs" />
    </Card>
  );
}

export function ChartLoader({ height = 300 }: { height?: number }) {
  return (
    <Card withBorder p="md">
      <Group justify="space-between" mb="md">
        <Skeleton height={20} width="30%" />
        <Skeleton height={24} width={80} radius="xl" />
      </Group>
      <Center h={height}>
        <Stack align="center" gap="md">
          <Loader color="financial" size="md" type="bars" />
          <Text size="sm" c="dimmed">Loading chart data...</Text>
        </Stack>
      </Center>
    </Card>
  );
}