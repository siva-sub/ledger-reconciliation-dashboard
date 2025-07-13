import { Container, Title, Text, SimpleGrid, Card, Badge, Group } from '@mantine/core';
import { IconTimeline, IconDashboard, IconReceipt, IconChartBar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'ETL Pipeline Visualization',
    description: 'Interactive visualization of CAMT.053 processing with real-time simulation',
    icon: IconTimeline,
    path: '/etl',
    badge: 'Technical'
  },
  {
    title: 'Business Dashboard',
    description: 'Executive dashboards with KPIs, trends, and business intelligence',
    icon: IconDashboard,
    path: '/dashboard',
    badge: 'Business'
  },
  {
    title: 'Reconciliation Investigation',
    description: 'Advanced reconciliation workbench with smart reference search and bank code analysis',
    icon: IconReceipt,
    path: '/reconciliation',
    badge: 'Operations'
  },
  {
    title: 'Advanced Analytics',
    description: 'Sophisticated financial analytics with trend analysis, risk assessment, and interactive charts',
    icon: IconChartBar,
    path: '/analytics',
    badge: 'Analytics'
  }
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <Container size="lg">
      <Title order={1} mb="md">Financial ETL Dashboard</Title>
      <Text size="lg" c="dimmed" mb="xl">
        Demonstrating technical excellence and business analysis capabilities for financial data processing
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {features.map((feature) => (
          <Card
            key={feature.title}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(feature.path)}
          >
            <Group justify="space-between" mb="xs">
              <feature.icon size={24} />
              <Badge color="blue" variant="light">
                {feature.badge}
              </Badge>
            </Group>
            <Text fw={500} size="lg" mb="xs">
              {feature.title}
            </Text>
            <Text size="sm" c="dimmed">
              {feature.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}