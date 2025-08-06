import { apiClient } from '../lib/api';
import type { ItemLocation } from '@shared/schema';
import { useEffect, useState } from 'react';
import { useDatabase } from '../context/DatabaseContext.tsx';

type Stock = ItemLocation;

const ERR_STOCKS_LOAD = 'Failed to load item locations';

const db_getStocks = async () => {
  return (await apiClient.getItemLocations()) as Stock[];
};

function useStocks() {
  const { dbOperation } = useDatabase();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await dbOperation<Stock[]>(db_getStocks, setStocks, setError, ERR_STOCKS_LOAD);
      setIsLoading(false);
    })();
  }, [dbOperation]);

  const refreshStocks = async () => {
    await dbOperation<Stock[]>(db_getStocks, setStocks, setError, ERR_STOCKS_LOAD);
  };

  return { stocks, error, isLoading, refreshStocks };
}

export default useStocks;
