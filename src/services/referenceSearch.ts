/**
 * Smart Reference Search Service
 * Provides intelligent search and matching for transaction references to aid reconciliation
 * Based on common banking reference patterns and reconciliation pain points
 */

import { FinancialTransaction } from '@/types';

export interface ReferencePattern {
  type: 'INVOICE' | 'PO' | 'CONTRACT' | 'BANK_REF' | 'CUSTOMER_REF' | 'BATCH' | 'UNKNOWN';
  value: string;
  confidence: number;
  description: string;
}

export interface TransactionMatch {
  transaction: FinancialTransaction;
  matchReason: string;
  confidence: number;
  matchType: 'EXACT' | 'PARTIAL' | 'PATTERN' | 'FUZZY';
}

export interface SearchResult {
  query: string;
  patterns: ReferencePattern[];
  matches: TransactionMatch[];
  suggestions: string[];
  searchTime: number;
}

/**
 * Reference pattern matchers using common banking reference formats
 */
const REFERENCE_PATTERNS = [
  {
    type: 'INVOICE' as const,
    regex: /(?:INV|INVOICE)[-\s]*(\w{2,20})/gi,
    description: 'Invoice reference pattern'
  },
  {
    type: 'PO' as const,
    regex: /(?:PO|P\.O\.|PURCHASE[-\s]ORDER)[-\s]*(\w{2,20})/gi,
    description: 'Purchase order reference pattern'
  },
  {
    type: 'CONTRACT' as const,
    regex: /(?:CNT|CONTRACT|CONTR)[-\s]*(\w{2,20})/gi,
    description: 'Contract reference pattern'
  },
  {
    type: 'BANK_REF' as const,
    regex: /\b(\d{8,})\b/g,
    description: 'Bank reference number (8+ digits)'
  },
  {
    type: 'CUSTOMER_REF' as const,
    regex: /(?:REF|REFERENCE|#)[-\s]*(\w{3,20})/gi,
    description: 'Customer reference pattern'
  },
  {
    type: 'BATCH' as const,
    regex: /(?:BATCH|BTH|B)[-\s]*(\d{3,10})/gi,
    description: 'Batch processing reference'
  }
];

/**
 * Common customer reference formats used in enterprise environments
 */
const CUSTOMER_PATTERNS = [
  // SAP reference formats
  /\b(\d{10})\b/g, // SAP document numbers
  /\b[A-Z]{2}\d{8}\b/g, // Two letters + 8 digits
  
  // Oracle reference formats  
  /\b\d{4}-\d{4}-\d{4}\b/g, // XXXX-XXXX-XXXX format
  
  // Common enterprise formats
  /\b[A-Z]{3}\d{6}\b/g, // Three letters + 6 digits
  /\b\d{4}[A-Z]{2}\d{4}\b/g, // NNNNLLNNNN format
];

export class ReferenceSearchService {
  
  /**
   * Extract reference patterns from transaction description
   */
  extractPatterns(description: string): ReferencePattern[] {
    const patterns: ReferencePattern[] = [];
    
    for (const pattern of REFERENCE_PATTERNS) {
      const matches = Array.from(description.matchAll(pattern.regex));
      
      for (const match of matches) {
        patterns.push({
          type: pattern.type,
          value: match[1] || match[0],
          confidence: this.calculatePatternConfidence(pattern.type, match[0]),
          description: pattern.description
        });
      }
    }
    
    // Extract customer-specific patterns
    for (const customerPattern of CUSTOMER_PATTERNS) {
      const matches = Array.from(description.matchAll(customerPattern));
      
      for (const match of matches) {
        patterns.push({
          type: 'CUSTOMER_REF',
          value: match[0],
          confidence: 0.7,
          description: 'Enterprise reference format'
        });
      }
    }
    
    // If no patterns found, mark as unknown
    if (patterns.length === 0) {
      patterns.push({
        type: 'UNKNOWN',
        value: description.substring(0, 50),
        confidence: 0.1,
        description: 'No recognizable reference pattern'
      });
    }
    
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Search for related transactions based on reference patterns
   */
  searchRelatedTransactions(
    query: string, 
    transactions: FinancialTransaction[]
  ): SearchResult {
    const startTime = performance.now();
    
    const queryPatterns = this.extractPatterns(query);
    const matches: TransactionMatch[] = [];
    const suggestions: string[] = [];
    
    for (const transaction of transactions) {
      const transactionPatterns = this.extractPatterns(transaction.description);
      
      // Exact reference match
      for (const queryPattern of queryPatterns) {
        for (const txPattern of transactionPatterns) {
          if (queryPattern.value.toLowerCase() === txPattern.value.toLowerCase()) {
            matches.push({
              transaction,
              matchReason: `Exact ${queryPattern.type} match: ${queryPattern.value}`,
              confidence: 0.95,
              matchType: 'EXACT'
            });
          }
        }
      }
      
      // Partial matches
      if (transaction.description.toLowerCase().includes(query.toLowerCase())) {
        const alreadyMatched = matches.some(m => m.transaction.id === transaction.id);
        if (!alreadyMatched) {
          matches.push({
            transaction,
            matchReason: `Description contains: "${query}"`,
            confidence: 0.7,
            matchType: 'PARTIAL'
          });
        }
      }
      
      // Amount-based matching
      const queryAmount = this.extractAmount(query);
      if (queryAmount && Math.abs(transaction.amount.original - queryAmount) < 0.01) {
        const alreadyMatched = matches.some(m => m.transaction.id === transaction.id);
        if (!alreadyMatched) {
          matches.push({
            transaction,
            matchReason: `Amount match: ${transaction.amount.currency} ${queryAmount}`,
            confidence: 0.8,
            matchType: 'PATTERN'
          });
        }
      }
      
      // Counterparty matching
      if (transaction.counterparty.name.toLowerCase().includes(query.toLowerCase())) {
        const alreadyMatched = matches.some(m => m.transaction.id === transaction.id);
        if (!alreadyMatched) {
          matches.push({
            transaction,
            matchReason: `Counterparty match: ${transaction.counterparty.name}`,
            confidence: 0.85,
            matchType: 'PATTERN'
          });
        }
      }
    }
    
    // Generate search suggestions
    suggestions.push(...this.generateSearchSuggestions(queryPatterns, transactions));
    
    const searchTime = performance.now() - startTime;
    
    return {
      query,
      patterns: queryPatterns,
      matches: matches.sort((a, b) => b.confidence - a.confidence).slice(0, 20), // Top 20 matches
      suggestions: [...new Set(suggestions)].slice(0, 10), // Top 10 unique suggestions
      searchTime
    };
  }
  
  /**
   * Calculate confidence score for a pattern match
   */
  private calculatePatternConfidence(type: ReferencePattern['type'], value: string): number {
    switch (type) {
      case 'INVOICE':
        return value.length >= 6 ? 0.9 : 0.7;
      case 'PO':
        return value.length >= 4 ? 0.85 : 0.6;
      case 'BANK_REF':
        return value.length >= 10 ? 0.95 : 0.8;
      case 'CONTRACT':
        return 0.8;
      case 'CUSTOMER_REF':
        return value.length >= 5 ? 0.75 : 0.5;
      case 'BATCH':
        return 0.7;
      default:
        return 0.3;
    }
  }
  
  /**
   * Extract amount from search query
   */
  private extractAmount(query: string): number | null {
    const amountMatch = query.match(/\b(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\b/);
    if (amountMatch) {
      return parseFloat(amountMatch[1].replace(/,/g, ''));
    }
    return null;
  }
  
  /**
   * Generate intelligent search suggestions based on transaction patterns
   */
  private generateSearchSuggestions(
    queryPatterns: ReferencePattern[], 
    transactions: FinancialTransaction[]
  ): string[] {
    const suggestions: string[] = [];
    
    // Suggest variations of detected patterns
    for (const pattern of queryPatterns) {
      if (pattern.type === 'INVOICE') {
        suggestions.push(`${pattern.value}*`, `*${pattern.value}`, `INV-${pattern.value}`);
      } else if (pattern.type === 'PO') {
        suggestions.push(`PO-${pattern.value}`, `P.O.${pattern.value}`);
      }
    }
    
    // Suggest common counterparty names
    const frequentCounterparties = this.getFrequentCounterparties(transactions);
    suggestions.push(...frequentCounterparties.slice(0, 3));
    
    // Suggest recent transaction patterns
    const recentPatterns = this.getRecentReferencePatterns(transactions);
    suggestions.push(...recentPatterns.slice(0, 3));
    
    return suggestions;
  }
  
  /**
   * Get most frequent counterparties for suggestions
   */
  private getFrequentCounterparties(transactions: FinancialTransaction[]): string[] {
    const counterpartyCounts = new Map<string, number>();
    
    for (const transaction of transactions) {
      const name = transaction.counterparty.name;
      counterpartyCounts.set(name, (counterpartyCounts.get(name) || 0) + 1);
    }
    
    return Array.from(counterpartyCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }
  
  /**
   * Extract recent reference patterns for suggestions
   */
  private getRecentReferencePatterns(transactions: FinancialTransaction[]): string[] {
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.valueDate).getTime() - new Date(a.valueDate).getTime())
      .slice(0, 50); // Last 50 transactions
    
    const patterns = new Set<string>();
    
    for (const transaction of recentTransactions) {
      const extractedPatterns = this.extractPatterns(transaction.description);
      for (const pattern of extractedPatterns) {
        if (pattern.confidence > 0.7 && pattern.value.length > 3) {
          patterns.add(pattern.value);
        }
      }
    }
    
    return Array.from(patterns);
  }
  
  /**
   * Advanced fuzzy search for complex reconciliation scenarios
   */
  fuzzySearch(
    query: string, 
    transactions: FinancialTransaction[], 
    threshold: number = 0.6
  ): TransactionMatch[] {
    const matches: TransactionMatch[] = [];
    
    for (const transaction of transactions) {
      const similarity = this.calculateStringSimilarity(
        query.toLowerCase(), 
        transaction.description.toLowerCase()
      );
      
      if (similarity >= threshold) {
        matches.push({
          transaction,
          matchReason: `Fuzzy match (${Math.round(similarity * 100)}% similarity)`,
          confidence: similarity,
          matchType: 'FUZZY'
        });
      }
    }
    
    return matches.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
  
  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  /**
   * Search for duplicate or near-duplicate transactions
   */
  findDuplicates(
    transactions: FinancialTransaction[], 
    toleranceHours: number = 24
  ): Array<{ original: FinancialTransaction; duplicates: FinancialTransaction[] }> {
    const duplicateGroups: Array<{ original: FinancialTransaction; duplicates: FinancialTransaction[] }> = [];
    const processed = new Set<string>();
    
    for (const transaction of transactions) {
      if (processed.has(transaction.id)) continue;
      
      const duplicates = transactions.filter(other => {
        if (other.id === transaction.id || processed.has(other.id)) return false;
        
        // Same amount and currency
        const sameAmount = Math.abs(transaction.amount.original - other.amount.original) < 0.01 &&
                          transaction.amount.currency === other.amount.currency;
        
        // Similar date (within tolerance)
        const date1 = new Date(transaction.valueDate).getTime();
        const date2 = new Date(other.valueDate).getTime();
        const hoursDiff = Math.abs(date1 - date2) / (1000 * 60 * 60);
        const similarDate = hoursDiff <= toleranceHours;
        
        // Similar description or counterparty
        const descSimilarity = this.calculateStringSimilarity(
          transaction.description, 
          other.description
        );
        const similarDescription = descSimilarity > 0.8;
        
        const sameCounterparty = transaction.counterparty.name === other.counterparty.name;
        
        return sameAmount && similarDate && (similarDescription || sameCounterparty);
      });
      
      if (duplicates.length > 0) {
        duplicateGroups.push({ original: transaction, duplicates });
        processed.add(transaction.id);
        duplicates.forEach(dup => processed.add(dup.id));
      }
    }
    
    return duplicateGroups;
  }
}

export const referenceSearchService = new ReferenceSearchService();