import { useEffect, useRef, useState } from 'react';

const TRIGGER_DISTANCE = 70;
const MAX_PULL = 120;

/**
 * Touch pull-to-refresh for the page. Only activates when the page is scrolled to the top.
 * Returns the current pull distance (for the indicator) and whether a refresh is pending.
 */
export function usePullToRefresh(onRefresh: () => Promise<void> | void, enabled = true) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    const setPull = (value: number) => {
      pullRef.current = value;
      setPullDistance(value);
    };

    const onTouchStart = (e: TouchEvent) => {
      startY.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0 || window.scrollY > 0) {
        setPull(0);
        return;
      }
      setPull(Math.min(delta * 0.5, MAX_PULL));
    };

    const onTouchEnd = async () => {
      const shouldRefresh = pullRef.current >= TRIGGER_DISTANCE;
      startY.current = null;
      setPull(0);
      if (!shouldRefresh) return;
      setIsRefreshing(true);
      try {
        await onRefreshRef.current();
      } finally {
        setIsRefreshing(false);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled]);

  return {
    pullDistance,
    isRefreshing,
    isReady: pullDistance >= TRIGGER_DISTANCE,
  };
}
