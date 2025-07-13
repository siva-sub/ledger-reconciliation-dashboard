export interface FinancialTransaction {
  id: string;
  entryRef: string;
  bookingDate: string;
  valueDate: string;
  amount: {
    original: number;
    currency: CurrencyCode;
  };
  creditDebitIndicator: 'CRDT' | 'DBIT';
  counterparty: {
    name: string;
    account?: string;
    bic?: string;
  };
  description: string;
  riskLevel: RiskLevel;
  reconciliationStatus: ReconciliationStatus;
  bankTransactionCode?: string;
  fxConversion?: FXConversion;
  validationResults?: ValidationResult[];
  metadata?: TransactionMetadata;
}

export interface FXConversion {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: number;
  rateDate: string;
  convertedAmount: number;
  provider: 'CSV' | 'API' | 'MANUAL';
  confidence: number;
}

export interface ReconciliationMatch {
  id: string;
  sourceTransaction: FinancialTransaction;
  targetTransaction?: FinancialTransaction;
  matchType: 'EXACT' | 'FUZZY' | 'MANUAL';
  confidence: number;
  matchCriteria: MatchCriteria[];
  status: 'MATCHED' | 'UNMATCHED' | 'EXCEPTION';
  reviewedBy?: string;
  reviewedDate?: string;
  notes?: string;
}

export interface ValidationResult {
  rule: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TransactionMetadata {
  processingTimestamp: string;
  dataSource: string;
  validationScore: number;
  flags: string[];
}

export interface MatchCriteria {
  field: string;
  type: 'EXACT' | 'FUZZY' | 'RANGE';
  confidence: number;
}

export interface CurrencyMetrics {
  count: number;
  totalAmount: number;
  averageAmount: number;
  riskDistribution: Record<RiskLevel, number>;
}

export interface ExecutiveMetrics {
  totalVolume: {
    count: number;
    value: number;
    change: number;
  };
  reconciliationRate: {
    percentage: number;
    change: number;
  };
  exceptionCount: {
    total: number;
    critical: number;
    change: number;
  };
  processingTime: {
    average: number;
    change: number;
  };
  riskExposure: {
    high: number;
    medium: number;
    low: number;
  };
  currencyExposure: Record<CurrencyCode, number>;
}

export interface DateRange {
  start: string;
  end: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'SGD' | 'JPY' | 'CNY' | 'AUD' | 'CHF';
export type TransactionType = 'PAYMENT' | 'RECEIPT' | 'TRANSFER' | 'FEE' | 'INTEREST';
export type TransactionCategory = 'REVENUE' | 'EXPENSE' | 'TRANSFER' | 'OTHER';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type ReconciliationStatus = 'PENDING' | 'MATCHED' | 'EXCEPTION' | 'REVIEWED';