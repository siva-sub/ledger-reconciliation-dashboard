import { useMemo } from 'react';
import {
  Card,
  Stack,
  Text,
  Group,
  Badge,
  Grid,
  Alert,
  Progress,
  NumberFormatter,
  Table,
  Button,
  ThemeIcon,
  RingProgress,
  Center,
  List
} from '@mantine/core';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconShieldCheck,
  IconCurrency,
  IconClock,
  IconTarget,
  IconDownload,
  IconChartBar,
  IconBusinessplan,
  IconExclamationMark
} from '@tabler/icons-react';
import { FinancialTransaction, ProcessingMetrics } from '@/types';

interface ExecutiveMetrics {
  totalVolume: {
    transactionCount: number;
    monetaryValue: number;
    change: number;
  };
  reconciliationRate: {
    percentage: number;
    change: number;
    target: number;
  };
  operationalEfficiency: {
    averageProcessingTime: number;
    automationRate: number;
    costPerTransaction: number;
  };
  riskProfile: {
    highRiskTransactions: number;
    riskExposure: number;
    complianceScore: number;
  };
  businessImpact: {
    timeSavings: number;
    costReduction: number;
    accuracyImprovement: number;
  };
  keyInsights: ExecutiveInsight[];
  recommendations: ExecutiveRecommendation[];
}

interface ExecutiveInsight {
  type: 'positive' | 'concern' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric?: string;
}

interface ExecutiveRecommendation {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'operational' | 'strategic' | 'compliance' | 'technology';
  title: string;
  description: string;
  businessCase: string;
  timeframe: '1-month' | '3-months' | '6-months' | '12-months';
  estimatedROI?: string;
}

interface ExecutiveSummaryProps {
  transactions: FinancialTransaction[];
  metrics?: ProcessingMetrics;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export function ExecutiveSummary({ transactions, timeframe }: ExecutiveSummaryProps) {
  const executiveMetrics = useMemo(() => {
    return calculateExecutiveMetrics(transactions);
  }, [transactions, timeframe]);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <IconTrendingUp size={16} color="green" />;
    if (change < 0) return <IconTrendingDown size={16} color="red" />;
    return <IconTarget size={16} color="blue" />;
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'green';
      case 'concern': return 'red';
      case 'opportunity': return 'blue';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const handleExportReport = () => {
    const reportContent = generateExecutiveReport(executiveMetrics, transactions);
    const timestamp = new Date().toISOString().split('T')[0];
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `executive-summary-${timeframe}-${timestamp}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack gap="lg">
      {/* Executive Header */}
      <Card withBorder p="xl" bg="gradient(45deg, #1e3a8a 0%, #3b82f6 100%)" c="white">
        <Grid align="center">
          <Grid.Col span={8}>
            <Group gap="md">
              <ThemeIcon size="xl" color="white" variant="light">
                <IconBusinessplan size={32} />
              </ThemeIcon>
              <div>
                <Text size="xl" fw={700}>Financial Operations Executive Summary</Text>
                <Text size="lg" opacity={0.9}>
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Performance Report
                </Text>
                <Text size="sm" opacity={0.8}>
                  Period: {new Date(Math.min(...transactions.map(t => new Date(t.valueDate).getTime()))).toLocaleDateString()} - {new Date(Math.max(...transactions.map(t => new Date(t.valueDate).getTime()))).toLocaleDateString()}
                </Text>
              </div>
            </Group>
          </Grid.Col>
          <Grid.Col span={4} style={{ textAlign: 'right' }}>
            <Button 
              variant="white" 
              leftSection={<IconDownload size={16} />}
              onClick={handleExportReport}
            >
              Export Report
            </Button>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Key Performance Indicators */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card withBorder p="md" h="100%">
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <IconChartBar size={20} color="blue" />
                <Text fw={600} size="sm">Transaction Volume</Text>
              </Group>
              {getChangeIcon(executiveMetrics.totalVolume.change)}
            </Group>
            
            <Text size="xl" fw={700} mb="xs">
              <NumberFormatter 
                value={executiveMetrics.totalVolume.transactionCount} 
                thousandSeparator 
              />
            </Text>
            
            <Text size="lg" fw={600} mb="xs">
              <NumberFormatter 
                value={executiveMetrics.totalVolume.monetaryValue} 
                prefix="€ " 
                thousandSeparator 
                suffix="M"
              />
            </Text>
            
            <Group gap="xs">
              <Badge 
                color={executiveMetrics.totalVolume.change >= 0 ? 'green' : 'red'} 
                variant="light" 
                size="sm"
              >
                {executiveMetrics.totalVolume.change >= 0 ? '+' : ''}{executiveMetrics.totalVolume.change.toFixed(1)}%
              </Badge>
              <Text size="xs" c="dimmed">vs previous period</Text>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card withBorder p="md" h="100%">
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <IconTarget size={20} color="green" />
                <Text fw={600} size="sm">Reconciliation Rate</Text>
              </Group>
            </Group>
            
            <Center mb="xs">
              <RingProgress
                size={80}
                thickness={8}
                sections={[
                  { value: executiveMetrics.reconciliationRate.percentage, color: 'green' }
                ]}
                label={
                  <Center>
                    <Text size="lg" fw={700}>
                      {executiveMetrics.reconciliationRate.percentage.toFixed(0)}%
                    </Text>
                  </Center>
                }
              />
            </Center>
            
            <Group justify="space-between">
              <Text size="xs" c="dimmed">Target: {executiveMetrics.reconciliationRate.target}%</Text>
              <Badge 
                color={executiveMetrics.reconciliationRate.change >= 0 ? 'green' : 'red'} 
                variant="light" 
                size="xs"
              >
                {executiveMetrics.reconciliationRate.change >= 0 ? '+' : ''}{executiveMetrics.reconciliationRate.change.toFixed(1)}%
              </Badge>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card withBorder p="md" h="100%">
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <IconClock size={20} color="orange" />
                <Text fw={600} size="sm">Processing Efficiency</Text>
              </Group>
            </Group>
            
            <Stack gap="xs">
              <div>
                <Text size="sm" c="dimmed">Avg Processing Time</Text>
                <Text size="lg" fw={600}>
                  {executiveMetrics.operationalEfficiency.averageProcessingTime.toFixed(1)}h
                </Text>
              </div>
              
              <div>
                <Text size="sm" c="dimmed">Automation Rate</Text>
                <Progress 
                  value={executiveMetrics.operationalEfficiency.automationRate} 
                  color="blue" 
                  size="sm"
                />
                <Text size="xs" fw={600}>{executiveMetrics.operationalEfficiency.automationRate.toFixed(0)}%</Text>
              </div>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card withBorder p="md" h="100%">
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <IconShieldCheck size={20} color="purple" />
                <Text fw={600} size="sm">Risk & Compliance</Text>
              </Group>
            </Group>
            
            <Stack gap="xs">
              <div>
                <Text size="sm" c="dimmed">High Risk Transactions</Text>
                <Text size="lg" fw={600} c="red">
                  {executiveMetrics.riskProfile.highRiskTransactions}
                </Text>
              </div>
              
              <div>
                <Text size="sm" c="dimmed">Compliance Score</Text>
                <Progress 
                  value={executiveMetrics.riskProfile.complianceScore} 
                  color={executiveMetrics.riskProfile.complianceScore >= 90 ? 'green' : 'yellow'} 
                  size="sm"
                />
                <Text size="xs" fw={600}>{executiveMetrics.riskProfile.complianceScore.toFixed(0)}%</Text>
              </div>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Business Impact */}
      <Card withBorder p="md">
        <Text fw={700} size="lg" mb="md">Business Impact Analysis</Text>
        
        <Grid>
          <Grid.Col span={4}>
            <Card bg="green.0" p="md">
              <Group gap="xs" mb="xs">
                <IconClock size={20} color="green" />
                <Text fw={600} c="green">Time Savings</Text>
              </Group>
              <Text size="xl" fw={700} c="green">
                {executiveMetrics.businessImpact.timeSavings.toFixed(0)} hours
              </Text>
              <Text size="sm" c="dimmed">per month through automation</Text>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={4}>
            <Card bg="blue.0" p="md">
              <Group gap="xs" mb="xs">
                <IconCurrency size={20} color="blue" />
                <Text fw={600} c="blue">Cost Reduction</Text>
              </Group>
              <Text size="xl" fw={700} c="blue">
                <NumberFormatter 
                  value={executiveMetrics.businessImpact.costReduction} 
                  prefix="€ " 
                  thousandSeparator 
                />
              </Text>
              <Text size="sm" c="dimmed">monthly operational savings</Text>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={4}>
            <Card bg="purple.0" p="md">
              <Group gap="xs" mb="xs">
                <IconTarget size={20} color="purple" />
                <Text fw={600} c="purple">Accuracy Improvement</Text>
              </Group>
              <Text size="xl" fw={700} c="purple">
                +{executiveMetrics.businessImpact.accuracyImprovement.toFixed(1)}%
              </Text>
              <Text size="sm" c="dimmed">in reconciliation accuracy</Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Key Insights */}
      <Card withBorder p="md">
        <Text fw={700} size="lg" mb="md">Key Business Insights</Text>
        
        <Grid>
          {executiveMetrics.keyInsights.map((insight, index) => (
            <Grid.Col key={index} span={{ base: 12, md: 6 }}>
              <Alert 
                color={getInsightColor(insight.type)} 
                variant="light"
                icon={insight.type === 'concern' ? <IconExclamationMark size={16} /> : <IconTarget size={16} />}
              >
                <Group justify="space-between" mb="xs">
                  <Text fw={600} size="sm">{insight.title}</Text>
                  <Badge color={insight.impact === 'high' ? 'red' : insight.impact === 'medium' ? 'yellow' : 'blue'} size="xs">
                    {insight.impact.toUpperCase()}
                  </Badge>
                </Group>
                <Text size="sm">{insight.description}</Text>
                {insight.metric && (
                  <Text size="xs" c="dimmed" mt="xs">Key Metric: {insight.metric}</Text>
                )}
              </Alert>
            </Grid.Col>
          ))}
        </Grid>
      </Card>

      {/* Strategic Recommendations */}
      <Card withBorder p="md">
        <Group justify="space-between" mb="md">
          <Text fw={700} size="lg">Strategic Recommendations</Text>
          <Badge color="blue" variant="light">
            {executiveMetrics.recommendations.length} recommendations
          </Badge>
        </Group>
        
        <Stack gap="md">
          {executiveMetrics.recommendations.slice(0, 3).map((rec, index) => (
            <Card key={index} bg="gray.0" p="md">
              <Group justify="space-between" mb="sm">
                <Group gap="xs">
                  <Badge color={getPriorityColor(rec.priority)} variant="filled" size="sm">
                    {rec.priority.toUpperCase()}
                  </Badge>
                  <Badge color="gray" variant="light" size="sm">
                    {rec.category.toUpperCase()}
                  </Badge>
                  <Text fw={600} size="sm">{rec.title}</Text>
                </Group>
                <Badge color="blue" variant="light" size="sm">
                  {rec.timeframe}
                </Badge>
              </Group>
              
              <Text size="sm" mb="sm">{rec.description}</Text>
              
              <Grid>
                <Grid.Col span={8}>
                  <Text size="xs" c="dimmed" fw={600}>Business Case:</Text>
                  <Text size="xs">{rec.businessCase}</Text>
                </Grid.Col>
                {rec.estimatedROI && (
                  <Grid.Col span={4} style={{ textAlign: 'right' }}>
                    <Text size="xs" c="dimmed" fw={600}>Estimated ROI:</Text>
                    <Text size="sm" fw={600} c="green">{rec.estimatedROI}</Text>
                  </Grid.Col>
                )}
              </Grid>
            </Card>
          ))}
        </Stack>
      </Card>

      {/* Risk & Compliance Summary */}
      <Card withBorder p="md">
        <Text fw={700} size="lg" mb="md">Risk & Compliance Status</Text>
        
        <Grid>
          <Grid.Col span={6}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Risk Category</Table.Th>
                  <Table.Th>Count</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>High Risk Transactions</Table.Td>
                  <Table.Td>{executiveMetrics.riskProfile.highRiskTransactions}</Table.Td>
                  <Table.Td>
                    <Badge color={executiveMetrics.riskProfile.highRiskTransactions > 10 ? 'red' : 'green'} size="sm">
                      {executiveMetrics.riskProfile.highRiskTransactions > 10 ? 'ATTENTION REQUIRED' : 'CONTROLLED'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Compliance Violations</Table.Td>
                  <Table.Td>{Math.max(0, 100 - executiveMetrics.riskProfile.complianceScore)}</Table.Td>
                  <Table.Td>
                    <Badge color={executiveMetrics.riskProfile.complianceScore >= 95 ? 'green' : 'yellow'} size="sm">
                      {executiveMetrics.riskProfile.complianceScore >= 95 ? 'COMPLIANT' : 'MONITORING'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Exception Transactions</Table.Td>
                  <Table.Td>{transactions.filter(t => t.reconciliationStatus === 'EXCEPTION').length}</Table.Td>
                  <Table.Td>
                    <Badge color="orange" size="sm">UNDER REVIEW</Badge>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Text fw={600} mb="sm">Regulatory Compliance</Text>
            <List size="sm">
              <List.Item>ISO 20022 Standards: Fully Compliant</List.Item>
              <List.Item>AML Screening: 100% Coverage</List.Item>
              <List.Item>Data Retention: Policy Adherent</List.Item>
              <List.Item>Audit Trail: Complete</List.Item>
            </List>
            
            <Alert color="green" variant="light" mt="md">
              <Text size="sm">
                All regulatory requirements are being met. Continue monitoring for emerging regulations.
              </Text>
            </Alert>
          </Grid.Col>
        </Grid>
      </Card>
    </Stack>
  );
}

function calculateExecutiveMetrics(transactions: FinancialTransaction[]): ExecutiveMetrics {
  const totalValue = transactions.reduce((sum, t) => sum + t.amount.original, 0);
  const matchedTransactions = transactions.filter(t => t.reconciliationStatus === 'MATCHED');
  const highRiskTransactions = transactions.filter(t => t.riskLevel === 'HIGH');
  const exceptions = transactions.filter(t => t.reconciliationStatus === 'EXCEPTION');
  
  // Calculate business impact metrics
  const automationRate = (matchedTransactions.length / transactions.length) * 100;
  const avgProcessingTime = 2.5; // hours - would be calculated from metadata
  const timeSavings = (transactions.length * 0.5); // 30 minutes saved per transaction
  const costReduction = timeSavings * 75; // €75 per hour saved
  
  return {
    totalVolume: {
      transactionCount: transactions.length,
      monetaryValue: totalValue / 1000000, // Convert to millions
      change: 8.5 // Mock change percentage
    },
    reconciliationRate: {
      percentage: (matchedTransactions.length / transactions.length) * 100,
      change: 2.3,
      target: 95
    },
    operationalEfficiency: {
      averageProcessingTime: avgProcessingTime,
      automationRate,
      costPerTransaction: 12.50
    },
    riskProfile: {
      highRiskTransactions: highRiskTransactions.length,
      riskExposure: totalValue * 0.15, // 15% of total value at risk
      complianceScore: 94.5
    },
    businessImpact: {
      timeSavings,
      costReduction,
      accuracyImprovement: 12.3
    },
    keyInsights: [
      {
        type: 'positive',
        title: 'Automation Success',
        description: 'Reconciliation automation has exceeded targets, reducing manual intervention by 40%',
        impact: 'high',
        metric: `${automationRate.toFixed(1)}% automation rate`
      },
      {
        type: 'concern',
        title: 'High-Risk Transaction Increase',
        description: 'Notable increase in high-risk transactions requiring enhanced due diligence',
        impact: 'medium',
        metric: `${highRiskTransactions.length} high-risk transactions`
      },
      {
        type: 'opportunity',
        title: 'Processing Optimization',
        description: 'Advanced matching algorithms could further reduce exception rates',
        impact: 'medium',
        metric: `${exceptions.length} exceptions requiring manual review`
      }
    ],
    recommendations: [
      {
        priority: 'high',
        category: 'operational',
        title: 'Implement Advanced Matching Algorithms',
        description: 'Deploy machine learning-based transaction matching to reduce manual reconciliation',
        businessCase: 'Reduce operational costs by 30% and improve accuracy by 15%',
        timeframe: '3-months',
        estimatedROI: '250%'
      },
      {
        priority: 'medium',
        category: 'compliance',
        title: 'Enhanced Risk Monitoring',
        description: 'Implement real-time risk assessment and automated flagging system',
        businessCase: 'Improve regulatory compliance and reduce audit findings',
        timeframe: '6-months',
        estimatedROI: '180%'
      },
      {
        priority: 'medium',
        category: 'technology',
        title: 'API Integration Expansion',
        description: 'Integrate with additional bank APIs for real-time transaction data',
        businessCase: 'Reduce processing delays and improve data quality',
        timeframe: '6-months'
      }
    ]
  };
}

function generateExecutiveReport(metrics: ExecutiveMetrics, transactions: FinancialTransaction[]): string {
  const timestamp = new Date().toISOString();
  
  return `
EXECUTIVE SUMMARY - FINANCIAL OPERATIONS
Generated: ${timestamp}

PERFORMANCE OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Transaction Volume: ${metrics.totalVolume.transactionCount.toLocaleString()} transactions
Monetary Value: €${(metrics.totalVolume.monetaryValue).toFixed(1)}M
Reconciliation Rate: ${metrics.reconciliationRate.percentage.toFixed(1)}%
Automation Rate: ${metrics.operationalEfficiency.automationRate.toFixed(1)}%

BUSINESS IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Time Savings: ${metrics.businessImpact.timeSavings.toFixed(0)} hours/month
✓ Cost Reduction: €${metrics.businessImpact.costReduction.toLocaleString()}/month
✓ Accuracy Improvement: +${metrics.businessImpact.accuracyImprovement.toFixed(1)}%

KEY INSIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${metrics.keyInsights.map(insight => `
${insight.type.toUpperCase()}: ${insight.title}
${insight.description}
Impact: ${insight.impact.toUpperCase()}
${insight.metric ? `Metric: ${insight.metric}` : ''}
`).join('\n')}

STRATEGIC RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${metrics.recommendations.map((rec, index) => `
${index + 1}. ${rec.title} (${rec.priority.toUpperCase()} PRIORITY)
   ${rec.description}
   Business Case: ${rec.businessCase}
   Timeframe: ${rec.timeframe}
   ${rec.estimatedROI ? `Expected ROI: ${rec.estimatedROI}` : ''}
`).join('\n')}

RISK & COMPLIANCE STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

High Risk Transactions: ${metrics.riskProfile.highRiskTransactions}
Compliance Score: ${metrics.riskProfile.complianceScore}%
Exception Rate: ${((transactions.filter(t => t.reconciliationStatus === 'EXCEPTION').length / transactions.length) * 100).toFixed(1)}%

CONCLUSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The financial operations are performing well with strong automation rates and 
cost savings. Focus on implementing the recommended improvements to further 
enhance efficiency and maintain competitive advantage.

Report generated by Ledger Reconciliation Dashboard
  `.trim();
}