// ISO 20022 CAMT.053.001.13 Schema-Compliant Types
// Based on official bank-to-customer cash management specification

/**
 * Represents the fundamental Amount and Currency structure.
 * Corresponds to: ActiveOrHistoricCurrencyAndAmount
 */
export interface AmountAndCurrency {
  Ccy: string; // ISO 4217 Currency Code, e.g., "USD", "EUR"
  Value: number;
}

/**
 * Specifies the direction of the money movement.
 * Corresponds to: CreditDebitCode (CRDT | DBIT)
 */
export type CreditDebitIndicator = 'CRDT' | 'DBIT';

/**
 * Provides details on the currency exchange.
 * Corresponds to: AmountAndCurrencyExchange4
 */
export interface AmountAndCurrencyExchange4 {
  InstdAmt?: AmountAndCurrency; // Instructed Amount
  TxAmt: AmountAndCurrency;     // Transaction Amount
  XchgRate: number;             // Exchange Rate
  SrcCcy: string;               // Source Currency
  TrgtCcy: string;              // Target Currency
}

/**
 * Provides structured information on the bank transaction code.
 * Corresponds to: BankTransactionCodeStructure4
 */
export interface BankTransactionCodeStructure4 {
  Dmn: {          // Domain
    Cd: string;   // Code (e.g., "PMNT" for Payment)
    Fmly: {       // Family
      Cd: string; // Code
      SubFmlyCd: string; // Sub Family Code
    };
  };
  Prtry?: {       // Proprietary
    Cd: string;   // Code
    Issr: string; // Issuer (e.g., "CHIPS", "Fedwire")
  };
}

/**
 * Provides information on the charges included in the entry.
 * Corresponds to: Charges15
 */
export interface Charges15 {
  TtlChrgsAndTaxAmt?: AmountAndCurrency;
  Rcrd?: {
    Amt: AmountAndCurrency;
    CdtDbtInd: CreditDebitIndicator;
    Tp: {
      Cd: string; // Charge type code
    };
    Agt?: {       // Agent
      FinInstnId: {
        BIC: string;
      };
    };
  }[];
}

/**
 * Contains information related to the identification of parties.
 * Corresponds to: Party50Choice
 */
export interface PartyIdentification {
  Nm: string;
  PstlAdr?: {
    Ctry: string;
    AdrLine: string[];
  };
  Id?: {
    OrgId?: {
      BICOrBEI: string;
    };
  };
}

/**
 * Represents related parties involved in the transaction.
 * Corresponds to: TransactionParties6
 */
export interface TransactionParties6 {
  InitgPty?: PartyIdentification;
  Dbtr?: PartyIdentification;      // Debtor
  DbtrAcct?: {                     // Debtor Account
    Id: {
      IBAN?: string;
      Othr?: {
        Id: string;
        SchmeNm: string;
      };
    };
  };
  Cdtr?: PartyIdentification;      // Creditor
  CdtrAcct?: {                     // Creditor Account
    Id: {
      IBAN?: string;
      Othr?: {
        Id: string;
        SchmeNm: string;
      };
    };
  };
}

/**
 * Represents a single transaction's details within an entry.
 * Corresponds to: TransactionDetails17
 */
export interface TransactionDetails17 {
  Refs: {
    MsgId?: string;
    AcctSvcrRef?: string;    // Account Servicer Reference
    EndToEndId?: string;     // End to End Identification
    TxId?: string;           // Transaction Identification
    UETR?: string;           // Unique End-to-end Transaction Reference
  };
  Amt: AmountAndCurrency;
  CdtDbtInd: CreditDebitIndicator;
  AmtDtls?: AmountAndCurrencyExchange4;
  Avlbty?: {               // Availability
    Dt: {
      NbOfDays: number;
    };
    Amt: AmountAndCurrency;
  }[];
  BkTxCd: BankTransactionCodeStructure4;
  Chrgs?: Charges15;
  RltdPties?: TransactionParties6;
  RltdAgts?: {             // Related Agents
    DbtrAgt?: {
      FinInstnId: {
        BIC: string;
      };
    };
    CdtrAgt?: {
      FinInstnId: {
        BIC: string;
      };
    };
  };
  Purp?: {                 // Purpose
    Cd: string;
  };
  RmtInf?: {               // Remittance Information
    Ustrd?: string[];      // Unstructured
    Strd?: {               // Structured
      RfrdDocInf?: {
        Nb: string;
        RltdDt: string;
      }[];
    };
  };
  RltdDts?: {              // Related Dates
    AccptncDtTm?: string;  // Acceptance Date Time
    TradDt?: string;       // Trade Date
    IntrBkSttlmDt?: string; // Interbank Settlement Date
  };
}

/**
 * Provides the details of a single entry in the statement.
 * Corresponds to: EntryDetails14
 */
export interface EntryDetails14 {
  Btch?: {                 // Batch
    MsgId: string;
    PmtInfId: string;
  };
  TxDtls?: TransactionDetails17[];
}

/**
 * The main report entry, representing a single booking on the account statement.
 * This is the central type for your dashboard's main table.
 * Corresponds to: ReportEntry15
 */
export interface ReportEntry15 {
  NtryRef?: string;        // Entry Reference (unique within the statement)
  Amt: AmountAndCurrency;
  CdtDbtInd: CreditDebitIndicator;
  RvslInd?: boolean;       // Reversal Indicator
  Sts: string;             // Status (e.g., "BOOK" for Booked)
  BookgDt?: {              // Booking Date
    Dt: string;            // ISO Date format: YYYY-MM-DD
  };
  ValDt?: {                // Value Date
    Dt: string;            // ISO Date format: YYYY-MM-DD
  };
  AcctSvcrRef?: string;    // Account Servicer Reference
  Avlbty?: {               // Cash Availability
    Dt: {
      NbOfDays: number;
    };
    Amt: AmountAndCurrency;
  }[];
  BkTxCd: BankTransactionCodeStructure4;
  ComssnWvrInd?: boolean;  // Commission Waiver Indicator
  AddtlInfInd?: {          // Additional Information Indicator
    MsgId: string;
  };
  AmtDtls?: AmountAndCurrencyExchange4;
  Chrgs?: Charges15;       // Charges are optional
  TechInptChanl?: {        // Technical Input Channel
    Cd: string;            // Code (e.g., "INET" for Internet)
  };
  Intrst?: {               // Interest
    Amt: AmountAndCurrency;
    CdtDbtInd: CreditDebitIndicator;
    Tp: {
      Cd: string;
    };
    Rate?: number;
    FrToDt?: {
      FrDt: string;
      ToDt: string;
    };
  };
  NtryDtls?: EntryDetails14[];
  AddtlNtryInf?: string;   // Additional Entry Information
}

/**
 * Contains the cash balance information.
 * Corresponds to: CashBalance8
 */
export interface CashBalance8 {
  Tp: {                    // Type
    CdOrPrtry: {
      Cd: string;          // e.g., "OPBD" (Opening Booked), "CLBD" (Closing Booked)
    };
  };
  Amt: AmountAndCurrency;
  CdtDbtInd: CreditDebitIndicator;
  Dt: {                    // Date
    Dt: string;            // ISO Date format
  };
  Avlbty?: {               // Availability
    Dt: {
      NbOfDays: number;
    };
    Amt: AmountAndCurrency;
  }[];
}

/**
 * Provides summary information on transactions.
 * Corresponds to: TotalTransactions6
 */
export interface TotalTransactions6 {
  TtlNtries?: {            // Total Entries
    NbOfNtries: number;    // Number of Entries
    Sum: number;           // Sum
    TtlNetNtry?: {         // Total Net Entry
      Amt: AmountAndCurrency;
      CdtDbtInd: CreditDebitIndicator;
    };
  };
  TtlCdtNtries?: {         // Total Credit Entries
    NbOfNtries: number;
    Sum: number;
  };
  TtlDbtNtries?: {         // Total Debit Entries
    NbOfNtries: number;
    Sum: number;
  };
}

/**
 * Account statement containing balance and transaction information.
 * Corresponds to: AccountStatement14
 */
export interface AccountStatement14 {
  Id: string;                          // Statement ID
  StmtPgntn?: {                        // Statement Pagination
    PgNb: number;
    LastPgInd: boolean;
  };
  ElctrncSeqNb?: number;               // Electronic Sequence Number
  LglSeqNb?: number;                   // Legal Sequence Number
  CreDtTm?: string;                    // Creation Date Time
  FrToDt?: {                           // From To Date
    FrDt: string;
    ToDt: string;
  };
  CpyDplctInd?: string;                // Copy Duplicate Indicator
  RptgSrc?: {                          // Reporting Source
    Cd: string;
  };
  Acct: {                              // Account
    Id: {
      IBAN?: string;
      Othr?: {
        Id: string;
        SchmeNm: string;
      };
    };
    Tp?: {
      Cd: string;
    };
    Ccy: string;                       // Currency
    Nm?: string;                       // Name
    Ownr?: PartyIdentification;        // Owner
    Svcr?: {                           // Servicer
      FinInstnId: {
        BIC: string;
      };
    };
  };
  RltdAcct?: {                         // Related Account
    Id: {
      IBAN?: string;
      Othr?: {
        Id: string;
        SchmeNm: string;
      };
    };
  };
  Intrst?: {                           // Interest
    Amt: AmountAndCurrency;
    CdtDbtInd: CreditDebitIndicator;
    Tp: {
      Cd: string;
    };
    Rate?: number;
  }[];
  Bal: CashBalance8[];                 // Balances (required, at least one)
  TxsSummry?: TotalTransactions6;      // Transactions Summary
  Ntry?: ReportEntry15[];              // Entries (transactions)
  AddtlStmtInf?: string;               // Additional Statement Information
}

/**
 * Group header containing message identification and creation date time.
 * Corresponds to: GroupHeader118
 */
export interface GroupHeader118 {
  MsgId: string;                       // Message Identification
  CreDtTm: string;                     // Creation Date Time
  MsgRcpt?: PartyIdentification;       // Message Recipient
  MsgPgntn?: {                         // Message Pagination
    PgNb: number;
    LastPgInd: boolean;
  };
  OrgnlBizQry?: {                      // Original Business Query
    MsgId: string;
    MsgNmId: string;
    CreDtTm: string;
  };
  AddtlInf?: string;                   // Additional Information
}

/**
 * Root document structure for CAMT.053 Bank-to-Customer Statement.
 * Corresponds to: BankToCustomerStatementV13
 */
export interface BankToCustomerStatementV13 {
  GrpHdr: GroupHeader118;              // Group Header
  Stmt: AccountStatement14[];          // Account Statements (at least one)
}

/**
 * Document wrapper for CAMT.053 message.
 * Corresponds to: Document root element
 */
export interface Camt053Document {
  Document: {
    BkToCstmrStmt: BankToCustomerStatementV13;
  };
}

// Re-export commonly used types for backward compatibility
export type {
  ReportEntry15 as FinancialTransaction,
  AmountAndCurrencyExchange4 as FXConversion,
};