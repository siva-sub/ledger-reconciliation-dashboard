import { useQuery } from '@tanstack/react-query';
import { dataProcessor } from '@/services/dataProcessor';

export const useETLData = () => {
  const {
    data: etlPipelines,
    isLoading: isLoadingPipelines,
    error: pipelinesError
  } = useQuery({
    queryKey: ['etl-pipelines'],
    queryFn: () => dataProcessor.loadETLData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => dataProcessor.loadTransactions(),
    staleTime: 5 * 60 * 1000,
  });

  const metrics = transactions ? dataProcessor.calculateMetrics(transactions) : null;

  return {
    etlPipelines: etlPipelines || [],
    transactions: transactions || [],
    metrics,
    isLoading: isLoadingPipelines || isLoadingTransactions,
    error: pipelinesError || transactionsError,
  };
};