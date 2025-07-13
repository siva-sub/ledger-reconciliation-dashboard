import { useMemo } from 'react';
import {
  Card,
  Text,
  Group,
  Badge,
  Progress,
  Stack,
  Grid,
  Alert,
  ActionIcon,
  Tooltip,
  RingProgress,
  Center,
  ThemeIcon,
  Timeline
} from '@mantine/core';
import {
  IconShield,
  IconAlertTriangle,
  IconChecks,
  IconX,
  IconClock,
  IconTrendingUp,
  IconTrendingDown,
  IconInfoCircle,
  IconTarget,
  IconReport,
  IconEye
} from '@tabler/icons-react';
import { FinancialTransaction } from '@/types';

interface DataQualityMetric {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  impact: 'high' | 'medium' | 'low';
  trend: 'improving' | 'stable' | 'declining';
  description: string;
  issues: string[];
  recommendations: string[];
}

interface DataQualityScorecard {
  overallScore: number;
  metrics: DataQualityMetric[];
  summary: {
    excellentCount: number;
    goodCount: number;
    warningCount: number;
    criticalCount: number;
  };
  actionItems: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    estimatedImpact: string;
  }>;
}

interface DataQualityScorecardProps {
  transactions: FinancialTransaction[];
}

export function DataQualityScorecard({ transactions }: DataQualityScorecardProps) {
  const qualityAssessment = useMemo((): DataQualityScorecard => {
    if (!transactions.length) {
      return {
        overallScore: 0,
        metrics: [],
        summary: { excellentCount: 0, goodCount: 0, warningCount: 0, criticalCount: 0 },
        actionItems: []
      };
    }

    const metrics: DataQualityMetric[] = [];

    // 1. Transaction Reference Completeness
    const transactionsWithRefs = transactions.filter(t => 
      t.entryRef && t.entryRef.trim().length > 0
    );
    const refCompletenessScore = (transactionsWithRefs.length / transactions.length) * 100;
    
    metrics.push({
      name: 'Transaction Reference Quality',
      score: refCompletenessScore,
      status: refCompletenessScore >= 95 ? 'excellent' : refCompletenessScore >= 85 ? 'good' : refCompletenessScore >= 70 ? 'warning' : 'critical',
      impact: 'high',
      trend: 'stable',
      description: 'Percentage of transactions with complete and valid reference numbers',
      issues: refCompletenessScore < 95 ? [`${(100 - refCompletenessScore).toFixed(1)}% of transactions missing or have incomplete references`] : [],
      recommendations: refCompletenessScore < 95 ? [
        'Implement reference validation at data ingestion point',
        'Work with counterparties to ensure proper reference formatting',
        'Create automated reference generation for internal transactions'
      ] : ['Maintain current reference standards']
    });

    // 2. Remittance Information Quality
    const transactionsWithGoodRemittance = transactions.filter(t => {
      const desc = t.description?.trim() || '';
      const hasInvoiceRef = /INV|INVOICE|REF|#\d+/.test(desc.toUpperCase());
      const hasStructuredInfo = desc.length > 20;
      const notTruncated = desc.length < 135;
      return hasInvoiceRef && hasStructuredInfo && notTruncated;
    });
    const remittanceScore = (transactionsWithGoodRemittance.length / transactions.length) * 100;

    metrics.push({
      name: 'Remittance Information Quality',
      score: remittanceScore,
      status: remittanceScore >= 80 ? 'excellent' : remittanceScore >= 60 ? 'good' : remittanceScore >= 40 ? 'warning' : 'critical',
      impact: 'high',
      trend: 'improving',
      description: 'Quality of payment description and remittance information for reconciliation',
      issues: remittanceScore < 80 ? [
        `${(100 - remittanceScore).toFixed(1)}% of transactions have poor remittance information`,
        'Missing invoice references in payment descriptions',
        'Truncated payment descriptions due to field length limits'
      ] : [],
      recommendations: [
        'Educate counterparties on proper payment reference formats',
        'Implement structured remittance information (ISO 20022)',
        'Increase field length limits where possible'
      ]
    });

    // 3. Counterparty Data Consistency
    const counterpartyMap = new Map<string, Set<string>>();
    transactions.forEach(t => {
      if (!counterpartyMap.has(t.counterparty.name)) {
        counterpartyMap.set(t.counterparty.name, new Set());
      }
      if (t.counterparty.account) {
        counterpartyMap.get(t.counterparty.name)!.add(t.counterparty.account);
      }
    });

    const inconsistentCounterparties = Array.from(counterpartyMap.entries())
      .filter(([, accounts]) => accounts.size > 1);
    const counterpartyScore = Math.max(0, 100 - (inconsistentCounterparties.length / counterpartyMap.size) * 100);

    metrics.push({
      name: 'Counterparty Data Consistency',
      score: counterpartyScore,
      status: counterpartyScore >= 90 ? 'excellent' : counterpartyScore >= 75 ? 'good' : counterpartyScore >= 60 ? 'warning' : 'critical',
      impact: 'medium',
      trend: 'stable',
      description: 'Consistency of counterparty names and account information',
      issues: inconsistentCounterparties.length > 0 ? [
        `${inconsistentCounterparties.length} counterparties have multiple account numbers`,
        'Potential duplicate counterparty entries with slight name variations'
      ] : [],
      recommendations: [
        'Implement counterparty master data management',
        'Create counterparty de-duplication rules',
        'Standardize counterparty name formats'
      ]
    });

    // 4. Currency and Amount Validation
    const invalidAmounts = transactions.filter(t => 
      t.amount.original <= 0 || 
      !t.amount.currency || 
      t.amount.currency.length !== 3
    );
    const amountValidationScore = Math.max(0, 100 - (invalidAmounts.length / transactions.length) * 100);

    metrics.push({
      name: 'Amount & Currency Validation',
      score: amountValidationScore,
      status: amountValidationScore >= 99 ? 'excellent' : amountValidationScore >= 95 ? 'good' : amountValidationScore >= 90 ? 'warning' : 'critical',
      impact: 'high',
      trend: 'stable',
      description: 'Validity of transaction amounts and currency codes',
      issues: invalidAmounts.length > 0 ? [
        `${invalidAmounts.length} transactions with invalid amounts or currency codes`,
        'Zero or negative amounts detected',
        'Invalid ISO currency codes'
      ] : [],
      recommendations: invalidAmounts.length > 0 ? [
        'Implement amount validation at source system',
        'Validate ISO 4217 currency codes',
        'Set up alerts for unusual amount patterns'
      ] : ['Maintain current validation standards']
    });

    // 5. Date Consistency and Timeliness
    const now = new Date();
    const futureTransactions = transactions.filter(t => new Date(t.valueDate) > now);
    const oldTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.valueDate);
      const daysDiff = (now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 90; // Transactions older than 90 days
    });
    
    const dateIssues = futureTransactions.length + oldTransactions.length;
    const dateScore = Math.max(0, 100 - (dateIssues / transactions.length) * 100);

    metrics.push({
      name: 'Date Consistency & Timeliness',
      score: dateScore,
      status: dateScore >= 95 ? 'excellent' : dateScore >= 85 ? 'good' : dateScore >= 70 ? 'warning' : 'critical',
      impact: 'medium',
      trend: 'stable',
      description: 'Consistency and reasonableness of transaction dates',
      issues: [
        ...(futureTransactions.length > 0 ? [`${futureTransactions.length} transactions with future dates`] : []),
        ...(oldTransactions.length > 0 ? [`${oldTransactions.length} transactions older than 90 days`] : [])
      ],
      recommendations: [
        'Implement date validation rules',
        'Set up alerts for future-dated transactions',
        'Review historical transaction processing delays'
      ]
    });

    // 6. Reconciliation Success Rate
    const matchedTransactions = transactions.filter(t => t.reconciliationStatus === 'MATCHED');
    const reconciliationScore = (matchedTransactions.length / transactions.length) * 100;

    metrics.push({
      name: 'Reconciliation Success Rate',
      score: reconciliationScore,
      status: reconciliationScore >= 90 ? 'excellent' : reconciliationScore >= 80 ? 'good' : reconciliationScore >= 70 ? 'warning' : 'critical',
      impact: 'high',
      trend: 'improving',
      description: 'Percentage of transactions successfully reconciled automatically',
      issues: reconciliationScore < 90 ? [
        `${(100 - reconciliationScore).toFixed(1)}% of transactions require manual reconciliation`,
        'High exception rates increase operational costs'
      ] : [],
      recommendations: [
        'Improve automatic matching algorithms',
        'Enhance reference data quality',
        'Implement machine learning for pattern recognition'
      ]
    });

    // Calculate overall score
    const overallScore = metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length;

    // Summary counts
    const summary = metrics.reduce((acc, metric) => {
      acc[`${metric.status}Count`]++;
      return acc;
    }, { excellentCount: 0, goodCount: 0, warningCount: 0, criticalCount: 0 } as { excellentCount: number; goodCount: number; warningCount: number; criticalCount: number });

    // Generate action items
    const actionItems = [];
    
    if (refCompletenessScore < 90) {
      actionItems.push({
        priority: 'high' as const,
        title: 'Improve Transaction Reference Quality',
        description: 'Implement validation and standards for transaction references',
        estimatedImpact: 'Reduce reconciliation time by 30%'
      });
    }

    if (remittanceScore < 70) {
      actionItems.push({
        priority: 'high' as const,
        title: 'Enhance Remittance Information Standards',
        description: 'Work with counterparties to improve payment descriptions',
        estimatedImpact: 'Improve automatic matching by 25%'
      });
    }

    if (reconciliationScore < 85) {
      actionItems.push({
        priority: 'medium' as const,
        title: 'Optimize Reconciliation Algorithms',
        description: 'Implement advanced matching logic and machine learning',
        estimatedImpact: 'Reduce manual intervention by 40%'
      });
    }

    return {
      overallScore,
      metrics,
      summary,
      actionItems: actionItems.slice(0, 5) // Top 5 action items
    };
  }, [transactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <IconChecks size={16} />;
      case 'good': return <IconTarget size={16} />;
      case 'warning': return <IconAlertTriangle size={16} />;
      case 'critical': return <IconX size={16} />;
      default: return <IconInfoCircle size={16} />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <IconTrendingUp size={14} color="green" />;
      case 'declining': return <IconTrendingDown size={14} color="red" />;
      default: return <IconClock size={14} color="gray" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <Stack gap="md">
      {/* Overall Score Header */}
      <Card withBorder p="lg">
        <Group justify="space-between" align="center">
          <div>
            <Group align="center" gap="sm">
              <ThemeIcon 
                size="xl" 
                color={qualityAssessment.overallScore >= 85 ? 'green' : qualityAssessment.overallScore >= 70 ? 'yellow' : 'red'}
                variant="light"
              >
                <IconShield size={24} />
              </ThemeIcon>
              <div>
                <Text size="lg" fw={700}>Data Quality Scorecard</Text>
                <Text size="sm" c="dimmed">Comprehensive assessment of financial data integrity</Text>
              </div>
            </Group>
          </div>
          
          <Group align="center" gap="xl">
            <div style={{ textAlign: 'center' }}>
              <RingProgress
                size={120}
                thickness={12}
                sections={[
                  { 
                    value: qualityAssessment.overallScore, 
                    color: qualityAssessment.overallScore >= 85 ? 'green' : qualityAssessment.overallScore >= 70 ? 'yellow' : 'red'
                  }
                ]}
                label={
                  <Center>
                    <Text size="xl" fw={700}>
                      {qualityAssessment.overallScore.toFixed(0)}
                    </Text>
                  </Center>
                }
              />
              <Text size="sm" c="dimmed" mt="xs">Overall Score</Text>
            </div>
            
            <Stack gap="xs">
              <Group gap="sm">
                <Badge color="green" variant="light">{qualityAssessment.summary.excellentCount} Excellent</Badge>
                <Badge color="blue" variant="light">{qualityAssessment.summary.goodCount} Good</Badge>
              </Group>
              <Group gap="sm">
                <Badge color="yellow" variant="light">{qualityAssessment.summary.warningCount} Warning</Badge>
                <Badge color="red" variant="light">{qualityAssessment.summary.criticalCount} Critical</Badge>
              </Group>
            </Stack>
          </Group>
        </Group>
      </Card>

      {/* Metrics Grid */}
      <Grid>
        {qualityAssessment.metrics.map((metric, index) => (
          <Grid.Col key={index} span={{ base: 12, md: 6 }}>
            <Card withBorder p="md" h="100%">
              <Group justify="space-between" mb="sm">
                <Group gap="xs">
                  <ThemeIcon color={getStatusColor(metric.status)} variant="light" size="sm">
                    {getStatusIcon(metric.status)}
                  </ThemeIcon>
                  <Text fw={600} size="sm">{metric.name}</Text>
                </Group>
                <Group gap="xs">
                  {getTrendIcon(metric.trend)}
                  <Badge color={getStatusColor(metric.status)} variant="light" size="sm">
                    {metric.score.toFixed(1)}%
                  </Badge>
                </Group>
              </Group>
              
              <Progress 
                value={metric.score} 
                color={getStatusColor(metric.status)} 
                size="md" 
                mb="sm"
              />
              
              <Text size="xs" c="dimmed" mb="sm">{metric.description}</Text>
              
              {metric.issues.length > 0 && (
                <Alert color="orange" variant="light" p="xs" mb="sm">
                  <Text size="xs" fw={500} mb="xs">Issues Identified:</Text>
                  {metric.issues.map((issue, i) => (
                    <Text key={i} size="xs">• {issue}</Text>
                  ))}
                </Alert>
              )}
              
              <Group justify="space-between" mt="auto">
                <Badge color="gray" variant="light" size="xs">
                  {metric.impact.toUpperCase()} IMPACT
                </Badge>
                <Tooltip label="View recommendations">
                  <ActionIcon variant="light" size="sm">
                    <IconEye size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Action Items */}
      {qualityAssessment.actionItems.length > 0 && (
        <Card withBorder p="md">
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <ThemeIcon color="blue" variant="light" size="sm">
                <IconReport size={16} />
              </ThemeIcon>
              <Text fw={600} size="md">Priority Action Items</Text>
            </Group>
            <Badge color="blue" variant="light">
              {qualityAssessment.actionItems.length} items
            </Badge>
          </Group>
          
          <Timeline active={-1} bulletSize={24} lineWidth={2}>
            {qualityAssessment.actionItems.map((item, index) => (
              <Timeline.Item
                key={index}
                bullet={
                  <ThemeIcon color={getPriorityColor(item.priority)} variant="light" size="sm">
                    <IconTarget size={12} />
                  </ThemeIcon>
                }
                title={
                  <Group gap="xs">
                    <Text fw={500} size="sm">{item.title}</Text>
                    <Badge color={getPriorityColor(item.priority)} variant="light" size="xs">
                      {item.priority.toUpperCase()}
                    </Badge>
                  </Group>
                }
              >
                <Text size="xs" c="dimmed" mb="xs">{item.description}</Text>
                <Text size="xs" fw={500} c="blue">Expected Impact: {item.estimatedImpact}</Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {/* Recommendations Summary */}
      <Alert color="blue" variant="light">
        <Group gap="xs" mb="xs">
          <IconInfoCircle size={16} />
          <Text fw={500} size="sm">Data Quality Insights</Text>
        </Group>
        <Text size="sm">
          {qualityAssessment.overallScore >= 85 
            ? "Excellent data quality standards maintained. Continue monitoring and implement minor optimizations."
            : qualityAssessment.overallScore >= 70
            ? "Good data quality with room for improvement. Focus on critical issues first for maximum impact."
            : "Data quality issues require immediate attention. Prioritize high-impact improvements to reduce operational risks."
          }
        </Text>
      </Alert>
    </Stack>
  );
}