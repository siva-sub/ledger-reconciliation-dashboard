import { AppShell, Burger, Group, Text, NavLink, Badge, ThemeIcon, Stack, Divider, Anchor } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  IconDashboard, 
  IconTimeline, 
  IconReceipt, 
  IconReportAnalytics,
  IconChartBar,
  IconBuildingBank,
  IconUser,
  IconBrandGithub
} from '@tabler/icons-react';
import { HomePage } from '@/pages/HomePage';
import { ETLVisualizerPage } from '@/pages/ETLVisualizerPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ReconciliationPage } from '@/pages/ReconciliationPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

const navigation = [
  { label: 'Overview', icon: IconDashboard, path: '/' },
  { label: 'ETL Pipeline', icon: IconTimeline, path: '/etl' },
  { label: 'Dashboard', icon: IconReportAnalytics, path: '/dashboard' },
  { label: 'Reconciliation', icon: IconReceipt, path: '/reconciliation' },
  { label: 'Analytics', icon: IconChartBar, path: '/analytics' },
];

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="xs">
              <ThemeIcon color="financial" variant="light" size="lg">
                <IconBuildingBank size={24} />
              </ThemeIcon>
              <div>
                <Text size="lg" fw={700} c="financial">
                  Ledger Reconciliation Dashboard
                </Text>
                <Text size="xs" c="dimmed">
                  Financial Technology Portfolio
                </Text>
              </div>
            </Group>
          </Group>
          
          <Group gap="sm">
            <Badge color="financial" variant="light" size="sm">
              ISO 20022 Compliant
            </Badge>
            <Badge color="success" variant="light" size="sm">
              Production Ready
            </Badge>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Group gap="xs" mb="md">
            <ThemeIcon color="financial" variant="light" size="sm">
              <IconUser size={16} />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={600}>Siva Subramanian</Text>
              <Text size="xs" c="dimmed">Financial Technology Analyst</Text>
            </div>
          </Group>
          
          <Divider />
          
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              active={location.pathname === item.path}
              label={item.label}
              leftSection={<item.icon size={20} />}
              onClick={() => navigate(item.path)}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />
          ))}
          
          <Divider mt="auto" />
          
          <Group gap="xs" justify="center" mt="sm">
            <Anchor 
              href="https://github.com/siva-sub/ledger-reconciliation-dashboard" 
              target="_blank" 
              size="sm" 
              c="dimmed"
              style={{ textDecoration: 'none' }}
            >
              <Group gap="xs">
                <IconBrandGithub size={16} />
                <Text size="xs">View Source</Text>
              </Group>
            </Anchor>
          </Group>
          
          <Text size="xs" c="dimmed" ta="center" mt="xs">
            v1.0.0 - Financial ETL System
          </Text>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/etl" element={<ETLVisualizerPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reconciliation" element={<ReconciliationPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}