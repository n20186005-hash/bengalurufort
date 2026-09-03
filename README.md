# Bengaluru Fort Visitor Guide / ಬೆಂಗಳೂರು ಕೋಟೆ ಪ್ರವಾಸಿ ಮಾರ್ಗದರ್ಶಿ

ಸ್ವತಂತ್ರ, ಲಾಭರಹಿತ Bengaluru Fort visitor-information project. Default interface language is Kannada (`/`); English is available at `/en/`. Both languages share the same locally served assets and Cookie consent preference.

## Technology

- Astro 7.2.4
- Tailwind CSS 4.3.3 + `@tailwindcss/vite` 4.3.3
- TypeScript 6.0.3 with `@astrojs/check` 0.9.10
- pnpm 11.25.0
- Node.js 24.20.0 LTS
- Wrangler 4.128.0 / Cloudflare Workers Static Assets
- No database, login or CMS

## Language routes

- Kannada home: `/`
- English home: `/en/`
- Kannada legal pages: `/privacy/`, `/terms/`, `/cookies/`
- English legal pages: `/en/privacy/`, `/en/terms/`, `/en/cookies/`

The header includes a Kannada ↔ English switch. Stable section anchors are shared across languages: `#history`, `#stories`, `#visit`, `#transport`, `#facilities`, `#weather`, `#nearby`, `#faq`, `#map`.

## Production domain — one configuration point

Set the production origin only in `astro.config.mjs` at `const SITE = ''` and rebuild. When left empty, the project is designed to build without inventing a placeholder domain: absolute canonical/OG URL tags are omitted or gracefully downgraded and the sitemap integration stays disabled. Once a real domain is configured, canonical URLs, Open Graph URLs, JSON-LD URLs, robots sitemap discovery and the generated sitemap derive from `Astro.site`.

## Verification commands

```bash
rm -rf node_modules
CI=1 corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm audit:source
```

`pnpm build` runs `scripts/verify-build.mjs` after Astro. The verifier checks required local JPEG assets, forbidden placeholder/extension URLs and sitemap rules.

## Cloudflare Workers

```bash
pnpm deploy
```

`wrangler.jsonc` publishes the static `dist/` directory through Cloudflare Workers Static Assets.

## Images

Runtime page markup references only local files under `public/images/`. Photographer, licence and source details are recorded in `PHOTO_SOURCES.md` and repeated on the attraction page. Do not remove attribution when publishing CC BY-SA images.

The four local JPEGs are already compressed (progressive mozjpeg, longest edges 1600/1920 px; total ≈ 0.87 MB). Re-run the optimisation any time originals are replaced:

```bash
pnpm optimize:images   # sharp-based; needs a local sharp install (pnpm add -D sharp)
```

## Weather module

The `#weather` section (WeatherSection.astro) is bilingual and shows three season advisory cards plus a live widget (current conditions + seven-day forecast). Because the site is a fully static Cloudflare deployment, the widget fetches the free, keyless Open-Meteo API from the visitor’s browser (fort coordinates only, 30-minute local cache, graceful fallback, `<noscript>` note). No server, key or cookies are involved. See the privacy pages for the user-facing disclosure.

## GA4 and consent

Measurement ID: `G-HXM22WWPKP`. Analytics is opt-in: the Google Analytics loader is not added until the visitor enables analytics on the Cookie Settings page. Consent is shared by Kannada and English routes through localStorage key `bengaluru-fort-cookie-preferences`.
