// Bengaluru Fort Bengaluru — Visitor Guide: edge function for the live weather module.
// It fetches the forecast server-side and caches it at the Cloudflare edge, so
// the browser only ever talks to this site's own /api/weather endpoint.

const LAT = 12.962802;
const LON = 77.573311;
const TIMEZONE = 'Asia/Kolkata';

function buildUrl(): string {
  const params = new URLSearchParams({
    latitude: String(LAT),
    longitude: String(LON),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max',
    timezone: TIMEZONE,
    forecast_days: '7'
  });
  return 'https://api.open-meteo.com/v1/forecast?' + params.toString();
}

async function handleWeather(): Promise<Response> {
  try {
    const upstream = await fetch(buildUrl(), {
      cf: { cacheTtl: 600, cacheEverything: true }
    } as any);
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: 'unavailable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    const data = await upstream.json();
    const headers = new Headers();
    headers.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('Cache-Control', 'public, max-age=600, s-maxage=600');
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ error: 'unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const DOMAIN = 'bengalurufort.com';
    // Consolidate URL variants seen in Search Console (www/non-www, http/https)
    // onto the single canonical non-www HTTPS origin, so ranking signals don't split.
    if (host === 'www.' + DOMAIN) {
      const target = new URL(request.url);
      target.hostname = DOMAIN;
      return Response.redirect(target.href, 301);
    }
    if (host === DOMAIN && request.headers.get('x-forwarded-proto') === 'http') {
      const target = new URL(request.url);
      target.protocol = 'https:';
      return Response.redirect(target.href, 301);
    }
    if (url.pathname === '/api/weather') {
      return handleWeather();
    }
    // Everything else is served from the static build assets.
    return env.ASSETS.fetch(request);
  }
};
