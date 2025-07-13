import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import { Layout } from '@/components/common/Layout';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/spotlight/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

const theme = {
  primaryColor: 'financial',
  colors: {
    financial: [
      '#f0f8ff',
      '#e1f2ff', 
      '#bfdfff',
      '#80c4ff',
      '#1e88e5',
      '#1976d2',
      '#1565c0',
      '#0d47a1',
      '#0a3d91',
      '#083485',
    ] as const,
    success: [
      '#f1f8e9',
      '#dcedc8',
      '#c5e1a5',
      '#aed581',
      '#9ccc65',
      '#8bc34a',
      '#7cb342',
      '#689f38',
      '#558b2f',
      '#33691e',
    ] as const,
    warning: [
      '#fff8e1',
      '#ffecb3',
      '#ffe082',
      '#ffd54f',
      '#ffca28',
      '#ffc107',
      '#ffb300',
      '#ffa000',
      '#ff8f00',
      '#ff6f00',
    ] as const,
    danger: [
      '#ffebee',
      '#ffcdd2',
      '#ef9a9a',
      '#e57373',
      '#ef5350',
      '#f44336',
      '#e53935',
      '#d32f2f',
      '#c62828',
      '#b71c1c',
    ] as const,
  },
  fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  headings: {
    fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'md',
  components: {
    Card: {
      defaultProps: {
        shadow: 'xs',
        padding: 'md',
        radius: 'md',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Table: {
      defaultProps: {
        striped: true,
        highlightOnHover: true,
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
        shadow: 'lg',
      },
    },
  },
  other: {
    // Custom brand colors for financial services
    brandColors: {
      primary: '#1976d2',
      success: '#4caf50',
      warning: '#ff9800',
      danger: '#f44336',
      neutral: '#607d8b',
    },
  },
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <Notifications />
        <HashRouter>
          <Layout />
        </HashRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
