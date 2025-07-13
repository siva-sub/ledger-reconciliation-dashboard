import { useState } from 'react';
import {
  Modal,
  Text,
  Group,
  Badge,
  Card,
  Stack,
  Grid,
  Tabs,
  Code,
  Paper,
  Timeline,
  ThemeIcon,
  Progress,
  Button,
  Alert,
  Table,
  ScrollArea,
  JsonInput,
  Textarea,
  Switch
} from '@mantine/core';
import {
  IconDatabase,
  IconTransform,
  IconShieldCheck,
  IconDownload,
  IconCode,
  IconChartLine,
  IconAlertTriangle,
  IconInfoCircle,
  IconCheck,
  IconClock,
  IconFileText,
  IconSettings,
  IconEye,
  IconRefresh
} from '@tabler/icons-react';
import { ETLStep, StepType } from '@/types/etl';

interface ETLStepDetailProps {
  step: ETLStep | null;
  opened: boolean;
  onClose: () => void;
}

const STEP_ICONS: Record<StepType, React.ReactElement> = {
  EXTRACT: <IconDownload size={20} />,
  TRANSFORM: <IconTransform size={20} />,
  VALIDATE: <IconShieldCheck size={20} />,
  LOAD: <IconDatabase size={20} />,
  RECONCILE: <IconChartLine size={20} />,
  AUDIT: <IconSettings size={20} />
};

const MOCK_XML_INPUT = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.13">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>STMT20231231001</MsgId>
      <CreDtTm>2023-12-31T23:59:59</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>20231231-SGD-001</Id>
      <ElctrncSeqNb>1</ElctrncSeqNb>
      <Acct>
        <Id>
          <IBAN>SG12DBSS12345678901234</IBAN>
        </Id>
        <Ccy>SGD</Ccy>
      </Acct>
      <Ntry>
        <Amt Ccy="USD">15000.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt>
          <Dt>2023-12-31</Dt>
        </BookgDt>
        <NtryDtls>
          <TxnDtls>
            <RltdPties>
              <Cdtr>
                <Nm>ACME Corporation</Nm>
              </Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Payment for services</Ustrd>
            </RmtInf>
          </TxnDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

const MOCK_JSON_OUTPUT = `{
  "id": "txn-1",
  "entryRef": "TXN-001-20231231",
  "bookingDate": "2023-12-31",
  "valueDate": "2023-12-31",
  "amount": {
    "original": 15000,
    "currency": "USD"
  },
  "creditDebitIndicator": "CRDT",
  "counterparty": {
    "name": "ACME Corporation",
    "account": "1234567890"
  },
  "description": "Payment for services",
  "riskLevel": "MEDIUM",
  "reconciliationStatus": "PENDING",
  "fxConversion": {
    "fromCurrency": "USD",
    "toCurrency": "SGD",
    "rate": 1.345,
    "rateDate": "2023-12-31",
    "convertedAmount": 20175,
    "provider": "CSV",
    "confidence": 95
  }
}`;

export function ETLStepDetail({ step, opened, onClose }: ETLStepDetailProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showLiveDemo, setShowLiveDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);

  if (!step) return null;

  const runLiveDemo = () => {
    setShowLiveDemo(true);
    setDemoProgress(0);
    
    const interval = setInterval(() => {
      setDemoProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStepExplanation = (stepType: StepType) => {
    switch (stepType) {
      case 'EXTRACT':
        return {
          purpose: 'Parse and extract data from CAMT.053 XML files',
          keyOperations: [
            'XML schema validation against ISO 20022 standard',
            'Extract transaction entries and account information',
            'Parse counterparty details and transaction references',
            'Convert XML structure to internal data format'
          ],
          challenges: [
            'Handling malformed XML documents',
            'Managing large file sizes efficiently',
            'Preserving data integrity during parsing',
            'Supporting multiple CAMT.053 versions'
          ]
        };
      case 'TRANSFORM':
        return {
          purpose: 'Apply business rules and data transformations',
          keyOperations: [
            'Currency conversion using real-time FX rates',
            'Transaction categorization and classification',
            'Data normalization and standardization',
            'Enrichment with additional business data'
          ],
          challenges: [
            'Maintaining FX rate accuracy and timeliness',
            'Handling missing or incomplete data',
            'Ensuring consistent categorization rules',
            'Managing data type conversions'
          ]
        };
      case 'VALIDATE':
        return {
          purpose: 'Ensure data quality and business rule compliance',
          keyOperations: [
            'Business rule validation and enforcement',
            'Risk assessment and scoring',
            'Data completeness and accuracy checks',
            'Compliance verification for regulatory requirements'
          ],
          challenges: [
            'Balancing validation strictness with processing speed',
            'Managing complex interdependent rules',
            'Handling edge cases and exceptions',
            'Maintaining audit trails for compliance'
          ]
        };
      case 'LOAD':
        return {
          purpose: 'Persist validated data to target systems',
          keyOperations: [
            'Database insertion with transaction integrity',
            'Index creation and optimization',
            'Audit trail generation',
            'Error handling and rollback procedures'
          ],
          challenges: [
            'Ensuring ACID compliance for transactions',
            'Managing database performance under load',
            'Handling duplicate detection and resolution',
            'Maintaining referential integrity'
          ]
        };
      default:
        return {
          purpose: 'Process financial transaction data',
          keyOperations: [],
          challenges: []
        };
    }
  };

  const explanation = getStepExplanation(step.type);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <ThemeIcon variant="light" size="lg">
            {STEP_ICONS[step.type]}
          </ThemeIcon>
          <div>
            <Text size="lg" fw={700}>{step.name}</Text>
            <Text size="sm" c="dimmed">{step.type} Step</Text>
          </div>
        </Group>
      }
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconInfoCircle size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="data-flow" leftSection={<IconCode size={16} />}>
            Data Flow
          </Tabs.Tab>
          <Tabs.Tab value="performance" leftSection={<IconChartLine size={16} />}>
            Performance
          </Tabs.Tab>
          <Tabs.Tab value="demo" leftSection={<IconEye size={16} />}>
            Live Demo
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Stack gap="md">
            {/* Step Status and Metrics */}
            <Grid>
              <Grid.Col span={6}>
                <Card padding="md" bg="blue.0" radius="sm">
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={600}>Processing Status</Text>
                    <Badge variant="filled" color={step.status === 'COMPLETED' ? 'green' : 'blue'}>
                      {step.status}
                    </Badge>
                  </Group>
                  <Progress value={step.status === 'COMPLETED' ? 100 : 75} size="lg" />
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card padding="md" bg="green.0" radius="sm">
                  <Text size="sm" fw={600} mb="xs">Execution Time</Text>
                  <Group>
                    <IconClock size={20} />
                    <Text size="lg" fw={700}>{step.duration}ms</Text>
                  </Group>
                </Card>
              </Grid.Col>
            </Grid>

            {/* Data Flow Summary */}
            <Card padding="md" withBorder>
              <Text fw={600} mb="md">Data Flow Summary</Text>
              <Grid>
                <Grid.Col span={4}>
                  <Paper p="md" bg="blue.0" radius="sm" ta="center">
                    <Text size="xs" c="blue" fw={600} mb="xs">INPUT</Text>
                    <Text size="xl" fw={700}>{step.inputCount}</Text>
                    <Text size="xs" c="dimmed">records</Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Paper p="md" bg="green.0" radius="sm" ta="center">
                    <Text size="xs" c="green" fw={600} mb="xs">OUTPUT</Text>
                    <Text size="xl" fw={700}>{step.outputCount}</Text>
                    <Text size="xs" c="dimmed">records</Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Paper p="md" bg="red.0" radius="sm" ta="center">
                    <Text size="xs" c="red" fw={600} mb="xs">ERRORS</Text>
                    <Text size="xl" fw={700}>{step.errorCount}</Text>
                    <Text size="xs" c="dimmed">failures</Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Card>

            {/* Purpose and Operations */}
            <Card padding="md" withBorder>
              <Text fw={600} mb="md">Step Purpose</Text>
              <Text size="sm" mb="md">{explanation.purpose}</Text>
              
              <Grid>
                <Grid.Col span={6}>
                  <Text fw={600} mb="xs" size="sm">Key Operations</Text>
                  <Stack gap="xs">
                    {explanation.keyOperations.map((operation, idx) => (
                      <Group key={idx} gap="xs">
                        <ThemeIcon size="xs" color="blue" variant="light">
                          <IconCheck size={10} />
                        </ThemeIcon>
                        <Text size="xs">{operation}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={600} mb="xs" size="sm">Common Challenges</Text>
                  <Stack gap="xs">
                    {explanation.challenges.map((challenge, idx) => (
                      <Group key={idx} gap="xs">
                        <ThemeIcon size="xs" color="orange" variant="light">
                          <IconAlertTriangle size={10} />
                        </ThemeIcon>
                        <Text size="xs">{challenge}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Grid.Col>
              </Grid>
            </Card>

            {/* Rules and Validations */}
            <Grid>
              <Grid.Col span={6}>
                <Card padding="md" withBorder>
                  <Text fw={600} mb="md">Transformation Rules</Text>
                  <Stack gap="xs">
                    {step.details.transformationRules.length > 0 ? (
                      step.details.transformationRules.map((rule, idx) => (
                        <Group key={idx} gap="xs">
                          <ThemeIcon size="xs" color="blue" variant="light">
                            <IconTransform size={10} />
                          </ThemeIcon>
                          <Text size="xs">{rule}</Text>
                        </Group>
                      ))
                    ) : (
                      <Text size="xs" c="dimmed">No transformation rules defined</Text>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card padding="md" withBorder>
                  <Text fw={600} mb="md">Validation Rules</Text>
                  <Stack gap="xs">
                    {step.details.validationRules.length > 0 ? (
                      step.details.validationRules.map((rule, idx) => (
                        <Group key={idx} gap="xs">
                          <ThemeIcon size="xs" color="green" variant="light">
                            <IconShieldCheck size={10} />
                          </ThemeIcon>
                          <Text size="xs">{rule}</Text>
                        </Group>
                      ))
                    ) : (
                      <Text size="xs" c="dimmed">No validation rules defined</Text>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            {/* Sub-steps if available */}
            {step.subSteps && step.subSteps.length > 0 && (
              <Card padding="md" withBorder>
                <Text fw={600} mb="md">Sub-step Breakdown</Text>
                <Timeline>
                  {step.subSteps.map((subStep) => (
                    <Timeline.Item key={subStep.id} bullet={<IconCheck size={16} />}>
                      <Group justify="space-between">
                        <Text size="sm" fw={500}>{subStep.name}</Text>
                        <Badge size="xs" variant="light">
                          {subStep.duration}ms
                        </Badge>
                      </Group>
                      <Text size="xs" c="dimmed">{subStep.details}</Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="data-flow" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="lg" fw={600}>Data Transformation View</Text>
              <Group>
                <Badge variant="outline">{step.details.inputFormat}</Badge>
                <Text c="dimmed">→</Text>
                <Badge variant="outline">{step.details.outputFormat}</Badge>
              </Group>
            </Group>

            <Grid>
              <Grid.Col span={6}>
                <Card padding="md" withBorder>
                  <Group mb="md">
                    <IconFileText size={20} />
                    <Text fw={600}>Input Data ({step.details.inputFormat})</Text>
                  </Group>
                  {step.type === 'EXTRACT' ? (
                    <Code block>{MOCK_XML_INPUT}</Code>
                  ) : (
                    <JsonInput
                      value={MOCK_JSON_OUTPUT}
                      readOnly
                      autosize
                      minRows={15}
                      maxRows={20}
                    />
                  )}
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card padding="md" withBorder>
                  <Group mb="md">
                    <IconDatabase size={20} />
                    <Text fw={600}>Output Data ({step.details.outputFormat})</Text>
                  </Group>
                  {step.type === 'LOAD' ? (
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Field</Table.Th>
                          <Table.Th>Value</Table.Th>
                          <Table.Th>Type</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        <Table.Tr>
                          <Table.Td>id</Table.Td>
                          <Table.Td>txn-1</Table.Td>
                          <Table.Td>VARCHAR</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td>amount</Table.Td>
                          <Table.Td>15000.00</Table.Td>
                          <Table.Td>DECIMAL</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td>currency</Table.Td>
                          <Table.Td>USD</Table.Td>
                          <Table.Td>VARCHAR(3)</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td>risk_level</Table.Td>
                          <Table.Td>MEDIUM</Table.Td>
                          <Table.Td>ENUM</Table.Td>
                        </Table.Tr>
                      </Table.Tbody>
                    </Table>
                  ) : (
                    <JsonInput
                      value={MOCK_JSON_OUTPUT}
                      readOnly
                      autosize
                      minRows={15}
                      maxRows={20}
                    />
                  )}
                </Card>
              </Grid.Col>
            </Grid>

            {/* Transformation Details */}
            {step.details.transformationRules.length > 0 && (
              <Alert icon={<IconInfoCircle size={16} />} title="Transformation Logic">
                <Text size="sm" mb="md">
                  This step applies the following transformations to convert data from {step.details.inputFormat} to {step.details.outputFormat}:
                </Text>
                <Stack gap="xs">
                  {step.details.transformationRules.map((rule, idx) => (
                    <Group key={idx} gap="xs">
                      <Text size="sm" fw={600}>{idx + 1}.</Text>
                      <Text size="sm">{rule}</Text>
                    </Group>
                  ))}
                </Stack>
              </Alert>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="performance" pt="md">
          <Stack gap="md">
            <Text size="lg" fw={600}>Performance Analysis</Text>
            
            <Grid>
              <Grid.Col span={4}>
                <Card padding="md" bg="blue.0" radius="sm" ta="center">
                  <IconClock size={24} color="blue" />
                  <Text size="lg" fw={700} mt="xs">{step.duration}ms</Text>
                  <Text size="xs" c="dimmed">Execution Time</Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={4}>
                <Card padding="md" bg="green.0" radius="sm" ta="center">
                  <IconChartLine size={24} color="green" />
                  <Text size="lg" fw={700} mt="xs">{Math.round(step.outputCount / (step.duration / 1000))}</Text>
                  <Text size="xs" c="dimmed">Records/Second</Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={4}>
                <Card padding="md" bg="orange.0" radius="sm" ta="center">
                  <IconAlertTriangle size={24} color="orange" />
                  <Text size="lg" fw={700} mt="xs">{((step.errorCount / step.inputCount) * 100).toFixed(1)}%</Text>
                  <Text size="xs" c="dimmed">Error Rate</Text>
                </Card>
              </Grid.Col>
            </Grid>

            <Card padding="md" withBorder>
              <Text fw={600} mb="md">Performance Benchmarks</Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Metric</Table.Th>
                    <Table.Th>Current</Table.Th>
                    <Table.Th>Target</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>Processing Time</Table.Td>
                    <Table.Td>{step.duration}ms</Table.Td>
                    <Table.Td>&lt; 200ms</Table.Td>
                    <Table.Td>
                      <Badge color={step.duration < 200 ? 'green' : 'orange'} size="xs">
                        {step.duration < 200 ? 'Good' : 'Needs Optimization'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>Error Rate</Table.Td>
                    <Table.Td>{((step.errorCount / step.inputCount) * 100).toFixed(1)}%</Table.Td>
                    <Table.Td>&lt; 1%</Table.Td>
                    <Table.Td>
                      <Badge color={step.errorCount === 0 ? 'green' : 'red'} size="xs">
                        {step.errorCount === 0 ? 'Excellent' : 'Attention Needed'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>Throughput</Table.Td>
                    <Table.Td>{Math.round(step.outputCount / (step.duration / 1000))} rec/s</Table.Td>
                    <Table.Td>&gt; 100 rec/s</Table.Td>
                    <Table.Td>
                      <Badge color="green" size="xs">Good</Badge>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Card>

            <Alert icon={<IconInfoCircle size={16} />} title="Performance Insights">
              <Text size="sm">
                This step is performing within expected parameters. Consider implementing caching strategies 
                for frequently accessed data and parallel processing for larger datasets to further improve performance.
              </Text>
            </Alert>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="demo" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="lg" fw={600}>Live Processing Demo</Text>
              <Group>
                <Switch
                  label="Show real-time processing"
                  checked={showLiveDemo}
                  onChange={(event) => setShowLiveDemo(event.currentTarget.checked)}
                />
                <Button
                  leftSection={<IconRefresh size={16} />}
                  variant="light"
                  onClick={runLiveDemo}
                  disabled={showLiveDemo && demoProgress < 100}
                >
                  Run Demo
                </Button>
              </Group>
            </Group>

            {showLiveDemo && (
              <Card padding="md" bg="blue.0" radius="sm">
                <Text fw={600} mb="md">Processing Simulation</Text>
                <Progress value={demoProgress} size="lg" mb="md" />
                <Text size="sm">
                  {demoProgress < 100 ? `Processing ${step.name}... ${demoProgress}%` : 'Processing completed successfully!'}
                </Text>
              </Card>
            )}

            <Grid>
              <Grid.Col span={6}>
                <Card padding="md" withBorder>
                  <Text fw={600} mb="md">Sample Input</Text>
                  <Textarea
                    value={step.type === 'EXTRACT' ? MOCK_XML_INPUT.substring(0, 500) + '...' : JSON.stringify(JSON.parse(MOCK_JSON_OUTPUT), null, 2)}
                    readOnly
                    autosize
                    minRows={8}
                  />
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card padding="md" withBorder>
                  <Text fw={600} mb="md">Expected Output</Text>
                  <Textarea
                    value={JSON.stringify(JSON.parse(MOCK_JSON_OUTPUT), null, 2)}
                    readOnly
                    autosize
                    minRows={8}
                  />
                </Card>
              </Grid.Col>
            </Grid>

            <Alert icon={<IconEye size={16} />} title="Demo Features">
              <Text size="sm">
                This interactive demo shows how data flows through the {step.name} step. 
                Toggle the real-time processing switch to see step-by-step execution, 
                or click "Run Demo" to simulate the complete process.
              </Text>
            </Alert>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}