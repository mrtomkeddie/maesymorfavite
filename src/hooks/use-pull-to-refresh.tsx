import { useEffect, useRef, useState, useCallback } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  canRefresh: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  enabled = true
}: UsePullToRefreshOptions) {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    canRefresh: false
  });

  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || state.isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    setState(prev => ({ ...prev, isPulling: true }));
  }, [enabled, state.isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !state.isPulling || state.isRefreshing) return;

    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      setState(prev => ({ ...prev, isPulling: false, pullDistance: 0, canRefresh: false }));
      return;
    }

    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;

    if (deltaY > 0) {
      e.preventDefault();
      const pullDistance = Math.min(deltaY / resistance, threshold * 1.5);
      const canRefresh = pullDistance >= threshold;

      setState(prev => ({
        ...prev,
        pullDistance,
        canRefresh
      }));
    }
  }, [enabled, state.isPulling, state.isRefreshing, threshold, resistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !state.isPulling) return;

    setState(prev => ({ ...prev, isPulling: false }));

    if (state.canRefresh && !state.isRefreshing) {
      setState(prev => ({ ...prev, isRefreshing: true, pullDistance: threshold }));
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh failed:', error);
      } finally {
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          pullDistance: 0,
          canRefresh: false
        }));
      }
    } else {
      setState(prev => ({ ...prev, pullDistance: 0, canRefresh: false }));
    }
  }, [enabled, state.isPulling, state.canRefresh, state.isRefreshing, onRefresh, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enabled]);

  const bindContainer = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
  }, []);

  return {
    ...state,
    bindContainer,
    pullIndicatorStyle: {
      transform: `translateY(${state.pullDistance}px)`,
      opacity: Math.min(state.pullDistance / threshold, 1)
    }
  };
}

export default usePullToRefresh;