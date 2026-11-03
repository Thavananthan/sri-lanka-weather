# Sri Lanka Weather

Real-time weather for Sri Lanka, built with React, TypeScript and Vite. Data comes from
[Open-Meteo](https://open-meteo.com/), which needs no API key.

## Features
- Current conditions: temperature, feels-like, humidity, wind speed and direction, precipitation, and weather icons
- 24-hour hourly forecast and 7-day daily forecast (Asia/Colombo time)
- City search (Open-Meteo geocoding, Sri Lanka only) and GPS "Use my location"
- Popular cities pre-loaded, with favorites saved to localStorage
- Auto-refresh every 10 minutes, refresh on return to the app, pull-to-refresh and a refresh button
- Light, dark and system themes; responsive layout; loading and error states

## Getting started
Requires Node.js 20.19 or newer (22 recommended).

```bash
npm ci
npm run dev        # http://localhost:5173
```

## Scripts
| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript project check |
| `npm test` | Unit tests (Vitest) |
| `npm run build` | Production build into `dist/` |
| `npm run ci` | Lint, typecheck, test and build, the same gate CI runs |

## Project layout
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full design. The short version:

- `src/services/weather/` holds the weather providers. Open-Meteo is primary, and `withFallback` lets you add OpenWeatherMap later.
- `src/components/` holds presentational components: `CurrentWeather`, `HourlyForecast`, `DailyForecast`, `CitySearch`, `LocationPicker`, `Header`, `StateViews`.
- `src/hooks/useWeather.ts` handles loading, auto-refresh and cancellation.

## Deployment
Pushes to `main` deploy to GitHub Pages through `.github/workflows/deploy.yml`.
Enable it once under **Settings → Pages → Source: GitHub Actions**.

## Attribution
Weather data by [Open-Meteo.com](https://open-meteo.com/) (CC BY 4.0).
