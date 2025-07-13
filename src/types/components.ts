import React from 'react';
import { DateRange, CurrencyCode, TransactionType, RiskLevel, ReconciliationStatus } from './financial';

export interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType<{ size?: number }>;
  loading?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export interface FilterConfig {
  dateRange: DateRange;
  currencies: CurrencyCode[];
  transactionTypes: TransactionType[];
  riskLevels: RiskLevel[];
  reconciliationStatus: ReconciliationStatus[];
  amountRange: {
    min: number;
    max: number;
  };
  searchText?: string;
}

export interface ExportConfig {
  format: 'CSV' | 'EXCEL' | 'PDF' | 'JSON';
  includeMetadata: boolean;
  dateRange?: DateRange;
  filters?: FilterConfig;
  columns?: string[];
}

export interface TableColumn<T> {
  accessor: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: T[keyof T], record: T) => React.ReactNode;
  width?: number;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size?: number }>;
  color?: string;
  confirmMessage?: string;
  disabled?: boolean;
}

export interface NotificationConfig {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  autoClose?: boolean;
  duration?: number;
}

export interface ModalConfig {
  title: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface LayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  navbar?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error;
  errorMessage?: string;
  retry?: () => void;
}