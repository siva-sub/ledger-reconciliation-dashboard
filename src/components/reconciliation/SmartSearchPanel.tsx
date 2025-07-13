import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  TextInput,
  Stack,
  Group,
  Text,
  Badge,
  Table,
  ActionIcon,
  Tooltip,
  Alert,
  Progress,
  Button,
  Collapse,
  NumberFormatter,
  Code,
  Pill
} from '@mantine/core';
import {
  IconSearch,
  IconEye,
  IconChevronDown,
  IconChevronUp,
  IconBulb,
  IconTarget,
  IconAlertTriangle
} from '@tabler/icons-react';
import { FinancialTransaction } from '@/types';
import { referenceSearchService, SearchResult, TransactionMatch } from '@/services/referenceSearch';

interface SmartSearchPanelProps {
  transactions: FinancialTransaction[];
  onTransactionClick: (transaction: FinancialTransaction) => void;
}

export function SmartSearchPanel({ transactions, onTransactionClick }: SmartSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showPatterns, setShowPatterns] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      const result = referenceSearchService.searchRelatedTransactions(searchQuery, transactions);
      setSearchResult(result);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, transactions]);

  // Find duplicates for insights
  const duplicates = useMemo(() => {
    return referenceSearchService.findDuplicates(transactions, 48); // 48 hour tolerance
  }, [transactions]);

  const getMatchTypeColor = (matchType: TransactionMatch['matchType']) => {
    switch (matchType) {
      case 'EXACT': return 'green';
      case 'PATTERN': return 'blue';
      case 'PARTIAL': return 'yellow';
      case 'FUZZY': return 'gray';
      default: return 'gray';
    }
  };

  const getPatternTypeColor = (type: string) => {
    switch (type) {
      case 'INVOICE': return 'green';
      case 'PO': return 'blue';
      case 'BANK_REF': return 'violet';
      case 'CONTRACT': return 'orange';
      case 'CUSTOMER_REF': return 'cyan';
      case 'BATCH': return 'pink';
      default: return 'gray';
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  return (
    <Card withBorder p="md">
      <Stack gap="md">
        {/* Search Header */}
        <Group justify="space-between">
          <Group gap="xs">
            <IconSearch size={20} color="blue" />
            <Text fw={600} size="md">Smart Reference Search</Text>
            <Badge variant="light" size="sm">AI-Powered</Badge>
          </Group>
          
          {searchResult && (
            <Text size="xs" c="dimmed">
              Found {searchResult.matches.length} matches in {searchResult.searchTime.toFixed(1)}ms
            </Text>
          )}
        </Group>

        {/* Search Input */}
        <TextInput
          placeholder="Search by invoice #, PO reference, amount, counterparty, or bank reference..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="md"
        />

        {/* Loading State */}
        {isSearching && (
          <Progress value={100} animated color="blue" size="xs" />
        )}

        {/* Search Suggestions */}
        {!searchQuery && showSuggestions && (
          <Card bg="gray.0" p="sm">
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>Quick Search Suggestions</Text>
              <Button 
                variant="subtle" 
                size="compact-xs" 
                onClick={() => setShowSuggestions(false)}
              >
                Hide
              </Button>
            </Group>
            <Group gap="xs">
              <Pill 
                size="sm" 
                style={{ cursor: 'pointer' }} 
                onClick={() => handleSuggestionClick('INV-2024')}
              >
                INV-2024*
              </Pill>
              <Pill 
                size="sm" 
                style={{ cursor: 'pointer' }} 
                onClick={() => handleSuggestionClick('PO-')}
              >
                PO-*
              </Pill>
              <Pill 
                size="sm" 
                style={{ cursor: 'pointer' }} 
                onClick={() => handleSuggestionClick('1000.00')}
              >
                Amount: 1000.00
              </Pill>
              <Pill 
                size="sm" 
                style={{ cursor: 'pointer' }} 
                onClick={() => handleSuggestionClick('ACME Corp')}
              >
                ACME Corp
              </Pill>
            </Group>
          </Card>
        )}

        {/* Search Results */}
        {searchResult && (
          <Stack gap="md">
            {/* Reference Patterns Detected */}
            {searchResult.patterns.length > 0 && (
              <Card bg="blue.0" p="sm">
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <IconTarget size={16} color="blue" />
                    <Text size="sm" fw={500}>Reference Patterns Detected</Text>
                  </Group>
                  <ActionIcon 
                    variant="subtle" 
                    size="sm"
                    onClick={() => setShowPatterns(!showPatterns)}
                  >
                    {showPatterns ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                  </ActionIcon>
                </Group>
                
                <Collapse in={showPatterns}>
                  <Stack gap="xs">
                    {searchResult.patterns.slice(0, 3).map((pattern, index) => (
                      <Group key={index} justify="space-between">
                        <Group gap="xs">
                          <Badge color={getPatternTypeColor(pattern.type)} variant="light" size="sm">
                            {pattern.type}
                          </Badge>
                          <Code>{pattern.value}</Code>
                        </Group>
                        <Group gap="xs">
                          <Progress 
                            value={pattern.confidence * 100} 
                            color={pattern.confidence > 0.8 ? 'green' : 'yellow'} 
                            size="xs" 
                            style={{ width: 40 }}
                          />
                          <Text size="xs" c="dimmed">{Math.round(pattern.confidence * 100)}%</Text>
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                </Collapse>
              </Card>
            )}

            {/* Search Suggestions */}
            {searchResult.suggestions.length > 0 && (
              <Card bg="yellow.0" p="sm">
                <Group gap="xs" mb="xs">
                  <IconBulb size={16} color="orange" />
                  <Text size="sm" fw={500}>Search Suggestions</Text>
                </Group>
                <Group gap="xs">
                  {searchResult.suggestions.slice(0, 5).map((suggestion, index) => (
                    <Pill 
                      key={index}
                      size="sm" 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Pill>
                  ))}
                </Group>
              </Card>
            )}

            {/* Search Results Table */}
            {searchResult.matches.length > 0 ? (
              <Card withBorder p="sm">
                <Group justify="space-between" mb="md">
                  <Text fw={500}>Transaction Matches</Text>
                  <Badge color="blue" variant="light">
                    {searchResult.matches.length} results
                  </Badge>
                </Group>
                
                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Reference</Table.Th>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th>Counterparty</Table.Th>
                      <Table.Th>Match Type</Table.Th>
                      <Table.Th>Confidence</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {searchResult.matches.slice(0, 10).map((match, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <Text size="sm" ff="monospace">{match.transaction.entryRef}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{match.transaction.valueDate}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text 
                            size="sm" 
                            fw={500}
                            c={match.transaction.creditDebitIndicator === 'CRDT' ? 'green' : 'red'}
                          >
                            {match.transaction.creditDebitIndicator === 'CRDT' ? '+' : '-'}
                            <NumberFormatter 
                              value={match.transaction.amount.original}
                              prefix={`${match.transaction.amount.currency} `}
                              thousandSeparator
                            />
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={1} style={{ maxWidth: 120 }}>
                            {match.transaction.counterparty.name}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            color={getMatchTypeColor(match.matchType)} 
                            variant="light" 
                            size="sm"
                          >
                            {match.matchType}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Progress 
                              value={match.confidence * 100} 
                              color={match.confidence > 0.8 ? 'green' : match.confidence > 0.6 ? 'yellow' : 'red'}
                              size="sm" 
                              style={{ width: 40 }}
                            />
                            <Text size="xs" c="dimmed">{Math.round(match.confidence * 100)}%</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Tooltip label="View Details">
                            <ActionIcon 
                              variant="light" 
                              size="sm"
                              onClick={() => onTransactionClick(match.transaction)}
                            >
                              <IconEye size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
                
                {searchResult.matches.length > 10 && (
                  <Text size="xs" c="dimmed" ta="center" mt="sm">
                    Showing top 10 of {searchResult.matches.length} matches
                  </Text>
                )}
              </Card>
            ) : (
              <Alert color="blue" variant="light">
                <Text size="sm">No transactions found matching your search criteria.</Text>
                <Text size="xs" c="dimmed" mt="xs">
                  Try searching for invoice numbers, PO references, amounts, or counterparty names.
                </Text>
              </Alert>
            )}
          </Stack>
        )}

        {/* Duplicate Detection Insights */}
        {duplicates.length > 0 && !searchQuery && (
          <Card bg="orange.0" p="sm">
            <Group gap="xs" mb="sm">
              <IconAlertTriangle size={16} color="orange" />
              <Text size="sm" fw={500}>Potential Duplicates Detected</Text>
              <Badge color="orange" variant="light" size="sm">
                {duplicates.length} groups
              </Badge>
            </Group>
            
            <Text size="xs" c="dimmed" mb="xs">
              Found {duplicates.length} potential duplicate transaction groups that may need investigation:
            </Text>
            
            <Stack gap="xs">
              {duplicates.slice(0, 3).map((group, index) => (
                <Group key={index} justify="space-between" p="xs" bg="white" style={{ borderRadius: 4 }}>
                  <Group gap="xs">
                    <Text size="xs" ff="monospace">{group.original.entryRef}</Text>
                    <Text size="xs">+{group.duplicates.length} similar</Text>
                  </Group>
                  <Button 
                    variant="subtle" 
                    size="compact-xs"
                    onClick={() => setSearchQuery(group.original.entryRef)}
                  >
                    Investigate
                  </Button>
                </Group>
              ))}
            </Stack>
            
            {duplicates.length > 3 && (
              <Text size="xs" c="dimmed" ta="center" mt="xs">
                +{duplicates.length - 3} more duplicate groups
              </Text>
            )}
          </Card>
        )}

        {/* Help Text */}
        {!searchQuery && !isSearching && (
          <Alert color="blue" variant="light">
            <Text size="sm" fw={500} mb="xs">Smart Search Tips:</Text>
            <Text size="xs" mb="xs">
              • Search by invoice numbers (INV-2024-001), PO references (PO-12345)
            </Text>
            <Text size="xs" mb="xs">
              • Find transactions by amount (1000.00) or counterparty name
            </Text>
            <Text size="xs" mb="xs">
              • Use partial matches (*2024*, ACME*) for broader searches
            </Text>
            <Text size="xs">
              • Bank references are automatically detected and matched
            </Text>
          </Alert>
        )}
      </Stack>
    </Card>
  );
}