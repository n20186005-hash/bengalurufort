# Bengaluru Fort Website — Delivery Manifest

This archive contains the complete current project source for the Bengaluru Fort bilingual visitor guide.

## Included

- Astro + Tailwind CSS + TypeScript project source
- Kannada default site (`/`)
- English site (`/en/`)
- Kannada and English privacy, terms and cookie settings pages
- Header/footer/logo components
- Local SVG logo and favicon set (SVG, 16px, 32px, 180px)
- Google Maps embed configuration in the attraction pages
- GA4 consent-gated integration
- TouristAttraction and FAQPage JSON-LD
- `astro.config.mjs`, `wrangler.jsonc`, `.node-version`, `package.json`
- `pnpm-lock.yaml`
- Source/audit scripts
- `SOURCES.md` and `PHOTO_SOURCES.md`

## Photo asset note

The page source expects these local JPEG paths:

- `public/images/bengaluru-fort-courtyard.jpg`
- `public/images/bengaluru-fort-panorama.jpg`
- `public/images/bengaluru-fort-arch.jpg`
- `public/images/bengaluru-fort-spiked-gate.jpg`

The verified source pages, authors, licences and direct download redirects are documented in `PHOTO_SOURCES.md`.

## 2026-09-03 content & performance round

- **Image compression** (`scripts/optimize-images.mjs`, runnable via `pnpm optimize:images`): the four local JPEGs were re-encoded (sharp + mozjpeg, progressive) with longest edges capped at 1600 px (courtyard, arch) and 1920 px (panorama); the spiked-gate photo stayed at its native 958 px width. Same filenames and aspect ratios are kept; each file was strictly smaller after the run. Measured result: courtyard 0.28 MB, arch 0.27 MB, panorama 0.20 MB, spiked gate 0.12 MB — 0.87 MB for all four images together. The script reads/writes through Buffers so it also runs in sandboxed shells; a local sharp install is preferred (the loader also probes a sibling repo’s `node_modules`).
- **New `#facilities` section** (`src/components/FacilitiesSection.astro`, bilingual, placed between Transport and Nearby): nine type-only cards — toilets, drinking water, parking, food & refreshments, shops/daily needs, accommodation, fuel & EV charging, ATMs & cash, comfort/access — plus an explicit neutrality note (no business names, brands or endorsements). Honesty: e.g. no reliable public toilet is claimed inside the monument.
- **New `#weather` section** (`src/components/WeatherSection.astro`, bilingual, after Facilities): three season advisory cards (SSR, always visible) + a live widget (current conditions and a seven-day forecast). Data: Open-Meteo (free, keyless) at the fort’s coordinates (12.962875, 77.575956), fetched in the visitor’s browser with a 30-minute local cache, graceful error fallback, `<noscript>` note and IMD disclaimer. This site is fully static (Cloudflare Workers static assets), so the widget is intentionally a client-side fetch, not a build-time bake.
- **New `#stories` section** (`src/components/StoriesSection.astro`, bilingual, between the architecture band and Transport): five history/legend cards with kind badges (legend / documented / monument note) covering the “Benda Kaalu Ooru” name tale (flagged as folk memory), the 1537 founding, the 1761 stone rebuild, the 21 March 1791 siege, and the listed name “Old Dungeon Fort and Gates” incl. the reported 2012 Namma Metro cannon find.
- **Enrichment**: FAQ grew from 6 to 9 questions in both languages (toilets/food/ATMs nearby, photography, fort vs Tipu’s Summer Palace) — FAQPage JSON-LD mirrors the visible list; nearby Kote Venkataramana temple card now gives its 1689 origin; header nav gained Stories and Facilities anchors; meta descriptions now mention facilities and live weather; footer shows a “last content review: 3 September 2026” line in both languages.
- **Privacy pages** (both languages) gained a “Weather data” paragraph explaining the Open-Meteo client-side request (fort coordinates only, no user location, ~30-minute browser cache, Open-Meteo’s own policy applies).
- Verified locally: JSON extraction/`vm.Script` syntax pass on the weather bundle; `read_lints` reports only the two pre-existing hero-`fetchpriority` typing notes (they predate this round and do not affect `astro build`). A full `pnpm install && pnpm run build` should be run on the deployment machine; the sandbox blocked network installs.

## 2026-09-03 SEO entity binding, live domain & PWA round

- **Domain bound**: `astro.config.mjs` `SITE = 'https://bengalurufort.com'`; `@astrojs/sitemap` now enabled; `robots.txt.ts` advertises `sitemap-index.xml`; canonical/OG/JSON-LD URLs all derive from `Astro.site`. The required `.node-version`/`wrangler.jsonc` are unchanged.
- **TouristAttraction JSON-LD** (both languages): added stable `@id` `…/#attraction`, `hasMap` (the Google Maps share URL) and `image` list; geometry corrected to the monument pin at 12.962802 / 77.573311 (matches the supplied XH7G+49C plus code and the new Google Maps embed centre); `name` set to official English “Bengaluru Fort” with Kannada `ಬೆಂಗಳೂರು ಕೋಟೆ` and ASI “Old Dungeon Fort and Gates” as `alternateName`; `sameAs` now includes Karnataka Tourism plus the district administration and ASI list; rating 4.0 (26,832), `isAccessibleForFree`, NAP and opening-hours unchanged.
- **TDK & H1**: Kannada/English titles and meta descriptions rewritten to bind full name + city (+ Karnataka/India, postal code and nearby landmarks); English H1 now reads “Bengaluru Fort … in Bengaluru · Karnataka · India”; visible entity strip under each hero adds a geographic breadcrumb (`Fort › Bengaluru › Karnataka › India`) and a one-paragraph semantic equivalence of the Kannada and English names.
- **Content additions (no removals)**: “nearby cluster” sentence in `#nearby` (Tipu Sultan’s Summer Palace + Kote Venkataramana Swamy Temple); authoritative outbound links to Karnataka Tourism and Incredible India in the `#map` section; a “Primary official sources” list added to the evidence-led Sources block; privacy pages (both languages) gained an “Offline caching (service worker/PWA)” paragraph; hero `<img alt>` for English now names the monument, city, state and country.
- **PWA**: new `public/manifest.webmanifest`, `public/sw.js` and generated `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png` (sourced from the existing 180 px apple-touch icon); `BaseLayout.astro` links the manifest, adds `og:image:alt`, `twitter:image` and Apple/mobile-web-app meta, and registers the service worker (localhost excluded).
- **Map embed locale fix**: the Kannada page iframe uses `kn` (not the Georgian `ka`) for the Maps interface language; place, coordinates and timestamp stay identical to the supplied embed.
- Verified locally: `read_lints` on all touched files still reports only the two pre-existing hero-`fetchpriority` typing notes; `node --check` passes for `sw.js`; `manifest.webmanifest` parses with its five icon entries. Full `pnpm install && pnpm build` remains to be run on a networked machine (sandbox blocks network installs).

## 2026-09-03 代码合规审计（避坑清单自动重建重核）

Automated audit rebuilt from the compliance checklist plus pending items. Machine evidence collected with a throwaway `node` audit script (deleted after the run) that parsed asset headers, counted page structures, scanned residuals and checked config wiring.

**Checklist results (all PASS unless noted):**

- **HTML/document**: `BaseLayout.astro:38` `<html lang={lang}>`; viewport without `maximum-scale`; robots meta per page via new `robots` prop (default output unchanged `index,follow,max-image-preview:large`; 404 emits `noindex,follow`); canonical/`og:image`/`twitter:image` all absolute from `Astro.site`; `og:image:alt` bilingual default present; theme-color, manifest, Apple meta, SW register in head.
- **H1 / media**: both home pages have exactly one H1 — kn `ಬೆಂಗಳೂರು ಕೋಟೆ` + new sub-line `ಬೆಂಗಳೂರು · ಕರ್ನಾಟಕ · ಭಾರತ` (now symmetric with en) — 4 `<img>` per home page, 0 without `alt`, all four JPEGs exist and pass the JPEG/≥20KB check (0.28/0.20/0.27/0.12 MB); map iframe is lazy + `strict-origin-when-cross-origin` + title, Kannada page uses `!3m2!1skn` (no Georgian `ka`).
- **JSON-LD (both languages)**: TouristAttraction has `@id attractionId`, `hasMap`, `image`, `geo` 12.962802/77.573311, `aggregateRating` 4.0×26,832, `isAccessibleForFree`, `inLanguage`; FAQPage `mainEntity` is generated from the same visible `faqItems` array (9 items → 9 `<details>` at render time, schema mirrors the visible text).
- **Legal pages**: 6/6 present, each with correct `alternatePath` and matching `lang` (`kn` vs `lang="en-IN"`); last-updated labels bilingual (ಕೊನೆಯ ಪರಿಷ್ಕರಣೆ / Last updated).
- **404 (was MISSING — fixed)**: `src/pages/404.astro` added (`prerender`, `robots="noindex,follow"`, bilingual Kannada-first content + links to `/` and `/en/`); `wrangler.jsonc` already declared `not_found_handling: "404-page"` so `dist/404.html` is now produced by the build.
- **GA4**: `G-HXM22WWPKP` appears only as the loader ID in `BaseLayout` (`:75`) plus user-facing disclosures in `/en/cookies/` and `/en/privacy/` and README; loader is consent-gated (localStorage key `bengaluru-fort-cookie-preferences`, `anonymize_ip`, dynamic gtag) — no ad/cookie tokens anywhere else.
- **PWA**: icons verified byte-level — favicon-16 16×16, favicon-32 32×32, apple-touch 180×180, icon-192 192×192, icon-512 and maskable-512 512×512 — matching manifest entries; `sw.js` versioned cache, install/activate/fetch handlers, offline `/` fallback, same-origin guard.
- **Residual scan**: no `adsbygoogle`/`ca-pub-`/placeholder/loremflickr/TODO/`example.com`/`chrome-extension://` in source; the only `localhost` hits are the intentional SW guard (`BaseLayout:99`) and dev docs.
- **Sitemap/robots**: `SITE = https://bengalurufort.com` with sitemap integration enabled; `robots.txt.ts` emits `Sitemap: …/sitemap-index.xml` only when `site` is present.
- **Pending (cannot run offline)**: full `pnpm install && pnpm build` still needs a networked machine; `verify-build.mjs` will then check `dist/` images, sitemap-0.xml URL origin and the “no invented lastmod” rule. Pre-existing hero-`fetchpriority` TS typing notes on the two home pages remain (cosmetic, no build impact).

## 2026-09-03 CI 构建修复（pnpm 11 ignored-builds）

First CI build failed at the dependency step with `[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: esbuild@0.28.2` — pnpm 11 by default refuses postinstall scripts and the build platform treated that state as a fatal install error. Fix, attempt 2 (final): pnpm ≥ 10 no longer reads the `"pnpm"` field in `package.json` (`The "pnpm" field in package.json is no longer read by pnpm`), so esbuild is approved via the new home for settings — `pnpm-workspace.yaml`:

```yaml
onlyBuiltDependencies:
  - esbuild
```

The same value is mirrored in `pnpm-lock.yaml` → `settings.onlyBuiltDependencies` so the platform’s `pnpm install --frozen-lockfile` stays in sync (no resolution change, lockfile importers untouched). `package.json` was left clean (no `pnpm` key). Next step: re-trigger the CI build.
