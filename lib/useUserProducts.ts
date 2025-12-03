import { useState, useEffect, useCallback } from 'react';
import { getUserProducts, UserProductsResponse } from './api';

interface UseUserProductsResult {
  purchasedProducts: string[];
  lockedProducts: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUserProducts(email: string | null): UseUserProductsResult {
  const [data, setData] = useState<UserProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!email) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserProducts(email);
      
      if (result) {
        setData(result);
      } else {
        setError('Failed to load product access');
      }
    } catch (err) {
      setError('Error checking product access');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const handleFocus = () => {
      if (email) {
        fetchProducts();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [email, fetchProducts]);

  return {
    purchasedProducts: data?.purchasedProducts || [],
    lockedProducts: data?.lockedProducts || [],
    isLoading,
    error,
    refetch: fetchProducts
  };
}
