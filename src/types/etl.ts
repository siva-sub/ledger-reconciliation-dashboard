import { RiskLevel, TransactionCategory, CurrencyCode, CurrencyMetrics } from './financial';

export interface ETLPipelineData {
  id: string;
  name: string;
  status: PipelineStatus;
  steps: ETLStep[];
  metrics: ProcessingMetrics;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface ETLStep {
  id: string;
  name: string;
  type: StepType;
  status: StepStatus;
  inputCount: number;
  outputCount: number;
  errorCount: number;
  duration: number;
  details: StepDetails;
  subSteps?: ETLSubStep[];
}

export interface ETLSubStep {
  id: string;
  name: string;
  status: StepStatus;
  duration: number;
  details: string;
}

export interface StepDetails {
  description: string;
  inputFormat: string;
  outputFormat: string;
  transformationRules: string[];
  validationRules: string[];
  errorMessages: string[];
}

export interface ProcessingMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  foreignCurrencyCount: number;
  successfulConversions: number;
  failedConversions: number;
  riskDistribution: Record<RiskLevel, number>;
  categoryDistribution: Record<TransactionCategory, number>;
  currencyDistribution: Record<CurrencyCode, CurrencyMetrics>;
  processingTime: {
    parsing: number;
    transformation: number;
    validation: number;
    loading: number;
    total: number;
  };
  qualityScore: number;
  dataCompleteness: number;
}


export interface ProcessingProgress {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  estimatedTimeRemaining: number;
  currentStepName: string;
  stepProgress: number;
}

export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  serviceStatus: Record<string, 'HEALTHY' | 'DEGRADED' | 'DOWN'>;
}

export interface PerformanceData {
  throughput: number;
  latency: number;
  errorRate: number;
  availability: number;
  responseTime: PerformanceMetric[];
}

export interface PerformanceMetric {
  timestamp: string;
  value: number;
  unit: string;
}

export type PipelineStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PAUSED';
export type StepType = 'EXTRACT' | 'TRANSFORM' | 'LOAD' | 'VALIDATE' | 'RECONCILE' | 'AUDIT';
export type StepStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'PAUSED';