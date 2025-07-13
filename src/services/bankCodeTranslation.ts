/**
 * Bank Transaction Code Translation Service
 * Converts ISO 20022 CAMT bank transaction codes into human-readable descriptions
 * Based on official ISO 20022 External Code Lists and real banking scenarios
 */

export interface BankTransactionCode {
  domain: string;
  family: string;
  subfamily: string;
  proprietary?: {
    code: string;
    issuer: string;
  };
}

export interface TransactionCodeExplanation {
  type: string;
  description: string;
  businessMeaning: string;
  commonScenarios: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reconciliationTips: string[];
}

/**
 * ISO 20022 Domain Code Translations
 * PMNT = Payments, CAMT = Cash Management, TRAD = Trade Services, FXOP = Foreign Exchange
 */
const DOMAIN_CODES: Record<string, string> = {
  PMNT: 'Payment',
  CAMT: 'Cash Management', 
  TRAD: 'Trade Services',
  FXOP: 'Foreign Exchange',
  RLTI: 'Real Time Instruction',
  SECU: 'Securities',
  ACMT: 'Account Management',
  ADMI: 'Administration'
};

/**
 * Payment Family Codes - Most common in CAMT.053 statements
 */
const PAYMENT_FAMILY_CODES: Record<string, string> = {
  ICDT: 'Incoming Credit Transfer',
  OCDT: 'Outgoing Credit Transfer', 
  IDDT: 'Incoming Direct Debit',
  ODDT: 'Outgoing Direct Debit',
  RRTN: 'Return Transaction',
  IRCT: 'Incoming Receipt',
  ORCT: 'Outgoing Receipt',
  CNTR: 'Counter Transaction'
};

/**
 * Payment Subfamily Codes - Specific payment instruments
 */
const PAYMENT_SUBFAMILY_CODES: Record<string, { name: string; description: string; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' }> = {
  // SEPA Credit Transfers
  ESCT: { 
    name: 'SEPA Credit Transfer', 
    description: 'Euro payment within SEPA area (same-day or next-day)',
    riskLevel: 'LOW'
  },
  XBCT: { 
    name: 'Cross-Border Credit Transfer', 
    description: 'International wire transfer outside SEPA',
    riskLevel: 'HIGH' 
  },
  DMCT: { 
    name: 'Domestic Credit Transfer', 
    description: 'Local currency transfer within same country',
    riskLevel: 'LOW'
  },
  
  // Direct Debits
  ESDD: { 
    name: 'SEPA Direct Debit', 
    description: 'Euro direct debit within SEPA area',
    riskLevel: 'MEDIUM'
  },
  BBDD: { 
    name: 'Business-to-Business Direct Debit', 
    description: 'B2B direct debit (no refund rights)',
    riskLevel: 'HIGH'
  },
  
  // Cards
  CDQC: { 
    name: 'Card Transaction', 
    description: 'Debit/credit card payment',
    riskLevel: 'LOW'
  },
  CDCB: { 
    name: 'Card Cash Back', 
    description: 'Cash withdrawal via card',
    riskLevel: 'LOW'
  },
  
  // Cash Management
  CAJT: { 
    name: 'Cash Concentration', 
    description: 'Automated cash pooling/concentration',
    riskLevel: 'LOW'
  },
  CWDL: { 
    name: 'Cash Withdrawal', 
    description: 'Cash withdrawal from account',
    riskLevel: 'MEDIUM'
  },
  CDPT: { 
    name: 'Cash Deposit', 
    description: 'Cash deposit to account',
    riskLevel: 'LOW'
  },
  
  // Returns and Reversals
  RPCR: { 
    name: 'Payment Return', 
    description: 'Returned payment (insufficient funds, account closed)',
    riskLevel: 'HIGH'
  },
  REPR: { 
    name: 'Payment Recall/Reverse', 
    description: 'Payment recalled by sender',
    riskLevel: 'HIGH'
  },
  
  // Fees and Charges
  CHRG: { 
    name: 'Bank Charges', 
    description: 'Transaction fees and service charges',
    riskLevel: 'LOW'
  },
  COMC: { 
    name: 'Commission', 
    description: 'Commission charges for services',
    riskLevel: 'LOW'
  },
  
  // Interest
  INTA: { 
    name: 'Interest Accrual', 
    description: 'Interest earned on account balance',
    riskLevel: 'LOW'
  },
  INTC: { 
    name: 'Interest Charge', 
    description: 'Interest charged on overdraft/loan',
    riskLevel: 'MEDIUM'
  }
};

/**
 * Common proprietary bank codes used by major banks
 */
/*
const PROPRIETARY_CODES: Record<string, Record<string, string>> = {
  CHIPS: {
    'FW': 'Fedwire Transfer',
    'AW': 'ACH Wire Transfer', 
    'DW': 'Domestic Wire Transfer'
  },
  SWIFT: {
    'MT103': 'Single Customer Credit Transfer',
    'MT202': 'General Financial Institution Transfer',
    'MT950': 'Statement Message'
  },
  TARGET2: {
    'RTGS': 'Real Time Gross Settlement',
    'ICP': 'Instant Credit Payment'
  }
};
*/

export class BankCodeTranslationService {
  
  /**
   * Translate a bank transaction code into human-readable explanation
   */
  translateCode(code: BankTransactionCode): TransactionCodeExplanation {
    const domain = DOMAIN_CODES[code.domain] || `Unknown Domain (${code.domain})`;
    const family = PAYMENT_FAMILY_CODES[code.family] || `Unknown Family (${code.family})`;
    const subfamily = PAYMENT_SUBFAMILY_CODES[code.subfamily];
    
    if (!subfamily) {
      return {
        type: `${domain} - ${family}`,
        description: `${code.subfamily} - Unknown payment type`,
        businessMeaning: 'This transaction type is not recognized. Contact your bank for clarification.',
        commonScenarios: ['Unknown transaction type'],
        riskLevel: 'HIGH',
        reconciliationTips: [
          'Request clarification from bank relationship manager',
          'Check if this is a new transaction type or bank-specific code',
          'Review transaction amount and counterparty for context'
        ]
      };
    }

    const type = `${domain} - ${family}`;
    const description = `${subfamily.name} - ${subfamily.description}`;
    
    return {
      type,
      description,
      businessMeaning: this.getBusinessMeaning(code),
      commonScenarios: this.getCommonScenarios(code),
      riskLevel: subfamily.riskLevel,
      reconciliationTips: this.getReconciliationTips(code)
    };
  }

  /**
   * Parse a bank transaction code string (e.g., "PMNT-ICDT-ESCT")
   */
  parseCodeString(codeString: string): BankTransactionCode | null {
    const parts = codeString.split('-');
    if (parts.length < 3) return null;
    
    return {
      domain: parts[0],
      family: parts[1], 
      subfamily: parts[2],
      proprietary: parts.length > 3 ? { code: parts[3], issuer: parts[4] || 'Unknown' } : undefined
    };
  }

  /**
   * Get business meaning based on transaction code
   */
  private getBusinessMeaning(code: BankTransactionCode): string {
    const key = `${code.domain}-${code.family}-${code.subfamily}`;
    
    const meanings: Record<string, string> = {
      'PMNT-ICDT-ESCT': 'Money received from another party via SEPA credit transfer. Typically supplier payments, customer receipts, or salary deposits.',
      'PMNT-OCDT-ESCT': 'Money sent to another party via SEPA credit transfer. Usually vendor payments, salary transfers, or customer refunds.',
      'PMNT-IDDT-ESDD': 'Money collected via SEPA direct debit. Common for subscription fees, utilities, loan repayments.',
      'PMNT-RRTN-RPCR': 'A payment was returned due to insufficient funds, closed account, or invalid details. Requires investigation.',
      'CAMT-CAJT-CAJT': 'Automated cash concentration between accounts. Part of cash pooling arrangements.',
      'PMNT-ICDT-CWDL': 'Cash withdrawal from ATM or branch counter.',
      'PMNT-ICDT-CHRG': 'Bank charges for services like wire transfers, account maintenance, or foreign exchange.',
      'PMNT-ICDT-INTA': 'Interest earned on positive account balance or deposits.'
    };

    return meanings[key] || `${code.domain} transaction - Check transaction details for specific business context.`;
  }

  /**
   * Get common scenarios for this transaction type
   */
  private getCommonScenarios(code: BankTransactionCode): string[] {
    const key = `${code.domain}-${code.family}-${code.subfamily}`;
    
    const scenarios: Record<string, string[]> = {
      'PMNT-ICDT-ESCT': [
        'Customer payment for invoice',
        'Supplier advance payment received', 
        'Salary deposit from employer',
        'Insurance claim settlement',
        'Government grant or subsidy'
      ],
      'PMNT-OCDT-ESCT': [
        'Payment to supplier for goods/services',
        'Salary payment to employee',
        'Tax payment to government',
        'Loan repayment to bank',
        'Investment transfer to broker'
      ],
      'PMNT-RRTN-RPCR': [
        'Insufficient funds in payer account',
        'Account closed or frozen',
        'Invalid account details provided',
        'Payment disputed by account holder',
        'Bank processing error'
      ],
      'PMNT-ICDT-CHRG': [
        'Wire transfer fees',
        'Monthly account maintenance',
        'Foreign exchange charges',
        'Overdraft penalty fees',
        'Card annual fees'
      ]
    };

    return scenarios[key] || ['Standard banking transaction'];
  }

  /**
   * Get reconciliation tips for this transaction type
   */
  private getReconciliationTips(code: BankTransactionCode): string[] {
    const subfamily = PAYMENT_SUBFAMILY_CODES[code.subfamily];
    if (!subfamily) return ['Unknown transaction type - contact bank for details'];

    const baseTips = [
      'Check transaction reference fields for invoice/payment numbers',
      'Verify counterparty name matches expected payer/payee',
      'Confirm transaction amount matches invoice or agreement',
      'Review transaction date against expected timing'
    ];

    const specificTips: Record<string, string[]> = {
      'ESCT': ['SEPA transfers should have End-to-End ID for tracking', 'Check IBAN validation'],
      'XBCT': ['Verify exchange rate used for currency conversion', 'Check correspondent bank charges'],
      'ESDD': ['Confirm mandate reference number', 'Check creditor identifier'],
      'RPCR': ['Investigate return reason code', 'Contact payer to resolve issue', 'May need to re-initiate payment'],
      'CHRG': ['Check if charges were expected', 'Verify rate table application'],
      'INTA': ['Confirm interest calculation period', 'Check against account terms']
    };

    return [...baseTips, ...(specificTips[code.subfamily] || [])];
  }

  /**
   * Search for transaction codes by description
   */
  searchCodes(searchTerm: string): Array<{ code: string; description: string }> {
    const results: Array<{ code: string; description: string }> = [];
    const term = searchTerm.toLowerCase();
    
    Object.entries(PAYMENT_SUBFAMILY_CODES).forEach(([code, info]) => {
      if (info.name.toLowerCase().includes(term) || info.description.toLowerCase().includes(term)) {
        results.push({
          code: `PMNT-*-${code}`,
          description: `${info.name} - ${info.description}`
        });
      }
    });

    return results;
  }

  /**
   * Get all supported transaction types for reference
   */
  getAllSupportedCodes(): Array<{ domain: string; family: string; subfamily: string; description: string }> {
    const codes: Array<{ domain: string; family: string; subfamily: string; description: string }> = [];
    
    Object.entries(PAYMENT_SUBFAMILY_CODES).forEach(([subfamily, info]) => {
      Object.entries(PAYMENT_FAMILY_CODES).forEach(([family, familyName]) => {
        codes.push({
          domain: 'PMNT',
          family,
          subfamily,
          description: `${familyName} - ${info.name}`
        });
      });
    });

    return codes;
  }
}

export const bankCodeTranslator = new BankCodeTranslationService();