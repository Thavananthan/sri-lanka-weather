import type { ThemeMode } from '../store/appStore';
import { APP_NAME } from '../config/constants';
import { useAppStore } from '../store/appStore';

interface Props {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdatedText: string | null;
}

const NEXT_THEME: Record<ThemeMode, ThemeMode> = { system: 'light', light: 'dark', dark: 'system' };
const THEME_ICON: Record<ThemeMode, string> = { system: '🖥️', light: '☀️', dark: '🌙' };

export function Header({ onRefresh, isRefreshing, lastUpdatedText }: Props) {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <header className="app-header">
      <div className="app-header__title">
        <h1>{APP_NAME}</h1>
        {lastUpdatedText && <p className="muted small">Updated {lastUpdatedText} · Asia/Colombo</p>}
      </div>
      <div className="app-header__actions">
        <button
          type="button"
          className="icon-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh weather"
          title="Refresh"
        >
          <span className={isRefreshing ? 'spin' : undefined} aria-hidden="true">🔄</span>
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setTheme(NEXT_THEME[theme])}
          aria-label={`Theme: ${theme}. Switch theme`}
          title={`Theme: ${theme}`}
        >
          <span aria-hidden="true">{THEME_ICON[theme]}</span>
        </button>
      </div>
    </header>
  );
}
