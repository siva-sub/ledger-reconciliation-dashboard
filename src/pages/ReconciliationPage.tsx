import { useState, useMemo, useCallback } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Card, 
  Table, 
  Badge, 
  Group, 
  TextInput, 
  Select, 
  Button,
  Stack,
  Grid,
  Alert,
  Progress,
  ActionIcon,
  Tooltip,
  NumberFormatter,
  Pill
} from '@mantine/core';
import { 
  IconSearch, 
  IconFilter, 
  IconDownload, 
  IconEye,
  IconAlertTriangle,
  IconChecks,
  IconAdjustments,
  IconSortAscending,
  IconSortDescending,
  IconRefresh
} from '@tabler/icons-react';
import { useETLData } from '@/hooks/useETLData';
import { FinancialTransaction } from '@/types';
import { TransactionDetailsModal } from '@/components/reconciliation/TransactionDetailsModal';
import { SmartSearchPanel } from '@/components/reconciliation/SmartSearchPanel';
import { DashboardLoadingState, ErrorState } from '@/components/common/LoadingStates';

export function ReconciliationPage() {
  const { transactions, isLoading, error } = useETLData();
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof FinancialTransaction>('valueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');


  // Calculate reconciliation metrics
  const reconciliationMetrics = useMemo(() => {
    if (!transactions.length) return { total: 0, matched: 0, pending: 0, exceptions: 0, confidence: 0 };
    
    const total = transactions.length;
    const matched = transactions.filter(t => t.reconciliationStatus === 'MATCHED').length;
    const pending = transactions.filter(t => t.reconciliationStatus === 'PENDING').length;
    const exceptions = transactions.filter(t => t.reconciliationStatus === 'EXCEPTION').length;
    const confidence = Math.round((matched / total) * 100);
    
    return { total, matched, pending, exceptions, confidence };
  }, [transactions]);

  // Smart search functionality
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = !searchTerm || 
        transaction.entryRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.counterparty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.counterparty.account?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || transaction.reconciliationStatus === statusFilter;
      const matchesRisk = !riskFilter || transaction.riskLevel === riskFilter;
      
      return matchesSearch && matchesStatus && matchesRisk;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Handle nested properties
      if (sortField === 'amount') {
        aValue = a.amount.original;
        bValue = b.amount.original;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, searchTerm, statusFilter, riskFilter, sortField, sortDirection]);

  const handleTransactionClick = useCallback((transaction: FinancialTransaction) => {
    setSelectedTransaction(transaction);
    setModalOpened(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpened(false);
    setSelectedTransaction(null);
  }, []);

  const handleSort = (field: keyof FinancialTransaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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

  const calculateReconciliationConfidence = (transaction: FinancialTransaction): number => {
    let confidence = 50;
    
    // Check for reference patterns
    const hasInvoiceRef = /INV|INVOICE|REF|#\d+/.test(transaction.description.toUpperCase());
    const hasBankRef = /\d{8,}/.test(transaction.description);
    
    if (hasInvoiceRef) confidence += 30;
    if (hasBankRef) confidence += 20;
    if (transaction.reconciliationStatus === 'MATCHED') confidence += 40;
    if (transaction.reconciliationStatus === 'EXCEPTION') confidence -= 40;
    if (transaction.riskLevel === 'LOW') confidence += 20;
    if (transaction.riskLevel === 'HIGH') confidence -= 30;
    
    return Math.max(0, Math.min(100, confidence));
  };

  if (isLoading) return <Container size="xl"><DashboardLoadingState /></Container>;
  if (error) return <Container size="xl"><ErrorState title="Reconciliation Error" message="Unable to load transaction data for reconciliation. Please check your connection and try again." /></Container>;

  return (
    <Container size="xl">
      <Title order={1} mb="md">Reconciliation Investigation Workbench</Title>
      <Text size="lg" c="dimmed" mb="xl">
        Advanced reconciliation tool with smart reference matching and bank code analysis
      </Text>


      {/* Reconciliation Metrics Dashboard */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Transactions</Text>
                <Text fw={700} size="xl">{reconciliationMetrics.total}</Text>
              </div>
              <IconAdjustments size={28} color="blue" />
            </Group>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Matched</Text>
                <Text fw={700} size="xl" c="green">{reconciliationMetrics.matched}</Text>
              </div>
              <IconChecks size={28} color="green" />
            </Group>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Exceptions</Text>
                <Text fw={700} size="xl" c="red">{reconciliationMetrics.exceptions}</Text>
              </div>
              <IconAlertTriangle size={28} color="red" />
            </Group>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Confidence</Text>
                <Text fw={700} size="xl">{reconciliationMetrics.confidence}%</Text>
              </div>
              <Progress value={reconciliationMetrics.confidence} size="sm" color={reconciliationMetrics.confidence > 80 ? 'green' : 'yellow'} />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Smart Search Panel */}
      <SmartSearchPanel 
        transactions={transactions}
        onTransactionClick={handleTransactionClick}
      />

      {/* Search and Filter Controls */}
      <Card withBorder mb="md" p="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600} size="md">Investigation Controls</Text>
            <Group gap="xs">
              <Button variant="light" leftSection={<IconRefresh size={16} />} size="sm">
                Refresh
              </Button>
              <Button variant="light" leftSection={<IconDownload size={16} />} size="sm">
                Export
              </Button>
            </Group>
          </Group>
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                placeholder="Search by reference, description, counterparty, or account..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<IconFilter size={16} />}
                value={statusFilter}
                onChange={setStatusFilter}
                data={[
                  { value: 'MATCHED', label: 'Matched' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'EXCEPTION', label: 'Exception' }
                ]}
                clearable
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Select
                placeholder="Filter by risk"
                leftSection={<IconFilter size={16} />}
                value={riskFilter}
                onChange={setRiskFilter}
                data={[
                  { value: 'LOW', label: 'Low Risk' },
                  { value: 'MEDIUM', label: 'Medium Risk' },
                  { value: 'HIGH', label: 'High Risk' }
                ]}
                clearable
              />
            </Grid.Col>
          </Grid>
          
          {(searchTerm || statusFilter || riskFilter) && (
            <Alert color="blue" variant="light">
              <Group gap="xs">
                <Text size="sm">Showing {filteredTransactions.length} of {transactions.length} transactions</Text>
                {searchTerm && <Pill size="sm">Search: {searchTerm}</Pill>}
                {statusFilter && <Pill size="sm">Status: {statusFilter}</Pill>}
                {riskFilter && <Pill size="sm">Risk: {riskFilter}</Pill>}
              </Group>
            </Alert>
          )}
        </Stack>
      </Card>

      {/* Enhanced Transaction Table */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={600} size="md">Transaction Investigation</Text>
          <Badge color="blue" variant="light">
            {filteredTransactions.length} transactions
          </Badge>
        </Group>
        
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Button 
                  variant="subtle" 
                  size="compact-sm" 
                  onClick={() => handleSort('entryRef')}
                  rightSection={sortField === 'entryRef' ? (sortDirection === 'asc' ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />) : null}
                >
                  Entry Ref
                </Button>
              </Table.Th>
              <Table.Th>
                <Button 
                  variant="subtle" 
                  size="compact-sm" 
                  onClick={() => handleSort('valueDate')}
                  rightSection={sortField === 'valueDate' ? (sortDirection === 'asc' ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />) : null}
                >
                  Date
                </Button>
              </Table.Th>
              <Table.Th>
                <Button 
                  variant="subtle" 
                  size="compact-sm" 
                  onClick={() => handleSort('amount')}
                  rightSection={sortField === 'amount' ? (sortDirection === 'asc' ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />) : null}
                >
                  Amount
                </Button>
              </Table.Th>
              <Table.Th>Counterparty</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Risk</Table.Th>
              <Table.Th>Confidence</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredTransactions.map((transaction, index) => {
              const confidence = calculateReconciliationConfidence(transaction);
              return (
                <Table.Tr 
                  key={transaction.id || `transaction-${index}`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    // Prevent row click when clicking on action buttons
                    if ((e.target as HTMLElement).closest('.action-button')) {
                      return;
                    }
                    handleTransactionClick(transaction);
                  }}
                >
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
                    <div>
                      <Text size="sm" fw={500}>{transaction.counterparty.name}</Text>
                      {transaction.counterparty.account && (
                        <Text size="xs" c="dimmed" ff="monospace">
                          {transaction.counterparty.account}
                        </Text>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={2} style={{ maxWidth: 200 }}>
                      {transaction.description}
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
                    <Group gap="xs">
                      <Progress 
                        value={confidence} 
                        size="sm" 
                        color={confidence > 70 ? 'green' : confidence > 40 ? 'yellow' : 'red'}
                        style={{ width: 40 }}
                      />
                      <Text size="xs" c="dimmed">{confidence}%</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label="Investigate Transaction">
                      <ActionIcon 
                        variant="light" 
                        size="sm"
                        className="action-button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTransactionClick(transaction);
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
        
        {filteredTransactions.length === 0 && (
          <Alert color="blue" variant="light" mt="md">
            <Text ta="center">No transactions match your current search and filter criteria.</Text>
          </Alert>
        )}
      </Card>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        opened={modalOpened}
        onClose={handleModalClose}
      />
    </Container>
  );
}