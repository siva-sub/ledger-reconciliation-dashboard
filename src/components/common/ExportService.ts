import { FinancialTransaction, ProcessingMetrics } from '@/types';

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  includeMetadata?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: {
    status?: string[];
    riskLevel?: string[];
    currencies?: string[];
    minAmount?: number;
    maxAmount?: number;
  };
}

export class ExportService {
  
  static exportTransactions(
    transactions: FinancialTransaction[], 
    options: ExportOptions
  ): void {
    const filteredTransactions = this.applyFilters(transactions, options.filters);
    
    switch (options.format) {
      case 'csv':
        this.exportToCSV(filteredTransactions, options);
        break;
      case 'xlsx':
        this.exportToExcel(filteredTransactions, options);
        break;
      case 'json':
        this.exportToJSON(filteredTransactions, options);
        break;
      case 'pdf':
        this.exportToPDF(filteredTransactions);
        break;
      default:
        throw new Error('Unsupported export format');
    }
  }

  static exportMetrics(metrics: ProcessingMetrics, format: 'csv' | 'json' = 'json'): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `processing-metrics-${timestamp}`;
    
    if (format === 'json') {
      const dataStr = JSON.stringify(metrics, null, 2);
      this.downloadFile(dataStr, `${filename}.json`, 'application/json');
    } else {
      const csvData = this.metricsToCSV(metrics);
      this.downloadFile(csvData, `${filename}.csv`, 'text/csv');
    }
  }

  private static applyFilters(
    transactions: FinancialTransaction[], 
    filters?: ExportOptions['filters']
  ): FinancialTransaction[] {
    if (!filters) return transactions;

    return transactions.filter(txn => {
      if (filters.status && !filters.status.includes(txn.reconciliationStatus)) {
        return false;
      }
      
      if (filters.riskLevel && !filters.riskLevel.includes(txn.riskLevel)) {
        return false;
      }
      
      if (filters.currencies && !filters.currencies.includes(txn.amount.currency)) {
        return false;
      }
      
      if (filters.minAmount && txn.amount.original < filters.minAmount) {
        return false;
      }
      
      if (filters.maxAmount && txn.amount.original > filters.maxAmount) {
        return false;
      }
      
      return true;
    });
  }

  private static exportToCSV(
    transactions: FinancialTransaction[], 
    options: ExportOptions
  ): void {
    const headers = [
      'Entry Reference',
      'Date',
      'Amount',
      'Currency',
      'Credit/Debit',
      'Counterparty',
      'Description',
      'Status',
      'Risk Level',
      'Bank Transaction Code'
    ];

    if (options.includeMetadata) {
      headers.push('Data Source', 'Validation Score', 'Processing Timestamp');
    }

    const csvData = [
      headers.join(','),
      ...transactions.map(txn => {
        const row = [
          txn.entryRef,
          txn.valueDate,
          txn.amount.original.toString(),
          txn.amount.currency,
          txn.creditDebitIndicator,
          `"${txn.counterparty.name}"`,
          `"${txn.description.replace(/"/g, '""')}"`,
          txn.reconciliationStatus,
          txn.riskLevel,
          txn.bankTransactionCode || ''
        ];

        if (options.includeMetadata && txn.metadata) {
          row.push(
            txn.metadata.dataSource,
            txn.metadata.validationScore.toString(),
            txn.metadata.processingTimestamp
          );
        }

        return row.join(',');
      })
    ].join('\n');

    const timestamp = new Date().toISOString().split('T')[0];
    this.downloadFile(csvData, `transactions-${timestamp}.csv`, 'text/csv');
  }

  private static exportToJSON(
    transactions: FinancialTransaction[], 
    options: ExportOptions
  ): void {
    const exportData = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        totalRecords: transactions.length,
        filters: options.filters || {},
        includeMetadata: options.includeMetadata
      },
      transactions: options.includeMetadata 
        ? transactions 
        : transactions.map(txn => {
            const { metadata, validationResults, ...basicData } = txn;
            void metadata; void validationResults; // Explicitly ignore these destructured variables
            return basicData;
          })
    };

    const timestamp = new Date().toISOString().split('T')[0];
    const dataStr = JSON.stringify(exportData, null, 2);
    this.downloadFile(dataStr, `transactions-${timestamp}.json`, 'application/json');
  }

  private static exportToExcel(
    transactions: FinancialTransaction[], 
    options: ExportOptions
  ): void {
    // For now, export as CSV with Excel-compatible format
    // In a real implementation, you would use a library like xlsx or exceljs
    console.log('Excel export would require xlsx library. Falling back to CSV.');
    this.exportToCSV(transactions, options);
  }

  private static exportToPDF(
    transactions: FinancialTransaction[]
  ): void {
    // For now, create a simple text-based report
    // In a real implementation, you would use a library like jsPDF
    const reportContent = this.generatePDFContent(transactions);
    const timestamp = new Date().toISOString().split('T')[0];
    this.downloadFile(reportContent, `transaction-report-${timestamp}.txt`, 'text/plain');
  }

  private static generatePDFContent(
    transactions: FinancialTransaction[]
  ): string {
    const timestamp = new Date().toISOString();
    const summary = this.generateSummaryStats(transactions);
    
    return `
FINANCIAL TRANSACTION REPORT
Generated: ${timestamp}
Total Transactions: ${transactions.length}

SUMMARY STATISTICS
${summary}

TRANSACTION DETAILS
${transactions.map((txn, index) => `
${index + 1}. ${txn.entryRef} - ${txn.valueDate}
   Amount: ${txn.amount.currency} ${txn.amount.original.toLocaleString()}
   Counterparty: ${txn.counterparty.name}
   Status: ${txn.reconciliationStatus} | Risk: ${txn.riskLevel}
   Description: ${txn.description}
`).join('')}
    `.trim();
  }

  private static generateSummaryStats(transactions: FinancialTransaction[]): string {
    const statusCounts = transactions.reduce((acc, txn) => {
      acc[txn.reconciliationStatus] = (acc[txn.reconciliationStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const riskCounts = transactions.reduce((acc, txn) => {
      acc[txn.riskLevel] = (acc[txn.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount.original, 0);

    return `
Status Distribution: ${Object.entries(statusCounts).map(([k, v]) => `${k}: ${v}`).join(', ')}
Risk Distribution: ${Object.entries(riskCounts).map(([k, v]) => `${k}: ${v}`).join(', ')}
Total Amount: ${totalAmount.toLocaleString()}
    `.trim();
  }

  private static metricsToCSV(metrics: ProcessingMetrics): string {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Transactions', metrics.totalTransactions.toString()],
      ['Successful Transactions', metrics.successfulTransactions.toString()],
      ['Failed Transactions', metrics.failedTransactions.toString()],
      ['Foreign Currency Count', metrics.foreignCurrencyCount.toString()],
      ['Quality Score', metrics.qualityScore.toString()],
      ['Data Completeness', metrics.dataCompleteness.toString()],
      ['Total Processing Time (ms)', metrics.processingTime.total.toString()],
      ['Parsing Time (ms)', metrics.processingTime.parsing.toString()],
      ['Transformation Time (ms)', metrics.processingTime.transformation.toString()],
      ['Validation Time (ms)', metrics.processingTime.validation.toString()],
      ['Loading Time (ms)', metrics.processingTime.loading.toString()]
    ];

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  static generateComplianceReport(transactions: FinancialTransaction[]): string {
    const highRiskTransactions = transactions.filter(txn => txn.riskLevel === 'HIGH');
    const failedValidations = transactions.filter(txn => 
      txn.validationResults?.some(result => result.status === 'FAIL')
    );
    const exceptions = transactions.filter(txn => txn.reconciliationStatus === 'EXCEPTION');

    return `
COMPLIANCE REPORT
Generated: ${new Date().toISOString()}

OVERVIEW
- Total Transactions: ${transactions.length}
- High Risk Transactions: ${highRiskTransactions.length}
- Failed Validations: ${failedValidations.length}
- Exceptions Requiring Review: ${exceptions.length}

HIGH RISK TRANSACTIONS
${highRiskTransactions.map(txn => `
- ${txn.entryRef}: ${txn.counterparty.name} (${txn.amount.currency} ${txn.amount.original.toLocaleString()})
  Risk Factors: ${txn.validationResults?.filter(r => r.status !== 'PASS').map(r => r.message).join('; ') || 'N/A'}
`).join('')}

FAILED VALIDATIONS
${failedValidations.map(txn => `
- ${txn.entryRef}: ${txn.validationResults?.filter(r => r.status === 'FAIL').map(r => r.message).join('; ')}
`).join('')}

RECOMMENDATIONS
- Review all HIGH risk transactions for enhanced due diligence
- Investigate failed validation transactions
- Update risk assessment criteria based on patterns identified
- Implement additional controls for flagged counterparties
    `.trim();
  }
}