import { useState } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Grid,
  Button,
  Code,
  Paper,
  Badge,
  Alert,
  JsonInput,
  Table,
  ThemeIcon,
  Progress,
  Timeline,
  Select,
  NumberInput
} from '@mantine/core';
import {
  IconArrowRight,
  IconCode,
  IconRefresh,
  IconCurrencyDollar,
  IconShieldCheck,
  IconDatabase,
  IconInfoCircle,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

interface DataTransformationViewerProps {
  onTransformationComplete?: (result: unknown) => void;
}

interface TransformationStep {
  id: string;
  name: string;
  description: string;
  input: unknown;
  output: unknown;
  status: 'pending' | 'running' | 'completed' | 'error';
  duration?: number;
  icon: React.ReactElement;
}

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.13">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="EUR">8500.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2023-12-31</Dt></BookgDt>
        <NtryDtls>
          <TxnDtls>
            <RltdPties>
              <Cdtr><Nm>European Client Ltd</Nm></Cdtr>
            </RltdPties>
            <RmtInf><Ustrd>Consulting fees Q4</Ustrd></RmtInf>
          </TxnDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

const FX_RATES = {
  'EUR-SGD': 1.4462,
  'USD-SGD': 1.3450,
  'GBP-SGD': 1.6890,
  'JPY-SGD': 0.0095
};

export function DataTransformationViewer({ onTransformationComplete }: DataTransformationViewerProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [amount, setAmount] = useState(8500);
  const [transformationSteps, setTransformationSteps] = useState<TransformationStep[]>([
    {
      id: 'xml-parse',
      name: 'XML Parsing',
      description: 'Parse CAMT.053 XML and extract transaction data',
      input: SAMPLE_XML,
      output: null,
      status: 'pending',
      icon: <IconCode size={20} />
    },
    {
      id: 'data-extract',
      name: 'Data Extraction',
      description: 'Extract key fields and structure data',
      input: null,
      output: null,
      status: 'pending',
      icon: <IconDatabase size={20} />
    },
    {
      id: 'fx-conversion',
      name: 'FX Conversion',
      description: 'Apply foreign exchange rates and convert amounts',
      input: null,
      output: null,
      status: 'pending',
      icon: <IconCurrencyDollar size={20} />
    },
    {
      id: 'validation',
      name: 'Risk Assessment',
      description: 'Validate data and assign risk levels',
      input: null,
      output: null,
      status: 'pending',
      icon: <IconShieldCheck size={20} />
    }
  ]);

  const runTransformation = async () => {
    setIsPlaying(true);
    setActiveStep(0);

    // Reset all steps
    setTransformationSteps(steps => 
      steps.map(step => ({ ...step, status: 'pending' as const, output: null }))
    );

    for (let i = 0; i < transformationSteps.length; i++) {
      setActiveStep(i);
      
      // Set current step to running
      setTransformationSteps(steps => 
        steps.map((step, index) => 
          index === i ? { ...step, status: 'running' as const } : step
        )
      );

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate output for current step
      const output = generateStepOutput(i);
      
      setTransformationSteps(steps => 
        steps.map((step, index) => 
          index === i ? { 
            ...step, 
            status: 'completed' as const, 
            output,
            duration: Math.floor(Math.random() * 200) + 50
          } : step
        )
      );

      // Set input for next step
      if (i < transformationSteps.length - 1) {
        setTransformationSteps(steps => 
          steps.map((step, index) => 
            index === i + 1 ? { ...step, input: output } : step
          )
        );
      }
    }

    setIsPlaying(false);
    onTransformationComplete?.(transformationSteps[transformationSteps.length - 1].output);
  };

  const generateStepOutput = (stepIndex: number): unknown => {
    switch (stepIndex) {
      case 0: { // XML Parsing
        return {
          messageId: "STMT20231231001",
          accountId: "SG12DBSS12345678901234",
          entries: [{
            amount: amount,
            currency: selectedCurrency,
            creditDebitIndicator: "CRDT",
            bookingDate: "2023-12-31",
            counterparty: "European Client Ltd",
            reference: "Consulting fees Q4"
          }]
        };
      }

      case 1: { // Data Extraction
        return {
          id: `txn-${Date.now()}`,
          entryRef: `TXN-${Math.floor(Math.random() * 1000)}-20231231`,
          bookingDate: "2023-12-31",
          valueDate: "2023-12-31",
          amount: {
            original: amount,
            currency: selectedCurrency
          },
          creditDebitIndicator: "CRDT",
          counterparty: {
            name: "European Client Ltd",
            account: "9876543210"
          },
          description: "Consulting fees Q4",
          rawData: {
            messageId: "STMT20231231001",
            accountId: "SG12DBSS12345678901234"
          }
        };
      }

      case 2: { // FX Conversion
        const fxRate = FX_RATES[`${selectedCurrency}-SGD` as keyof typeof FX_RATES] || 1;
        const convertedAmount = amount * fxRate;
        
        return {
          id: `txn-${Date.now()}`,
          entryRef: `TXN-${Math.floor(Math.random() * 1000)}-20231231`,
          bookingDate: "2023-12-31",
          valueDate: "2023-12-31",
          amount: {
            original: amount,
            currency: selectedCurrency
          },
          creditDebitIndicator: "CRDT",
          counterparty: {
            name: "European Client Ltd",
            account: "9876543210"
          },
          description: "Consulting fees Q4",
          fxConversion: {
            fromCurrency: selectedCurrency,
            toCurrency: "SGD",
            rate: fxRate,
            rateDate: "2023-12-31",
            convertedAmount: Math.round(convertedAmount * 100) / 100,
            provider: "MAS",
            confidence: 95
          }
        };
      }

      case 3: { // Risk Assessment
        const previousOutput = generateStepOutput(2) as Record<string, any>;
        const riskLevel = amount > 10000 ? 'HIGH' : amount > 5000 ? 'MEDIUM' : 'LOW';
        
        return {
          ...previousOutput,
          riskLevel,
          reconciliationStatus: 'PENDING',
          validationResults: {
            schemaValidation: true,
            businessRules: true,
            duplicateCheck: true,
            amountValidation: true,
            counterpartyValidation: true
          },
          qualityScore: Math.floor(Math.random() * 10) + 90, // 90-99
          categories: ['REVENUE'],
          tags: ['consulting', 'international', selectedCurrency.toLowerCase()]
        };
      }

      default:
        return null;
    }
  };

  const getCurrentProgress = () => {
    if (!isPlaying) return 0;
    return ((activeStep + 1) / transformationSteps.length) * 100;
  };

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Group justify="space-between" mb="lg">
        <div>
          <Text size="xl" fw={700} mb="xs">Data Transformation Viewer</Text>
          <Text size="sm" c="dimmed">
            Watch financial data transform through each ETL step
          </Text>
        </div>
        
        <Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={runTransformation}
            disabled={isPlaying}
            variant="filled"
          >
            {isPlaying ? 'Processing...' : 'Run Transformation'}
          </Button>
        </Group>
      </Group>

      {/* Input Controls */}
      <Card padding="md" bg="gray.0" radius="sm" mb="xl">
        <Text fw={600} mb="md">Customize Input Data</Text>
        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Currency"
              value={selectedCurrency}
              onChange={(value) => setSelectedCurrency(value || 'EUR')}
              data={[
                { value: 'EUR', label: 'EUR - Euro' },
                { value: 'USD', label: 'USD - US Dollar' },
                { value: 'GBP', label: 'GBP - British Pound' },
                { value: 'JPY', label: 'JPY - Japanese Yen' }
              ]}
              disabled={isPlaying}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Amount"
              value={amount}
              onChange={(value) => setAmount(Number(value))}
              min={1}
              max={100000}
              step={100}
              disabled={isPlaying}
            />
          </Grid.Col>
        </Grid>
      </Card>

      {/* Overall Progress */}
      {isPlaying && (
        <Card padding="md" bg="blue.0" radius="sm" mb="xl">
          <Group justify="space-between" mb="xs">
            <Text fw={600} size="sm">Transformation Progress</Text>
            <Text size="sm">{Math.round(getCurrentProgress())}%</Text>
          </Group>
          <Progress value={getCurrentProgress()} size="lg" radius="md" />
          <Text size="xs" c="dimmed" mt="xs">
            Step {activeStep + 1} of {transformationSteps.length}: {transformationSteps[activeStep]?.name}
          </Text>
        </Card>
      )}

      {/* Transformation Steps */}
      <Timeline active={isPlaying ? activeStep : transformationSteps.findIndex(s => s.status === 'completed')} bulletSize={40} lineWidth={2}>
        {transformationSteps.map((step, index) => (
          <Timeline.Item
            key={step.id}
            bullet={
              <ThemeIcon
                size={35}
                variant="filled"
                color={
                  step.status === 'completed' ? 'green' :
                  step.status === 'running' ? 'blue' :
                  step.status === 'error' ? 'red' : 'gray'
                }
                radius="xl"
              >
                {step.status === 'running' ? (
                  <IconRefresh size={18} className="animate-spin" />
                ) : step.status === 'completed' ? (
                  <IconCheck size={18} />
                ) : step.status === 'error' ? (
                  <IconX size={18} />
                ) : (
                  step.icon
                )}
              </ThemeIcon>
            }
            title={
              <Group justify="space-between" style={{ width: '100%' }}>
                <div>
                  <Text fw={600} size="lg">{step.name}</Text>
                  <Text size="sm" c="dimmed">{step.description}</Text>
                </div>
                <Group>
                  {step.duration && (
                    <Badge variant="light" size="sm">{step.duration}ms</Badge>
                  )}
                  <Badge 
                    variant="filled" 
                    size="sm"
                    color={
                      step.status === 'completed' ? 'green' :
                      step.status === 'running' ? 'blue' :
                      step.status === 'error' ? 'red' : 'gray'
                    }
                  >
                    {step.status}
                  </Badge>
                </Group>
              </Group>
            }
          >
            <Grid mb="md">
              {/* Input */}
              <Grid.Col span={6}>
                <Card padding="md" bg="blue.0" radius="sm">
                  <Group mb="md">
                    <IconCode size={18} />
                    <Text fw={600} size="sm">Input</Text>
                  </Group>
                  {step.input ? (
                    typeof step.input === 'string' ? (
                      <Code block>{step.input.substring(0, 200)}...</Code>
                    ) : (
                      <JsonInput
                        value={JSON.stringify(step.input, null, 2)}
                        readOnly
                        autosize
                        maxRows={8}
                      />
                    )
                  ) : (
                    <Text size="sm" c="dimmed">Waiting for input...</Text>
                  )}
                </Card>
              </Grid.Col>

              {/* Arrow */}
              <Grid.Col span="auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ThemeIcon size="lg" variant="light" color="gray">
                  <IconArrowRight size={20} />
                </ThemeIcon>
              </Grid.Col>

              {/* Output */}
              <Grid.Col span={6}>
                <Card padding="md" bg="green.0" radius="sm">
                  <Group mb="md">
                    <IconDatabase size={18} />
                    <Text fw={600} size="sm">Output</Text>
                  </Group>
                  {step.output ? (
                    <JsonInput
                      value={JSON.stringify(step.output, null, 2)}
                      readOnly
                      autosize
                      maxRows={8}
                    />
                  ) : (
                    <Text size="sm" c="dimmed">
                      {step.status === 'running' ? 'Processing...' : 'No output yet'}
                    </Text>
                  )}
                </Card>
              </Grid.Col>
            </Grid>

            {/* Step-specific insights */}
            {step.status === 'completed' && step.output ? (
              <Alert icon={<IconInfoCircle size={16} />} mb="md">
                {(() => {
                  if (index === 0) {
                    return (
                      <Text size="sm">
                        Successfully parsed XML and extracted {(step.output as any)?.entries?.length || 0} transaction entries.
                        Validated against ISO 20022 schema.
                      </Text>
                    );
                  }
                  if (index === 1) {
                    return (
                      <Text size="sm">
                        Structured transaction data with unique ID {(step.output as any)?.id || 'N/A'}. 
                        Mapped counterparty information and transaction references.
                      </Text>
                    );
                  }
                  if (index === 2 && (step.output as any)?.fxConversion) {
                    return (
                      <Text size="sm">
                        Applied FX rate of {(step.output as any)?.fxConversion?.rate} ({(step.output as any)?.fxConversion?.fromCurrency} to {(step.output as any)?.fxConversion?.toCurrency}).
                        Converted amount: SGD {(step.output as any)?.fxConversion?.convertedAmount?.toLocaleString()}
                      </Text>
                    );
                  }
                  if (index === 3) {
                    return (
                      <Text size="sm">
                        Assigned risk level: {(step.output as any)?.riskLevel}. 
                        Quality score: {(step.output as any)?.qualityScore}/100. 
                        All validation checks passed.
                      </Text>
                    );
                  }
                  return null;
                })()}
              </Alert>
            ) : null}
          </Timeline.Item>
        ))}
      </Timeline>

      {/* Final Result Summary */}
      {transformationSteps.every(step => step.status === 'completed') && (
        <Card mt="xl" padding="lg" bg="green.0" radius="md" withBorder>
          <Group mb="md">
            <ThemeIcon size="lg" color="green" variant="light">
              <IconCheck size={24} />
            </ThemeIcon>
            <Text size="lg" fw={700} c="green">Transformation Complete!</Text>
          </Group>
          
          <Text size="sm" mb="md">
            Successfully processed transaction through all ETL steps. The financial data has been:
          </Text>
          
          <Grid>
            <Grid.Col span={6}>
              <Stack gap="xs">
                <Group gap="xs">
                  <IconCheck size={16} color="green" />
                  <Text size="sm">Parsed and validated from XML format</Text>
                </Group>
                <Group gap="xs">
                  <IconCheck size={16} color="green" />
                  <Text size="sm">Extracted and structured key data fields</Text>
                </Group>
                <Group gap="xs">
                  <IconCheck size={16} color="green" />
                  <Text size="sm">Applied current FX rates and conversions</Text>
                </Group>
                <Group gap="xs">
                  <IconCheck size={16} color="green" />
                  <Text size="sm">Assessed risk level and quality score</Text>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={6}>
              {transformationSteps[3]?.output ? (
                <Paper p="md" bg="white" radius="sm">
                  <Text size="sm" fw={600} mb="xs">Final Transaction Summary</Text>
                  <Table>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td>Amount</Table.Td>
                        <Table.Td>{selectedCurrency} {amount.toLocaleString()}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td>SGD Equivalent</Table.Td>
                        <Table.Td>SGD {(transformationSteps[3].output as any).fxConversion?.convertedAmount.toLocaleString()}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td>Risk Level</Table.Td>
                        <Table.Td>
                          <Badge color={
                            (transformationSteps[3].output as any).riskLevel === 'HIGH' ? 'red' :
                            (transformationSteps[3].output as any).riskLevel === 'MEDIUM' ? 'orange' : 'green'
                          }>
                            {(transformationSteps[3].output as any).riskLevel}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td>Quality Score</Table.Td>
                        <Table.Td>{(transformationSteps[3].output as any).qualityScore}/100</Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </Paper>
              ) : null}
            </Grid.Col>
          </Grid>
        </Card>
      )}
    </Card>
  );
}