import { useState } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Grid,
  Badge,
  Button,
  Code,
  Paper,
  ThemeIcon,
  Alert,
  Tabs,
  JsonInput,
  Progress,
} from '@mantine/core';
import {
  IconShieldCheck,
  IconX,
  IconCheck,
  IconInfoCircle,
  IconCode,
  IconDatabase,
  IconRefresh,
  IconPlayerPlay,
  IconSettings,
  IconEye,
} from '@tabler/icons-react';

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'schema' | 'business' | 'data-quality' | 'compliance';
  severity: 'error' | 'warning' | 'info';
  example: {
    input: any;
    expected: boolean;
    reason: string;
  };
}

interface ValidationResult {
  ruleId: string;
  passed: boolean;
  message: string;
  value?: any;
  severity: 'error' | 'warning' | 'info';
}

const VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'required-fields',
    name: 'Required Fields Check',
    description: 'Ensures all mandatory fields are present and not empty',
    category: 'schema',
    severity: 'error',
    example: {
      input: { amount: 1000, currency: 'USD', date: '2023-12-31' },
      expected: true,
      reason: 'All required fields (amount, currency, date) are present'
    }
  },
  {
    id: 'amount-validation',
    name: 'Amount Range Validation',
    description: 'Validates transaction amounts are within acceptable limits',
    category: 'business',
    severity: 'warning',
    example: {
      input: { amount: 150000, currency: 'USD' },
      expected: false,
      reason: 'Amount exceeds daily limit of $100,000'
    }
  },
  {
    id: 'currency-code',
    name: 'Currency Code Format',
    description: 'Validates currency codes against ISO 4217 standard',
    category: 'data-quality',
    severity: 'error',
    example: {
      input: { currency: 'XYZ' },
      expected: false,
      reason: 'XYZ is not a valid ISO 4217 currency code'
    }
  },
  {
    id: 'duplicate-check',
    name: 'Duplicate Transaction Check',
    description: 'Identifies potential duplicate transactions',
    category: 'business',
    severity: 'warning',
    example: {
      input: { id: 'TXN-001', amount: 1000, date: '2023-12-31', counterparty: 'ACME Corp' },
      expected: false,
      reason: 'Similar transaction already exists for same date and counterparty'
    }
  },
  {
    id: 'risk-assessment',
    name: 'Risk Level Assignment',
    description: 'Assigns appropriate risk levels based on transaction characteristics',
    category: 'compliance',
    severity: 'info',
    example: {
      input: { amount: 75000, counterparty: 'Offshore Entity', country: 'Unknown' },
      expected: true,
      reason: 'High-value transaction with offshore counterparty requires HIGH risk level'
    }
  },
  {
    id: 'date-validation',
    name: 'Date Range Validation',
    description: 'Ensures transaction dates are within acceptable ranges',
    category: 'data-quality',
    severity: 'error',
    example: {
      input: { date: '2025-12-31' },
      expected: false,
      reason: 'Future dates are not allowed for transaction booking'
    }
  }
];

export function ValidationExamples() {
  const [activeTab, setActiveTab] = useState<string>('interactive');
  const [selectedRule, setSelectedRule] = useState<ValidationRule | null>(VALIDATION_RULES[0]);
  const [customInput, setCustomInput] = useState('');
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [showLiveDemo, setShowLiveDemo] = useState(false);

  const runValidation = async (input: any) => {
    setIsValidating(true);
    setValidationResults([]);

    // Simulate validation process
    for (let i = 0; i < VALIDATION_RULES.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const rule = VALIDATION_RULES[i];
      const result = simulateValidation(rule, input);
      
      setValidationResults(prev => [...prev, result]);
    }
    
    setIsValidating(false);
  };

  const simulateValidation = (rule: ValidationRule, input: any): ValidationResult => {
    // Simulate validation logic for demo purposes
    const amount = parseFloat(input.amount) || 0; // Declare amount here for use in all cases
    
    switch (rule.id) {
      case 'required-fields':
        const hasRequired = input.amount && input.currency && input.date;
        return {
          ruleId: rule.id,
          passed: hasRequired,
          message: hasRequired ? 'All required fields are present' : 'Missing required fields',
          severity: rule.severity
        };
      
      case 'amount-validation':
        const withinLimit = amount <= 100000;
        return {
          ruleId: rule.id,
          passed: withinLimit,
          message: withinLimit ? 'Amount within acceptable limits' : `Amount ${amount} exceeds daily limit`,
          value: amount,
          severity: rule.severity
        };
      
      case 'currency-code':
        const validCurrencies = ['USD', 'EUR', 'GBP', 'SGD', 'JPY', 'CNY', 'AUD', 'CHF'];
        const isValidCurrency = validCurrencies.includes(input.currency);
        return {
          ruleId: rule.id,
          passed: isValidCurrency,
          message: isValidCurrency ? 'Valid currency code' : `Invalid currency code: ${input.currency}`,
          value: input.currency,
          severity: rule.severity
        };
      
      case 'duplicate-check':
        // Simulate duplicate check (random for demo)
        const isDuplicate = Math.random() < 0.2; // 20% chance of duplicate
        return {
          ruleId: rule.id,
          passed: !isDuplicate,
          message: isDuplicate ? 'Potential duplicate transaction detected' : 'No duplicates found',
          severity: rule.severity
        };
      
      case 'risk-assessment':
        const riskLevel = amount > 50000 ? 'HIGH' : amount > 10000 ? 'MEDIUM' : 'LOW';
        return {
          ruleId: rule.id,
          passed: true,
          message: `Risk level assigned: ${riskLevel}`,
          value: riskLevel,
          severity: rule.severity
        };
      
      case 'date-validation':
        const transactionDate = new Date(input.date);
        const isValidDate = transactionDate <= new Date() && transactionDate >= new Date('2020-01-01');
        return {
          ruleId: rule.id,
          passed: isValidDate,
          message: isValidDate ? 'Valid transaction date' : 'Invalid transaction date',
          value: input.date,
          severity: rule.severity
        };
      
      default:
        return {
          ruleId: rule.id,
          passed: true,
          message: 'Validation passed',
          severity: rule.severity
        };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'red';
      case 'warning': return 'orange';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'schema': return <IconCode size={16} />;
      case 'business': return <IconSettings size={16} />;
      case 'data-quality': return <IconDatabase size={16} />;
      case 'compliance': return <IconShieldCheck size={16} />;
      default: return <IconInfoCircle size={16} />;
    }
  };

  const runLiveDemo = async () => {
    setShowLiveDemo(true);
    const sampleInput = {
      amount: 75000,
      currency: 'USD',
      date: '2023-12-31',
      counterparty: 'International Corp',
      description: 'Large consulting payment'
    };
    
    await runValidation(sampleInput);
    setShowLiveDemo(false);
  };

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Group justify="space-between" mb="lg">
        <div>
          <Text size="xl" fw={700} mb="xs">Validation Rules & Examples</Text>
          <Text size="sm" c="dimmed">
            Interactive demonstration of data validation processes
          </Text>
        </div>
        
        <Button
          leftSection={<IconPlayerPlay size={16} />}
          onClick={runLiveDemo}
          disabled={isValidating || showLiveDemo}
          variant="filled"
        >
          Run Live Demo
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'interactive')}>
        <Tabs.List>
          <Tabs.Tab value="interactive" leftSection={<IconEye size={16} />}>
            Interactive Test
          </Tabs.Tab>
          <Tabs.Tab value="rules" leftSection={<IconShieldCheck size={16} />}>
            Validation Rules
          </Tabs.Tab>
          <Tabs.Tab value="examples" leftSection={<IconCode size={16} />}>
            Pass/Fail Examples
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="interactive" pt="md">
          <Grid>
            <Grid.Col span={6}>
              <Card padding="md" withBorder>
                <Text fw={600} mb="md">Test Your Data</Text>
                <Stack gap="md">
                  <JsonInput
                    label="Transaction Data (JSON)"
                    placeholder='{"amount": 5000, "currency": "USD", "date": "2023-12-31"}'
                    value={customInput}
                    onChange={setCustomInput}
                    autosize
                    minRows={8}
                  />
                  
                  <Button
                    leftSection={<IconRefresh size={16} />}
                    onClick={() => {
                      try {
                        const input = JSON.parse(customInput || '{}');
                        runValidation(input);
                      } catch (e) {
                        alert('Invalid JSON format');
                      }
                    }}
                    disabled={isValidating}
                    fullWidth
                  >
                    {isValidating ? 'Validating...' : 'Run Validation'}
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Card padding="md" withBorder>
                <Text fw={600} mb="md">Validation Results</Text>
                
                {isValidating && (
                  <Stack gap="md">
                    <Progress value={(validationResults.length / VALIDATION_RULES.length) * 100} />
                    <Text size="sm" c="dimmed">
                      Running validation rules... ({validationResults.length}/{VALIDATION_RULES.length})
                    </Text>
                  </Stack>
                )}
                
                {validationResults.length > 0 && (
                  <Stack gap="xs">
                    {validationResults.map((result, index) => {
                      const rule = VALIDATION_RULES.find(r => r.id === result.ruleId);
                      return (
                        <Alert
                          key={index}
                          icon={result.passed ? <IconCheck size={16} /> : <IconX size={16} />}
                          color={result.passed ? 'green' : getSeverityColor(result.severity)}
                          variant="light"
                        >
                          <Group justify="space-between">
                            <div>
                              <Text size="sm" fw={600}>{rule?.name}</Text>
                              <Text size="xs">{result.message}</Text>
                              {result.value && (
                                <Text size="xs" c="dimmed">Value: {JSON.stringify(result.value)}</Text>
                              )}
                            </div>
                            <Badge 
                              color={result.passed ? 'green' : getSeverityColor(result.severity)}
                              variant="light"
                            >
                              {result.passed ? 'PASS' : 'FAIL'}
                            </Badge>
                          </Group>
                        </Alert>
                      );
                    })}
                  </Stack>
                )}
                
                {validationResults.length === 0 && !isValidating && (
                  <Text size="sm" c="dimmed" ta="center">
                    Enter transaction data and click "Run Validation" to see results
                  </Text>
                )}
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="rules" pt="md">
          <Grid>
            <Grid.Col span={4}>
              <Card padding="md" withBorder>
                <Text fw={600} mb="md">Validation Rules</Text>
                <Stack gap="xs">
                  {VALIDATION_RULES.map((rule) => (
                    <Paper
                      key={rule.id}
                      p="sm"
                      bg={selectedRule?.id === rule.id ? 'blue.0' : 'gray.0'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedRule(rule)}
                    >
                      <Group justify="space-between">
                        <Group gap="xs">
                          {getCategoryIcon(rule.category)}
                          <div>
                            <Text size="sm" fw={600}>{rule.name}</Text>
                            <Text size="xs" c="dimmed">{rule.category}</Text>
                          </div>
                        </Group>
                        <Badge color={getSeverityColor(rule.severity)} size="xs">
                          {rule.severity}
                        </Badge>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={8}>
              {selectedRule && (
                <Card padding="md" withBorder>
                  <Group mb="md">
                    <ThemeIcon variant="light" color={getSeverityColor(selectedRule.severity)}>
                      {getCategoryIcon(selectedRule.category)}
                    </ThemeIcon>
                    <div>
                      <Text size="lg" fw={700}>{selectedRule.name}</Text>
                      <Group gap="xs">
                        <Badge variant="light" color={getSeverityColor(selectedRule.severity)}>
                          {selectedRule.severity}
                        </Badge>
                        <Badge variant="outline">{selectedRule.category}</Badge>
                      </Group>
                    </div>
                  </Group>
                  
                  <Text mb="md">{selectedRule.description}</Text>
                  
                  <Card padding="md" bg="gray.0" radius="sm">
                    <Text fw={600} mb="md">Example</Text>
                    
                    <Grid>
                      <Grid.Col span={6}>
                        <Text size="sm" fw={600} mb="xs">Input Data:</Text>
                        <Code block>
                          {JSON.stringify(selectedRule.example.input, null, 2)}
                        </Code>
                      </Grid.Col>
                      
                      <Grid.Col span={6}>
                        <Text size="sm" fw={600} mb="xs">Expected Result:</Text>
                        <Group mb="md">
                          <Badge color={selectedRule.example.expected ? 'green' : 'red'}>
                            {selectedRule.example.expected ? 'PASS' : 'FAIL'}
                          </Badge>
                        </Group>
                        
                        <Text size="sm" fw={600} mb="xs">Reason:</Text>
                        <Text size="sm">{selectedRule.example.reason}</Text>
                      </Grid.Col>
                    </Grid>
                  </Card>
                </Card>
              )}
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="examples" pt="md">
          <Stack gap="md">
            <Alert icon={<IconInfoCircle size={16} />} title="Validation Examples">
              These examples show how different types of data pass or fail validation rules
            </Alert>
            
            <Grid>
              <Grid.Col span={6}>
                <Card padding="md" withBorder>
                  <Group mb="md">
                    <ThemeIcon color="green" variant="light">
                      <IconCheck size={20} />
                    </ThemeIcon>
                    <Text fw={600} size="lg" c="green">Passing Examples</Text>
                  </Group>
                  
                  <Stack gap="md">
                    <Paper p="md" bg="green.0" radius="sm">
                      <Text fw={600} mb="xs">Valid Transaction</Text>
                      <Code block>
                        {`{
  "amount": 5000.00,
  "currency": "USD",
  "date": "2023-12-31",
  "counterparty": "ACME Corp",
  "description": "Service payment"
}`}
                      </Code>
                      <Text size="xs" c="green" mt="xs">
                        ✓ All required fields present
                        <br />✓ Amount within limits
                        <br />✓ Valid currency code
                        <br />✓ Valid date format
                      </Text>
                    </Paper>
                    
                    <Paper p="md" bg="green.0" radius="sm">
                      <Text fw={600} mb="xs">Low-Risk Transaction</Text>
                      <Code block>
                        {`{
  "amount": 1500.00,
  "currency": "SGD",
  "country": "Singapore",
  "type": "domestic"
}`}
                      </Code>
                      <Text size="xs" c="green" mt="xs">
                        ✓ Domestic transaction
                        <br />✓ Low amount
                        <br />✓ Known jurisdiction
                      </Text>
                    </Paper>
                  </Stack>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Card padding="md" withBorder>
                  <Group mb="md">
                    <ThemeIcon color="red" variant="light">
                      <IconX size={20} />
                    </ThemeIcon>
                    <Text fw={600} size="lg" c="red">Failing Examples</Text>
                  </Group>
                  
                  <Stack gap="md">
                    <Paper p="md" bg="red.0" radius="sm">
                      <Text fw={600} mb="xs">Invalid Data</Text>
                      <Code block>
                        {`{
  "amount": "invalid",
  "currency": "XYZ",
  "date": "2025-12-31"
}`}
                      </Code>
                      <Text size="xs" c="red" mt="xs">
                        ✗ Invalid amount format
                        <br />✗ Unknown currency code
                        <br />✗ Future date not allowed
                        <br />✗ Missing required fields
                      </Text>
                    </Paper>
                    
                    <Paper p="md" bg="red.0" radius="sm">
                      <Text fw={600} mb="xs">High-Risk Transaction</Text>
                      <Code block>
                        {`{
  "amount": 500000.00,
  "currency": "USD",
  "counterparty": "Unknown Entity",
  "country": "High-risk jurisdiction"
}`}
                      </Code>
                      <Text size="xs" c="red" mt="xs">
                        ✗ Amount exceeds limits
                        <br />✗ Unknown counterparty
                        <br />✗ High-risk jurisdiction
                        <br />⚠ Requires manual review
                      </Text>
                    </Paper>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
            
            <Card padding="md" bg="blue.0" radius="sm">
              <Group mb="md">
                <IconInfoCircle size={20} />
                <Text fw={600}>Validation Best Practices</Text>
              </Group>
              
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" fw={600} mb="xs">Data Quality Rules:</Text>
                  <Stack gap="xs">
                    <Text size="xs">• Validate all required fields are present</Text>
                    <Text size="xs">• Check data types and formats</Text>
                    <Text size="xs">• Ensure referential integrity</Text>
                    <Text size="xs">• Validate against business constraints</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" fw={600} mb="xs">Risk Assessment:</Text>
                  <Stack gap="xs">
                    <Text size="xs">• Amount-based risk thresholds</Text>
                    <Text size="xs">• Geographic risk factors</Text>
                    <Text size="xs">• Counterparty reputation checks</Text>
                    <Text size="xs">• Pattern-based anomaly detection</Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}