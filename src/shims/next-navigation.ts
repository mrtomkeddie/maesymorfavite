import React from 'react'
import { useLocation, useNavigate, useParams as rrUseParams } from 'react-router-dom';

// Minimal shim for next/navigation to satisfy builds in Vite SPA.
// Only implements the parts our reused components need. No Next.js RSC features.

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, { replace: true }),
    back: () => window.history.back(),
    refresh: () => window.location.reload(),
    prefetch: async (_url: string) => {},
  } as const;
}

export function usePathname() {
  const { pathname } = useLocation();
  return pathname;
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>() {
  // Match Next.js signature loosely by returning a record of params
  return rrUseParams() as unknown as T;
}

export function useSearchParams() {
  const { search } = useLocation();
  // Return URLSearchParams compatible with Next's ReadonlyURLSearchParams for basic get()/toString()
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export function notFound(): never {
  // In Next.js, this triggers the not-found boundary. Here, throw to fail fast.
  throw new Error('notFound: This Next.js-only API was called in the SPA build.');
}