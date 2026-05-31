import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// ── Crypto market data ──────────────────────────────────────
export function useMarkets(currency = 'usd', page = 1) {
  return useQuery({
    queryKey: ['markets', currency, page],
    queryFn: () => api.get(`/crypto/markets?currency=${currency}&page=${page}&per_page=50`).then(r => r.data),
    refetchInterval: 60_000,
  });
}

export function useCoinHistory(id, days = 7, currency = 'usd') {
  return useQuery({
    queryKey: ['history', id, days, currency],
    queryFn: () => api.get(`/crypto/history/${id}?days=${days}&currency=${currency}`).then(r => r.data),
    enabled: !!id,
    staleTime: 300_000,
  });
}

export function useCoinDetail(id) {
  return useQuery({
    queryKey: ['coin', id],
    queryFn: () => api.get(`/crypto/coin/${id}`).then(r => r.data),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useSearch(q) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => api.get(`/crypto/search?q=${encodeURIComponent(q)}`).then(r => r.data),
    enabled: q.length > 1,
    staleTime: 120_000,
  });
}

export function usePrices(ids, currency = 'usd') {
  return useQuery({
    queryKey: ['prices', ids, currency],
    queryFn: () => api.get(`/crypto/prices?ids=${ids}&currency=${currency}`).then(r => r.data),
    enabled: ids.length > 0,
    refetchInterval: 30_000,
  });
}

// ── Portfolio ───────────────────────────────────────────────
export function usePortfolio(userId) {
  return useQuery({
    queryKey: ['portfolio', userId],
    queryFn: () => api.get(`/portfolio/${userId}`).then(r => r.data),
    enabled: !!userId,
  });
}

export function useAddHolding(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (holding) => api.post(`/portfolio/${userId}/holding`, holding).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio', userId] }),
  });
}

export function useRemoveHolding(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (holdingId) => api.delete(`/portfolio/${userId}/holding/${holdingId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio', userId] }),
  });
}
