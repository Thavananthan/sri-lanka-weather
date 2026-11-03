import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';

/** Applies the chosen theme as data-theme on <html>, following the OS setting when mode is "system". */
export function useApplyTheme() {
  const theme = useAppStore((s) => s.theme);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
  }, [resolved]);

  return resolved;
}
