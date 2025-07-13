import { describe, it, expect } from 'vitest';
import { dataProcessor } from '@/services/dataProcessor';
import type { CurrencyCode } from '@/types/financial';

describe('DataProcessor', () => {
  it('should be defined', () => {
    expect(dataProcessor).toBeDefined();
  });

  it('should calculate metrics correctly', () => {
    const mockTransactions = [
      {
        id: 'test-1',
        entryRef: 'TEST-001',
        bookingDate: '2024-01-01',
        valueDate: '2024-01-01',
        amount: { original: 1000, currency: 'USD' as CurrencyCode },
        creditDebitIndicator: 'CRDT' as const,
        counterparty: { name: 'Test Corp', account: '123456' },
        description: 'Test transaction',
        riskLevel: 'LOW' as const,
        reconciliationStatus: 'PENDING' as const
      }
    ];

    const metrics = dataProcessor.calculateMetrics(mockTransactions);
    
    expect(metrics.totalTransactions).toBe(1);
    expect(metrics.riskDistribution.LOW).toBe(1);
    expect(metrics.categoryDistribution.REVENUE).toBe(1);
  });
});