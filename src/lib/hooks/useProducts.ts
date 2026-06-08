import useSWR from 'swr';
import type { Product } from '@/lib/types/product';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
});

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>('/api/products', fetcher);
  return {
    products: data,
    isLoading: isLoading || !data,
    isError: error,
    mutate,
  };
}
