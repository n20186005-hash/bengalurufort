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
