import { FinancialTransaction, ETLPipelineData, ProcessingMetrics, RiskLevel, TransactionCategory, CurrencyCode, CurrencyMetrics } from '@/types';

type CacheData = ETLPipelineData[] | FinancialTransaction[];

export class DataProcessor {
  private cache = new Map<string, CacheData>();

  private getBasePath(): string {
    // For GitHub Pages, we need the repository name in the path
    // For development running on localhost, we need root path
    const isDev = import.meta.env.DEV;
    return isDev ? '' : '/ledger-reconciliation-dashboard';
  }

  async loadETLData(): Promise<ETLPipelineData[]> {
    try {
      const basePath = this.getBasePath();
      const response = await fetch(`${basePath}/data/etl-pipelines.json`);
      if (!response.ok) {
        throw new Error('Failed to load ETL data');
      }
      const data = await response.json();
      this.cache.set('etl-pipelines', data);
      return data;
    } catch (error) {
      console.error('Error loading ETL data:', error);
      return this.getMockETLData();
    }
  }

  async loadTransactions(): Promise<FinancialTransaction[]> {
    try {
      const basePath = this.getBasePath();
      const response = await fetch(`${basePath}/data/transactions.json`);
      if (!response.ok) {
        throw new Error('Failed to load transactions');
      }
      const data = await response.json();
      this.cache.set('transactions', data);
      return data;
    } catch (error) {
      console.error('Error loading transactions:', error);
      return this.getMockTransactions();
    }
  }

  calculateMetrics(transactions: FinancialTransaction[]): ProcessingMetrics {
    const riskDistribution: Record<RiskLevel, number> = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      NONE: 0
    };

    const categoryDistribution: Record<TransactionCategory, number> = {
      REVENUE: 0,
      EXPENSE: 0,
      TRANSFER: 0,
      OTHER: 0
    };

    const currencyDistribution: Record<CurrencyCode, CurrencyMetrics> = {
      USD: { count: 0, totalAmount: 0, averageAmount: 0, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 } },
      EUR: { count: 0, totalAmount: 0, averageAmount: 0, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 } },
      GBP: { count: 0, totalAmount: 0, averageAmount: 0, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 } },
      SGD: { count: 0, totalAmount: 0, averageAmount: 0, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 } },
      JPY: { count: 0, totalAmount: 0, averageAmount: 0, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 } },
      CNY: { count: 0, totalAmount: 0, averageAmount: 0, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 } },
      AUD: { count: 0, totalAmount: 0, averageAmount: 0, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 } },
      CHF: { count: 0, totalAmount: 0, averageAmount: 0, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 } }
    };

    transactions.forEach(transaction => {
      // Risk distribution
      riskDistribution[transaction.riskLevel]++;

      // Simple category classification based on credit/debit and amount
      const category = transaction.creditDebitIndicator === 'CRDT' ? 'REVENUE' : 'EXPENSE';
      categoryDistribution[category]++;

      // Currency distribution
      const currency = transaction.amount.currency;
      if (currencyDistribution[currency]) {
        currencyDistribution[currency].count++;
        currencyDistribution[currency].totalAmount += transaction.amount.original;
        currencyDistribution[currency].riskDistribution[transaction.riskLevel]++;
      }
    });

    // Calculate averages
    Object.keys(currencyDistribution).forEach(currencyKey => {
      const currency = currencyKey as CurrencyCode;
      const total = currencyDistribution[currency].totalAmount;
      const count = currencyDistribution[currency].count;
      currencyDistribution[currency].averageAmount = count > 0 ? total / count : 0;
    });

    return {
      totalTransactions: transactions.length,
      successfulTransactions: transactions.filter(t => t.reconciliationStatus !== 'EXCEPTION').length,
      failedTransactions: transactions.filter(t => t.reconciliationStatus === 'EXCEPTION').length,
      foreignCurrencyCount: transactions.filter(t => t.fxConversion !== undefined).length,
      successfulConversions: transactions.filter(t => t.fxConversion).length,
      failedConversions: 0,
      riskDistribution,
      categoryDistribution,
      currencyDistribution,
      processingTime: {
        parsing: 125,
        transformation: 89,
        validation: 45,
        loading: 156,
        total: 415
      },
      qualityScore: 95.5,
      dataCompleteness: 98.2
    };
  }

  simulateRealTimeProcessing(callback: (progress: { currentStep: number; percentage: number; currentStepName: string }) => void): void {
    const steps = [
      'XML Parsing',
      'Data Validation',
      'FX Conversion',
      'Risk Assessment',
      'Database Loading'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(interval);
        return;
      }

      callback({
        currentStep,
        percentage: ((currentStep + 1) / steps.length) * 100,
        currentStepName: steps[currentStep]
      });

      currentStep++;
    }, 1000);
  }

  private getMockETLData(): ETLPipelineData[] {
    return [
      {
        id: 'pipeline-1',
        name: 'CAMT.053 Processing Pipeline',
        status: 'COMPLETED',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 415000).toISOString(),
        duration: 415,
        steps: [
          {
            id: 'step-1',
            name: 'XML Parsing',
            type: 'EXTRACT',
            status: 'COMPLETED',
            inputCount: 1,
            outputCount: 3,
            errorCount: 0,
            duration: 125,
            details: {
              description: 'Parse CAMT.053 XML file and extract transaction data',
              inputFormat: 'XML',
              outputFormat: 'JSON',
              transformationRules: ['Extract transaction details', 'Parse counterparty information'],
              validationRules: ['Validate XML schema', 'Check required fields'],
              errorMessages: []
            }
          },
          {
            id: 'step-2',
            name: 'FX Transformation',
            type: 'TRANSFORM',
            status: 'COMPLETED',
            inputCount: 3,
            outputCount: 3,
            errorCount: 0,
            duration: 89,
            details: {
              description: 'Apply FX conversions and calculate base currency amounts',
              inputFormat: 'JSON',
              outputFormat: 'JSON',
              transformationRules: ['Apply FX rates', 'Calculate converted amounts'],
              validationRules: ['Validate conversion rates', 'Check currency codes'],
              errorMessages: []
            }
          },
          {
            id: 'step-3',
            name: 'Data Validation',
            type: 'VALIDATE',
            status: 'COMPLETED',
            inputCount: 3,
            outputCount: 3,
            errorCount: 0,
            duration: 45,
            details: {
              description: 'Validate transaction data and assign risk levels',
              inputFormat: 'JSON',
              outputFormat: 'JSON',
              transformationRules: ['Assign risk levels', 'Categorize transactions'],
              validationRules: ['Business rule validation', 'Data quality checks'],
              errorMessages: []
            }
          },
          {
            id: 'step-4',
            name: 'Database Loading',
            type: 'LOAD',
            status: 'COMPLETED',
            inputCount: 3,
            outputCount: 3,
            errorCount: 0,
            duration: 156,
            details: {
              description: 'Load validated transactions into database',
              inputFormat: 'JSON',
              outputFormat: 'Database',
              transformationRules: ['Map to database schema', 'Generate audit trail'],
              validationRules: ['Unique constraint checks', 'Foreign key validation'],
              errorMessages: []
            }
          }
        ],
        metrics: {
          totalTransactions: 3,
          successfulTransactions: 3,
          failedTransactions: 0,
          foreignCurrencyCount: 2,
          successfulConversions: 2,
          failedConversions: 0,
          riskDistribution: {
            HIGH: 0,
            MEDIUM: 2,
            LOW: 1,
            NONE: 0
          },
          categoryDistribution: {
            REVENUE: 3,
            EXPENSE: 0,
            TRANSFER: 0,
            OTHER: 0
          },
          currencyDistribution: {
            USD: { count: 1, totalAmount: 15000, averageAmount: 15000, riskDistribution: { HIGH: 0, MEDIUM: 1, LOW: 0, NONE: 0 } },
            EUR: { count: 1, totalAmount: 8500, averageAmount: 8500, riskDistribution: { HIGH: 0, MEDIUM: 1, LOW: 0, NONE: 0 } },
            SGD: { count: 1, totalAmount: 2850.75, averageAmount: 2850.75, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 1, NONE: 0 } },
            GBP: { count: 0, totalAmount: 0, averageAmount: 0, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 } },
            JPY: { count: 0, totalAmount: 0, averageAmount: 0, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 } },
            CNY: { count: 0, totalAmount: 0, averageAmount: 0, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 } },
            AUD: { count: 0, totalAmount: 0, averageAmount: 0, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 } },
            CHF: { count: 0, totalAmount: 0, averageAmount: 0, riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 } }
          },
          processingTime: {
            parsing: 125,
            transformation: 89,
            validation: 45,
            loading: 156,
            total: 415
          },
          qualityScore: 95.5,
          dataCompleteness: 98.2
        }
      }
    ];
  }

  private getMockTransactions(): FinancialTransaction[] {
    return [
      {
        id: 'txn-1',
        entryRef: 'TXN-001-20231231',
        bookingDate: '2023-12-31',
        valueDate: '2023-12-31',
        amount: {
          original: 15000,
          currency: 'USD'
        },
        creditDebitIndicator: 'CRDT',
        counterparty: {
          name: 'ACME Corporation',
          account: '1234567890'
        },
        description: 'Payment for services',
        riskLevel: 'MEDIUM',
        reconciliationStatus: 'PENDING',
        fxConversion: {
          fromCurrency: 'USD',
          toCurrency: 'SGD',
          rate: 1.345,
          rateDate: '2023-12-31',
          convertedAmount: 20175,
          provider: 'CSV',
          confidence: 95
        }
      },
      {
        id: 'txn-2',
        entryRef: 'TXN-002-20231231',
        bookingDate: '2023-12-31',
        valueDate: '2023-12-31',
        amount: {
          original: 8500,
          currency: 'EUR'
        },
        creditDebitIndicator: 'CRDT',
        counterparty: {
          name: 'European Client Ltd',
          account: '9876543210'
        },
        description: 'Consulting fees',
        riskLevel: 'MEDIUM',
        reconciliationStatus: 'PENDING',
        fxConversion: {
          fromCurrency: 'EUR',
          toCurrency: 'SGD',
          rate: 1.4462,
          rateDate: '2023-12-31',
          convertedAmount: 12292.50,
          provider: 'CSV',
          confidence: 95
        }
      },
      {
        id: 'txn-3',
        entryRef: 'TXN-003-20231231',
        bookingDate: '2023-12-31',
        valueDate: '2023-12-31',
        amount: {
          original: 2850.75,
          currency: 'SGD'
        },
        creditDebitIndicator: 'CRDT',
        counterparty: {
          name: 'Local Partner Pte Ltd',
          account: '1122334455'
        },
        description: 'Local service payment',
        riskLevel: 'LOW',
        reconciliationStatus: 'PENDING'
      }
    ];
  }
}

export const dataProcessor = new DataProcessor();