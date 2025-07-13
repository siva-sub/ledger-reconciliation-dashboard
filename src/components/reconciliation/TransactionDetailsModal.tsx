import { 
  Modal, 
  Stack, 
  Text, 
  Group, 
  Badge, 
  Card,
  Button,
  Grid,
  Alert,
  List,
  CopyButton,
  ActionIcon,
  Tooltip,
  Progress
} from '@mantine/core';
import { 
  IconCopy, 
  IconExternalLink, 
  IconAlertTriangle, 
  IconInfoCircle,
  IconChecks,
  IconX,
  IconBuilding,
  IconCurrencyEuro
} from '@tabler/icons-react';
import { FinancialTransaction } from '@/types';
import { bankCodeTranslator, TransactionCodeExplanation } from '@/services/bankCodeTranslation';

interface TransactionDetailsModalProps {
  transaction: FinancialTransaction | null;
  opened: boolean;
  onClose: () => void;
}

interface RemittanceAnalysis {
  isStructured: boolean;
  completeness: number;
  hasInvoiceReference: boolean;
  hasBankReference: boolean;
  truncationRisk: boolean;
  qualityScore: number;
}

export function TransactionDetailsModal({ transaction, opened, onClose }: TransactionDetailsModalProps) {

  // Show modal even if no transaction for debugging
  if (!opened) {
    return null;
  }

  // Handle case where modal is opened but no transaction
  if (!transaction) {
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title="No Transaction Selected"
        size="md"
        padding="md"
      >
        <Stack gap="md">
          <Alert color="red" variant="light">
            <Text>No transaction data available. Please try selecting a transaction again.</Text>
          </Alert>
          <Button onClick={onClose}>Close</Button>
        </Stack>
      </Modal>
    );
  }

  // Parse bank transaction code
  const bankCode = transaction.bankTransactionCode ? 
    bankCodeTranslator.parseCodeString(transaction.bankTransactionCode) : null;
  const codeExplanation: TransactionCodeExplanation = bankCode 
    ? bankCodeTranslator.translateCode(bankCode)
    : {
        type: 'Unknown Transaction Type',
        description: 'Unable to parse transaction code',
        businessMeaning: 'Transaction code format not recognized',
        commonScenarios: [],
        riskLevel: 'HIGH',
        reconciliationTips: ['Contact bank for transaction code clarification']
      };

  // Analyze remittance information quality
  const analyzeRemittanceInfo = (description: string): RemittanceAnalysis => {
    const hasInvoiceRef = /INV|INVOICE|REF|#\d+/.test(description.toUpperCase());
    const hasBankRef = /\d{8,}/.test(description); // Looking for reference numbers
    const truncationRisk = description.length >= 135; // Close to 140 char limit
    
    let completeness = 0;
    if (hasInvoiceRef) completeness += 40;
    if (hasBankRef) completeness += 30;
    if (description.length > 20) completeness += 20;
    if (!truncationRisk) completeness += 10;

    return {
      isStructured: false, // Would check if structured remittance info exists
      completeness,
      hasInvoiceReference: hasInvoiceRef,
      hasBankReference: hasBankRef,
      truncationRisk,
      qualityScore: Math.min(completeness, 100)
    };
  };

  const remittanceAnalysis = analyzeRemittanceInfo(transaction.description);

  // Calculate reconciliation confidence
  const calculateReconciliationConfidence = (): number => {
    let confidence = 50; // Base confidence
    
    if (remittanceAnalysis.hasInvoiceReference) confidence += 30;
    if (remittanceAnalysis.hasBankReference) confidence += 20;
    if (codeExplanation.riskLevel === 'LOW') confidence += 20;
    if (codeExplanation.riskLevel === 'HIGH') confidence -= 30;
    if (transaction.reconciliationStatus === 'MATCHED') confidence += 40;
    if (transaction.reconciliationStatus === 'EXCEPTION') confidence -= 40;
    
    return Math.max(0, Math.min(100, confidence));
  };

  const reconciliationConfidence = calculateReconciliationConfidence();

  // Get appropriate colors for risk levels
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'green';
      case 'MEDIUM': return 'yellow';
      case 'HIGH': return 'red';
      default: return 'gray';
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

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <Text fw={600} size="lg">Transaction Investigation</Text>
          <Badge color={getRiskColor(codeExplanation.riskLevel)} variant="light">
            {codeExplanation.riskLevel} Risk
          </Badge>
        </Group>
      }
      size="xl"
      padding="md"
      closeOnClickOutside={true}
      closeOnEscape={true}
      zIndex={10000}
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      transitionProps={{ transition: 'fade', duration: 200 }}
    >
      <Stack gap="md">
        {/* Transaction Overview Card */}
        <Card withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600} size="md">Transaction Overview</Text>
              <Badge color={getStatusColor(transaction.reconciliationStatus)} variant="filled">
                {transaction.reconciliationStatus}
              </Badge>
            </Group>
            
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Reference</Text>
                <Group gap="xs">
                  <Text fw={500}>{transaction.entryRef}</Text>
                  <CopyButton value={transaction.entryRef}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy reference'}>
                        <ActionIcon size="xs" onClick={copy}>
                          <IconCopy />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Amount</Text>
                <Text fw={600} size="lg" c={transaction.creditDebitIndicator === 'CRDT' ? 'green' : 'red'}>
                  {transaction.creditDebitIndicator === 'CRDT' ? '+' : '-'}
                  {transaction.amount.currency} {transaction.amount.original.toLocaleString()}
                </Text>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Date</Text>
                <Text fw={500}>{transaction.valueDate}</Text>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Counterparty</Text>
                <Text fw={500}>{transaction.counterparty.name}</Text>
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Bank Code Explanation Card */}
        <Card withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600} size="md">Transaction Type Analysis</Text>
              <IconInfoCircle size={20} color="blue" />
            </Group>
            
            <Alert color="blue" variant="light" icon={<IconInfoCircle size={16} />}>
              <Text fw={500}>{codeExplanation.type}</Text>
              <Text size="sm">{codeExplanation.description}</Text>
            </Alert>
            
            <Text size="sm" c="dimmed">Business Meaning</Text>
            <Text>{codeExplanation.businessMeaning}</Text>
            
            {codeExplanation.commonScenarios.length > 0 && (
              <>
                <Text size="sm" c="dimmed">Common Scenarios</Text>
                <List size="sm">
                  {codeExplanation.commonScenarios.slice(0, 3).map((scenario, index) => (
                    <List.Item key={index}>{scenario}</List.Item>
                  ))}
                </List>
              </>
            )}
          </Stack>
        </Card>

        {/* Remittance Information Analysis */}
        <Card withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600} size="md">Remittance Information Analysis</Text>
              <Badge color={remittanceAnalysis.qualityScore > 70 ? 'green' : remittanceAnalysis.qualityScore > 40 ? 'yellow' : 'red'}>
                Quality: {remittanceAnalysis.qualityScore}%
              </Badge>
            </Group>
            
            <Card bg="gray.0" p="sm">
              <Text size="sm" fw={500} mb="xs">Payment Description</Text>
              <Text ff="monospace" size="sm">{transaction.description}</Text>
            </Card>
            
            <Progress value={remittanceAnalysis.qualityScore} color={remittanceAnalysis.qualityScore > 70 ? 'green' : 'yellow'} />
            
            <Grid>
              <Grid.Col span={6}>
                <Group gap="xs">
                  {remittanceAnalysis.hasInvoiceReference ? (
                    <IconChecks size={16} color="green" />
                  ) : (
                    <IconX size={16} color="red" />
                  )}
                  <Text size="sm">Invoice Reference</Text>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Group gap="xs">
                  {remittanceAnalysis.hasBankReference ? (
                    <IconChecks size={16} color="green" />
                  ) : (
                    <IconX size={16} color="red" />
                  )}
                  <Text size="sm">Bank Reference</Text>
                </Group>
              </Grid.Col>
            </Grid>
            
            {remittanceAnalysis.truncationRisk && (
              <Alert color="orange" variant="light" icon={<IconAlertTriangle size={16} />}>
                <Text size="sm">
                  <strong>Truncation Risk:</strong> Description is near 140 character limit and may be cut off
                </Text>
              </Alert>
            )}
          </Stack>
        </Card>

        {/* FX Information (if applicable) */}
        {transaction.fxConversion && (
          <Card withBorder>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={600} size="md">Foreign Exchange Details</Text>
                <IconCurrencyEuro size={20} color="blue" />
              </Group>
              
              <Grid>
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed">Original Amount</Text>
                  <Text fw={500}>
                    {transaction.fxConversion.fromCurrency} {transaction.amount.original.toLocaleString()}
                  </Text>
                </Grid.Col>
                
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed">Exchange Rate</Text>
                  <Text fw={500}>{transaction.fxConversion.rate}</Text>
                </Grid.Col>
                
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed">Converted Amount</Text>
                  <Text fw={500}>
                    {transaction.fxConversion.toCurrency} {transaction.fxConversion.convertedAmount.toLocaleString()}
                  </Text>
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <Group gap="xs">
                    <Badge color="blue" variant="light">
                      Rate Date: {transaction.fxConversion.rateDate}
                    </Badge>
                    <Badge color="green" variant="light">
                      Confidence: {transaction.fxConversion.confidence}%
                    </Badge>
                  </Group>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>
        )}

        {/* Reconciliation Guidance */}
        <Card withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600} size="md">Reconciliation Guidance</Text>
              <Badge color={reconciliationConfidence > 70 ? 'green' : reconciliationConfidence > 40 ? 'yellow' : 'red'}>
                Confidence: {reconciliationConfidence}%
              </Badge>
            </Group>
            
            <Text size="sm" c="dimmed">Recommended Actions</Text>
            <List size="sm">
              {codeExplanation.reconciliationTips.map((tip, index) => (
                <List.Item key={index}>{tip}</List.Item>
              ))}
            </List>
            
            {reconciliationConfidence < 50 && (
              <Alert color="red" variant="light" icon={<IconAlertTriangle size={16} />}>
                <Text size="sm">
                  <strong>Low Reconciliation Confidence:</strong> This transaction may require manual investigation
                </Text>
              </Alert>
            )}
          </Stack>
        </Card>

        {/* Action Buttons */}
        <Group justify="flex-end" gap="sm">
          <Button 
            variant="light" 
            leftSection={<IconExternalLink size={16} />}
            onClick={() => {
              // Would open external system or detailed view
              console.log('Open in external system');
            }}
          >
            Open in Core System
          </Button>
          
          <Button 
            variant="light" 
            leftSection={<IconBuilding size={16} />}
            onClick={() => {
              // Would contact relationship manager
              console.log('Contact RM');
            }}
          >
            Contact RM
          </Button>
          
          <Button onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}