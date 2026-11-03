# Architecture

Sri Lanka Weather is a responsive, installable-style React + TypeScript single-page app.
It runs in any modern browser on phones, tablets and desktops, and can be wrapped later
with Capacitor if a native store build is needed.

## 1. Goals and constraints

| Area | Decision |
| --- | --- |
| Primary data | Open-Meteo forecast API (no key) |
| Geocoding | Open-Meteo geocoding API, biased to `countryCode=LK` |
| Timezone | All times rendered in `Asia/Colombo` (requested with `timezone=Asia/Colombo`) |
| Stack | React 19, TypeScript (strict), Vite, Zustand (persisted slice only) |
| Runtime deps | `react`, `react-dom`, `zustand`. No UI kit, no charting library, no router |
| Refresh | Auto every 10 min, on foreground return if stale, and pull-to-refresh |
| Hosting | GitHub Pages, deployed from `main` by GitHub Actions |

## 2. Layered structure

```
src/
├── config/          Static configuration: default cities, intervals, storage keys
├── types/           Provider-agnostic domain model (Location, WeatherBundle, ...)
├── services/        I/O boundary. No React imports here.
│   ├── http.ts            fetch + timeout + abort composition
│   ├── weather/
│   │   ├── types.ts       WeatherProvider contract
│   │   ├── openMeteo.ts   Open-Meteo provider: URL builder + pure mapper
│   │   ├── fallback.ts    withFallback(): ordered provider chain
│   │   └── index.ts       weatherService, the single entry point the app uses
│   └── geocoding/         City search
├── store/           Zustand store (favorites, selected city, theme), persisted
├── hooks/           React glue: useWeather, useGeolocation, usePullToRefresh, ...
├── components/      Presentational UI. Receive data via props.
├── utils/           Pure helpers: formatting, WMO code map
└── styles/          CSS variables for light/dark, responsive layout
```

Dependency direction is strictly downward: `components → hooks → services/store → types`.
Components never call `fetch`; services never import React.

## 3. Data flow

```
          ┌────────────┐   select    ┌──────────────┐
 user ──► │ CitySearch │ ──────────► │  appStore    │ (Zustand, persisted: favorites, selected, theme)
          │ LocationPk │             └──────┬───────┘
          └────────────┘                    │ selected Location
                                            ▼
                                   ┌────────────────┐   timer 10 min / visibility / pull / button
                                   │  useWeather    │ ◄──────────────────────────────────────────
                                   └──────┬─────────┘
                                          │ weatherService.getForecast(location, signal)
                                          ▼
                                   ┌────────────────┐   primary → fallback → …
                                   │ withFallback   │
                                   └──────┬─────────┘
                                          ▼
                                   ┌────────────────┐   raw JSON → WeatherBundle (pure)
                                   │ openMeteo      │
                                   └──────┬─────────┘
                                          ▼
                    CurrentWeather · HourlyForecast · DailyForecast
```

## 4. Key design points

### 4.1 Provider abstraction (fallback-ready)
Every source implements `WeatherProvider { id; getForecast(location, signal) }` and returns a
`WeatherBundle`. Adding OpenWeatherMap is a new file plus one line in `services/weather/index.ts`:

```ts
export const weatherService = withFallback([openMeteoProvider, openWeatherMapProvider]);
```

`withFallback` tries providers in order, logs and skips failures, and never falls through on
an aborted request. The UI is unaware of which provider answered; `bundle.source` tells you.

Mapping is split out as a pure function (`mapOpenMeteoResponse`) so provider changes are covered
by fixture tests without network access.

### 4.2 State
- **Persisted (Zustand `persist`, localStorage):** favorites, selected city, theme.
- **Not persisted:** weather data. It is cheap to refetch and must never be stale on cold start.
- Weather lives in `useWeather`, not the global store. Each result is tagged with its location key,
  so a city switch can never render the previous city's numbers.

### 4.3 Refresh strategy
| Trigger | Behaviour |
| --- | --- |
| Mount / city change | Full load; previous request is aborted |
| Every 10 min | Silent background refresh; cached data stays visible |
| Tab/app returns to foreground | Refresh only if data is older than 5 min |
| Pull-to-refresh (touch, at scroll top) | Refresh with spinner |
| Refresh button | Same as pull |

The UI re-renders every 30 s so the "Updated N min ago" label stays accurate.

### 4.4 Error and loading states
- Cold start: skeleton → content, or error card with "Try again".
- Failure with cached data: keep content and show a warning banner ("Showing the last successful update").
- GPS denied or unavailable: banner only. City search and chips keep working.
- Search failures are isolated to the search dropdown.
- Timeouts are enforced at 10 s via `AbortSignal.timeout`, combined with caller cancellation.

### 4.5 Time handling
Open-Meteo returns local wall-clock strings when `timezone` is given. The app keeps them as
strings and compares them lexically with the current Colombo time (`nowInColomboKey`). This avoids
`Date` parsing bugs across device timezones. Day labels use `Intl` with `timeZone: 'Asia/Colombo'`.

Caveat: GPS coordinates outside Sri Lanka still display Colombo time. This matches the requirement.
Making it dynamic would mean reading the `timezone` field from each response.

### 4.6 Theming and responsiveness
- Light, dark and system modes. The mode is stored and applied as `data-theme` on `<html>`.
- All colours are CSS variables. There are no hard-coded colours in components.
- Mobile first: single column. From 900 px, a sticky sidebar sits beside the content.
- Hourly forecast scrolls horizontally with scroll snap. Respects `prefers-reduced-motion`.

## 5. Quality gates
| Gate | Tool |
| --- | --- |
| Lint | ESLint flat config, typescript-eslint, react-hooks (incl. refs and effects rules), react-refresh |
| Types | `tsc -b` with `strict`, `noUnusedLocals`, `erasableSyntaxOnly` |
| Unit tests | Vitest + jsdom: mapper, URL builder, fallback chain, formatters, WMO map |
| Build | `vite build` with Asia/Colombo-safe base path |

## 6. CI/CD (GitHub Actions)
- `.github/workflows/ci.yml`: on every PR and push to `main`. Runs `npm ci`, lint, typecheck, tests, build, and uploads `dist` as an artifact.
- `.github/workflows/deploy.yml`: on push to `main`. Runs the same quality gate, builds with
  `VITE_BASE=/<repo-name>/`, and deploys to GitHub Pages.
- `.github/dependabot.yml`: weekly npm and Actions updates, with dev and React dependencies grouped.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions.**

## 7. Testing strategy
Unit tests cover the pure logic: mapping, formatting, WMO codes and fallback. Network I/O is not
mocked at the module level, which keeps tests fast. Next steps are a Playwright smoke test against
a recorded fixture, and component tests for the hooks with a mocked `weatherService`.

## 8. Roadmap
1. **OpenWeatherMap fallback:** add `services/weather/openWeatherMap.ts` and register it in `withFallback`. Needs `VITE_OWM_KEY`, and must be called from the browser or behind a proxy.
2. **Alerts:** map Open-Meteo weather codes and rainfall thresholds to advisories.
3. **Offline:** service worker with stale-while-revalidate for the last bundle.
4. **Historical or air-quality data:** new provider methods, same bundle pattern.
5. **Native packaging:** Capacitor wrapper if store distribution is needed. The code is unchanged.
