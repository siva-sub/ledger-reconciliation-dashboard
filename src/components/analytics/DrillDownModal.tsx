import { useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Group,
  Badge,
  Card,
  Table,
  Tabs,
  Progress,
  ActionIcon,
  Tooltip,
  Grid,
  NumberFormatter,
  Alert,
  Button,
  Select,
  TextInput
} from '@mantine/core';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconEye,
  IconDownload,
  IconFilter,
  IconSearch,
  IconX
} from '@tabler/icons-react';
import { FinancialTransaction } from '@/types';
import { ExportService } from '@/components/common/ExportService';

interface DrillDownModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  transactions: FinancialTransaction[];
  analysisType: 'currency' | 'risk' | 'status' | 'timeframe' | 'counterparty';
  filterValue?: string;
}

export function DrillDownModal({ 
  opened, 
  onClose, 
  title, 
  transactions, 
  analysisType,
  filterValue 
}: DrillDownModalProps) {
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<string | null>(null);

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = !searchTerm || 
      txn.entryRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.counterparty.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || txn.reconciliationStatus === statusFilter;
    const matchesRisk = !riskFilter || txn.riskLevel === riskFilter;
    
    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Calculate analytics for the filtered data
  const analytics = {
    totalAmount: filteredTransactions.reduce((sum, txn) => sum + txn.amount.original, 0),
    averageAmount: filteredTransactions.length > 0 
      ? filteredTransactions.reduce((sum, txn) => sum + txn.amount.original, 0) / filteredTransactions.length 
      : 0,
    creditCount: filteredTransactions.filter(txn => txn.creditDebitIndicator === 'CRDT').length,
    debitCount: filteredTransactions.filter(txn => txn.creditDebitIndicator === 'DBIT').length,
    highRiskCount: filteredTransactions.filter(txn => txn.riskLevel === 'HIGH').length,
    exceptionCount: filteredTransactions.filter(txn => txn.reconciliationStatus === 'EXCEPTION').length,
    pendingCount: filteredTransactions.filter(txn => txn.reconciliationStatus === 'PENDING').length,
    matchedCount: filteredTransactions.filter(txn => txn.reconciliationStatus === 'MATCHED').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MATCHED': return 'green';
      case 'PENDING': return 'blue';
      case 'EXCEPTION': return 'red';
      default: return 'gray';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'green';
      case 'MEDIUM': return 'yellow';
      case 'HIGH': return 'red';
      default: return 'gray';
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    ExportService.exportTransactions(filteredTransactions, {
      format,
      includeMetadata: true,
      filters: {
        status: statusFilter ? [statusFilter] : undefined,
        riskLevel: riskFilter ? [riskFilter] : undefined
      }
    });
  };

  const getAnalysisInsights = () => {
    switch (analysisType) {
      case 'currency':
        return `Analyzing ${filteredTransactions.length} transactions in ${filterValue} currency`;
      case 'risk':
        return `${filterValue} risk transactions represent ${((analytics.highRiskCount / filteredTransactions.length) * 100).toFixed(1)}% of total volume`;
      case 'status':
        return `${filterValue} transactions require ${filterValue === 'EXCEPTION' ? 'immediate attention' : 'processing'}`;
      case 'counterparty':
        return `Transaction history with ${filterValue}`;
      default:
        return `Detailed analysis of ${filteredTransactions.length} transactions`;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <Text fw={600} size="lg">{title}</Text>
          <Badge color="blue" variant="light">
            {filteredTransactions.length} transactions
          </Badge>
        </Group>
      }
      size="xl"
      padding="md"
    >
      <Stack gap="md">
        {/* Analysis Insights */}
        <Alert color="blue" variant="light">
          <Text size="sm">{getAnalysisInsights()}</Text>
        </Alert>

        {/* Quick Analytics Summary */}
        <Grid>
          <Grid.Col span={6}>
            <Card withBorder p="sm">
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Amount</Text>
                  <Text fw={600} size="lg">
                    <NumberFormatter
                      value={analytics.totalAmount}
                      thousandSeparator
                      prefix="€ "
                    />
                  </Text>
                </div>
                <IconTrendingUp size={24} color="green" />
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Card withBorder p="sm">
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Average Amount</Text>
                  <Text fw={600} size="lg">
                    <NumberFormatter
                      value={analytics.averageAmount}
                      thousandSeparator
                      prefix="€ "
                    />
                  </Text>
                </div>
                <IconTrendingDown size={24} color="blue" />
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={4}>
            <Card withBorder p="sm">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>High Risk</Text>
              <Group gap="xs">
                <Text fw={600} size="lg" c="red">{analytics.highRiskCount}</Text>
                <Progress 
                  value={(analytics.highRiskCount / filteredTransactions.length) * 100} 
                  size="xs" 
                  color="red" 
                  style={{ flex: 1 }}
                />
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={4}>
            <Card withBorder p="sm">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Exceptions</Text>
              <Group gap="xs">
                <Text fw={600} size="lg" c="orange">{analytics.exceptionCount}</Text>
                <Progress 
                  value={(analytics.exceptionCount / filteredTransactions.length) * 100} 
                  size="xs" 
                  color="orange" 
                  style={{ flex: 1 }}
                />
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={4}>
            <Card withBorder p="sm">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Matched</Text>
              <Group gap="xs">
                <Text fw={600} size="lg" c="green">{analytics.matchedCount}</Text>
                <Progress 
                  value={(analytics.matchedCount / filteredTransactions.length) * 100} 
                  size="xs" 
                  color="green" 
                  style={{ flex: 1 }}
                />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'transactions')}>
          <Tabs.List>
            <Tabs.Tab value="transactions">Transaction Details</Tabs.Tab>
            <Tabs.Tab value="patterns">Pattern Analysis</Tabs.Tab>
            <Tabs.Tab value="recommendations">Recommendations</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="transactions" pt="md">
            {/* Search and Filter Controls */}
            <Card withBorder mb="md" p="md">
              <Group justify="space-between" mb="sm">
                <Text fw={600} size="sm">Filters & Export</Text>
                <Group gap="xs">
                  <Button 
                    variant="light" 
                    size="xs" 
                    leftSection={<IconDownload size={14} />}
                    onClick={() => handleExport('csv')}
                  >
                    CSV
                  </Button>
                  <Button 
                    variant="light" 
                    size="xs" 
                    leftSection={<IconDownload size={14} />}
                    onClick={() => handleExport('json')}
                  >
                    JSON
                  </Button>
                  <Button 
                    variant="light" 
                    size="xs" 
                    leftSection={<IconDownload size={14} />}
                    onClick={() => handleExport('pdf')}
                  >
                    Report
                  </Button>
                </Group>
              </Group>
              
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    placeholder="Search transactions..."
                    leftSection={<IconSearch size={16} />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="sm"
                  />
                </Grid.Col>
                
                <Grid.Col span={3}>
                  <Select
                    placeholder="Status"
                    leftSection={<IconFilter size={16} />}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    data={[
                      { value: 'MATCHED', label: 'Matched' },
                      { value: 'PENDING', label: 'Pending' },
                      { value: 'EXCEPTION', label: 'Exception' }
                    ]}
                    clearable
                    size="sm"
                  />
                </Grid.Col>
                
                <Grid.Col span={3}>
                  <Select
                    placeholder="Risk"
                    leftSection={<IconFilter size={16} />}
                    value={riskFilter}
                    onChange={setRiskFilter}
                    data={[
                      { value: 'LOW', label: 'Low' },
                      { value: 'MEDIUM', label: 'Medium' },
                      { value: 'HIGH', label: 'High' }
                    ]}
                    clearable
                    size="sm"
                  />
                </Grid.Col>
              </Grid>
            </Card>

            {/* Transaction Table */}
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Reference</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Counterparty</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Risk</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredTransactions.slice(0, 10).map((transaction) => (
                  <Table.Tr key={transaction.id}>
                    <Table.Td>
                      <Text size="sm" fw={500} ff="monospace">
                        {transaction.entryRef}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{transaction.valueDate}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text 
                        size="sm" 
                        fw={600} 
                        c={transaction.creditDebitIndicator === 'CRDT' ? 'green' : 'red'}
                      >
                        {transaction.creditDebitIndicator === 'CRDT' ? '+' : '-'}
                        <NumberFormatter 
                          value={transaction.amount.original} 
                          prefix={`${transaction.amount.currency} `}
                          thousandSeparator
                        />
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={1} style={{ maxWidth: 150 }}>
                        {transaction.counterparty.name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(transaction.reconciliationStatus)} variant="light" size="sm">
                        {transaction.reconciliationStatus}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getRiskColor(transaction.riskLevel)} variant="light" size="sm">
                        {transaction.riskLevel}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label="View Details">
                        <ActionIcon variant="light" size="sm">
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            
            {filteredTransactions.length > 10 && (
              <Alert color="blue" variant="light" mt="sm">
                <Text size="sm">
                  Showing first 10 of {filteredTransactions.length} transactions. 
                  Use export function to access complete dataset.
                </Text>
              </Alert>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="patterns" pt="md">
            <Stack gap="md">
              <Text fw={600}>Pattern Analysis</Text>
              
              <Grid>
                <Grid.Col span={6}>
                  <Card withBorder p="md">
                    <Text fw={600} mb="sm">Transaction Flow</Text>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Credit Transactions</Text>
                      <Text size="sm" fw={600}>{analytics.creditCount}</Text>
                    </Group>
                    <Progress 
                      value={(analytics.creditCount / filteredTransactions.length) * 100} 
                      color="green" 
                      size="sm" 
                      mb="xs"
                    />
                    
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Debit Transactions</Text>
                      <Text size="sm" fw={600}>{analytics.debitCount}</Text>
                    </Group>
                    <Progress 
                      value={(analytics.debitCount / filteredTransactions.length) * 100} 
                      color="red" 
                      size="sm"
                    />
                  </Card>
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Card withBorder p="md">
                    <Text fw={600} mb="sm">Risk Distribution</Text>
                    <Text size="sm" c="dimmed">
                      {analytics.highRiskCount > 0 && (
                        `${((analytics.highRiskCount / filteredTransactions.length) * 100).toFixed(1)}% high-risk transactions identified`
                      )}
                    </Text>
                    
                    {analytics.exceptionCount > 0 && (
                      <Alert color="orange" variant="light" mt="sm">
                        <Group gap="xs">
                          <IconAlertTriangle size={16} />
                          <Text size="sm">
                            {analytics.exceptionCount} exceptions require manual review
                          </Text>
                        </Group>
                      </Alert>
                    )}
                  </Card>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="recommendations" pt="md">
            <Stack gap="md">
              <Text fw={600}>Recommendations</Text>
              
              {analytics.highRiskCount > 0 && (
                <Alert color="red" variant="light">
                  <Text fw={600} mb="xs">High Priority Actions</Text>
                  <Text size="sm">
                    • Review {analytics.highRiskCount} high-risk transactions immediately
                    • Implement enhanced due diligence for flagged counterparties
                    • Consider transaction limits for high-risk categories
                  </Text>
                </Alert>
              )}
              
              {analytics.exceptionCount > 0 && (
                <Alert color="orange" variant="light">
                  <Text fw={600} mb="xs">Exception Management</Text>
                  <Text size="sm">
                    • Investigate {analytics.exceptionCount} unmatched transactions
                    • Update matching algorithms based on exception patterns
                    • Establish SLA for exception resolution
                  </Text>
                </Alert>
              )}
              
              {analytics.pendingCount > 0 && (
                <Alert color="blue" variant="light">
                  <Text fw={600} mb="xs">Process Optimization</Text>
                  <Text size="sm">
                    • Accelerate processing of {analytics.pendingCount} pending transactions
                    • Implement automated matching for recurring patterns
                    • Set up real-time monitoring for processing delays
                  </Text>
                </Alert>
              )}
              
              <Card withBorder p="md">
                <Text fw={600} mb="sm">Data Quality Insights</Text>
                <Text size="sm" c="dimmed">
                  Based on the analysis of {filteredTransactions.length} transactions:
                </Text>
                <Text size="sm" mt="xs">
                  • Match rate: {((analytics.matchedCount / filteredTransactions.length) * 100).toFixed(1)}%
                  • Risk assessment accuracy: {filteredTransactions.filter(t => t.riskLevel !== 'NONE').length} transactions classified
                  • Processing efficiency: {((analytics.matchedCount / filteredTransactions.length) * 100).toFixed(1)}% automated matching
                </Text>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Close Button */}
        <Group justify="flex-end">
          <Button onClick={onClose} leftSection={<IconX size={16} />}>
            Close Analysis
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}