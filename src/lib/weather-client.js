import {validateWeather} from './weather.js';
export function initWeather(){

  const TIMEZONE = 'Asia/Kolkata';
  const root = document.getElementById('bengaluru-weather');
  const currentEl = document.getElementById('wx-current');
  const dailyEl = document.getElementById('wx-daily');
  const adviceBox = document.getElementById('wx-advice');
  if(!root||!currentEl||!dailyEl||!adviceBox)return;
  const lang = root.dataset.lang;
  const kn = lang !== 'en';

  // WMO weather code -> { group, label }
  const WMO = {
    0: ['sun', 'Clear sky', 'ಸ್ಪಷ್ಟ ಆಕಾಶ'],
    1: ['sun', 'Mostly clear', 'ಬಹುತೇಕ ಸ್ಪಷ್ಟ'],
    2: ['sunc', 'Partly cloudy', 'ಭಾಗಶಃ ಮೋಡ'],
    3: ['cloud', 'Overcast', 'ಮೋಡ ಕವಿದ ವಾತಾವರಣ'],
    45: ['fog', 'Fog', 'ಮಂಜು'],
    48: ['fog', 'Freezing fog', 'ಘನೀಭವನ ಮಂಜು'],
    51: ['drizzle', 'Light drizzle', 'ಲಘು ತುಂತುರು ಮಳೆ'],
    53: ['drizzle', 'Drizzle', 'ತುಂತುರು ಮಳೆ'],
    55: ['drizzle', 'Dense drizzle', 'ದಟ್ಟ ತುಂತುರು ಮಳೆ'],
    56: ['drizzle', 'Freezing drizzle', 'ತಂಪಾದ ತುಂತುರು'],
    57: ['drizzle', 'Freezing drizzle', 'ತಂಪಾದ ತುಂತುರು'],
    61: ['rain', 'Light rain', 'ಲಘು ಮಳೆ'],
    63: ['rain', 'Moderate rain', 'ಮಧ್ಯಮ ಮಳೆ'],
    65: ['rain', 'Heavy rain', 'ಭಾರಿ ಮಳೆ'],
    66: ['rain', 'Freezing rain', 'ತಂಪಾದ ಮಳೆ'],
    67: ['rain', 'Freezing rain', 'ತಂಪಾದ ಮಳೆ'],
    71: ['snow', 'Light snow', 'ಲಘು ಹಿಮ'],
    73: ['snow', 'Snow', 'ಹಿಮ'],
    75: ['snow', 'Heavy snow', 'ಭಾರಿ ಹಿಮ'],
    77: ['snow', 'Snow grains', 'ಹಿಮ ಕಣಗಳು'],
    80: ['rain', 'Rain showers', 'ಜಡಿ ಮಳೆ'],
    81: ['rain', 'Rain showers', 'ಜಡಿ ಮಳೆ'],
    82: ['rain', 'Violent showers', 'ಭಾರಿ ಜಡಿ ಮಳೆ'],
    85: ['snow', 'Snow showers', 'ಹಿಮದ ಜಡಿ'],
    86: ['snow', 'Snow showers', 'ಹಿಮದ ಜಡಿ'],
    95: ['storm', 'Thunderstorm', 'ಗುಡುಗು ಸಹಿತ ಮಳೆ'],
    96: ['storm', 'Thunderstorm with hail', 'ಗುಡುಗು–ಆಲಿಕಲ್ಲು'],
    99: ['storm', 'Severe thunderstorm with hail', 'ತೀವ್ರ ಗುಡುಗು–ಆಲಿಕಲ್ಲು']
  };
  const RAIN = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82];
  const STORM = [95, 96, 99];
  const HEAVY = [65, 67, 82];

  const fmt = (v, unit, digits = 0) => (v == null ? '—' : v.toFixed(digits) + ' ' + unit);
  const label = (code) => {
    const e = WMO[code];
    if (!e) return kn ? 'ಹವಾಮಾನ' : 'Weather';
    return kn ? e[2] : e[1];
  };
  // km/h -> Beaufort scale (used for wind-based advice)
  function kmhToBeaufort(kmh) {
    const s = [0.3, 1.6, 3.4, 5.5, 8, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7, 37, 41.5, 46.2, 51];
    let b = 0;
    for (let i = 0; i < s.length; i++) if (kmh >= s[i]) b = i + 1;
    return b;
  }

  const C = 'fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;';
  const svg = (inner) => `<svg viewBox="0 0 24 24" style="${C}" class="h-10 w-10" aria-hidden="true">${inner}</svg>`;
  const iconFor = (group) => {
    switch (group) {
      case 'sun':
        return svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.6v2M12 19.4v2M2.6 12h2M19.4 12h2M5.4 5.4l1.4 1.4M17.2 17.2l1.4 1.4M18.6 5.4l-1.4 1.4M6.8 17.2l-1.4 1.4"/>');
      case 'sunc':
        return svg('<circle cx="8" cy="7.5" r="3"/><path d="M8 1.9v1.3M8 12v1.3M2.6 7.5h1.3M12 7.5h1.3M4.2 3.9l1 .9M10.9 10.6l1 .9M10.8 4l-1 .9M4.1 10.7l1-.9"/><path d="M8.6 12.2a4.1 4.1 0 0 1 .5-8.1A5 5 0 0 1 17.6 5.5a3.8 3.8 0 0 1 .4 6.7H8.6z"/>');
      case 'cloud':
        return svg('<path d="M7.6 17.6a4.2 4.2 0 0 1 .4-8.4 5.6 5.6 0 0 1 10.7 1.7 4 4 0 0 1-.3 6.7H7.6z"/>');
      case 'fog':
        return svg('<path d="M7.8 11.6a3.7 3.7 0 0 1 .4-7.4 4.9 4.9 0 0 1 9.4 1.5 3.5 3.5 0 0 1-.4 5.9H7.8z"/><path d="M5 15.4h14M6.5 18.2h11M8 21h8"/>');
      case 'drizzle':
        return svg('<path d="M7.6 13.4a3.9 3.9 0 0 1 .4-7.8 5.2 5.2 0 0 1 10 1.6 3.7 3.7 0 0 1-.4 6.2H7.6z"/><path d="M8.5 16l-1 3M12 16l-1 3M15.5 16l-1 3"/>');
      case 'rain':
        return svg('<path d="M7.6 12.8a3.9 3.9 0 0 1 .4-7.7 5.2 5.2 0 0 1 10 1.5 3.7 3.7 0 0 1-.4 6.2H7.6z"/><path d="M8.5 16.5l-1.1 4M12 16.5l-1.1 4M15.5 16.5l-1.1 4"/>');
      case 'snow':
        return svg('<path d="M7.6 12.6a3.9 3.9 0 0 1 .4-7.7 5.2 5.2 0 0 1 10 1.5 3.7 3.7 0 0 1-.4 6.2H7.6z"/><path d="M12 17v2.4M9.9 18.2l2.1-1.2 2.1 1.2M9.9 18.2l2.1-1.2"/>');
      case 'storm':
      default:
        return svg('<path d="M7.6 12.4a3.9 3.9 0 0 1 .4-7.7 5.2 5.2 0 0 1 10 1.5 3.7 3.7 0 0 1-.4 6.2H7.6z"/><path d="M12.2 13.6l-2.7 4.2h2.4L11 22l3.6-5.1h-2.4l2-3.3z"/>');
    }
  };

  // ---- Visitor advice engine -------------------------------------------------
  // Returns four arrays: risk (red, derived only — never a fabricated official
  // alert), clothing, visit plans and items to carry.
  // Entries are only added when their condition is met, so the UI stays minimal.
  function buildAdvice(c, d) {
    const outfit = [], plan = [], items = [], risk = [];
    const code = c && c.weather_code;
    const popArr = (d && d.precipitation_probability_max) || [];
    const pop = Math.max(0, ...popArr.map((v) => v || 0));
    const tmaxArr = (d && d.temperature_2m_max) || [];
    const tminArr = (d && d.temperature_2m_min) || [];
    const tmax = tmaxArr.length ? Math.max(...tmaxArr) : null;
    const tmin = tminArr.length ? Math.min(...tminArr) : null;
    const uvArr = (d && d.uv_index_max) || [];
    const uv = uvArr.length ? Math.max(0, ...uvArr.map((v) => v || 0)) : 0;
    const feels = c && c.apparent_temperature;
    const wind = c && c.wind_speed_10m;
    const bf = wind != null ? kmhToBeaufort(wind) : 0;
    const isRain = code != null && RAIN.includes(code);
    const isStorm = code != null && STORM.includes(code);
    const isFog = code === 45 || code === 48;
    const isHeavy = (code != null && HEAVY.includes(code));

    // Rain / storm / fog
    if (isStorm) {
      risk.push(kn ? '⚠️ ಗುಡುಗು ಮಿಂಚಿನ ಸಾಧ್ಯತೆ — ಮುಕ್ತ ಗೋಡೆಗಳ ಮೇಲೆ ಅಥವಾ ಮರದ ನೆರಳಿನಲ್ಲಿ ನಿಲ್ಲಬೇಡಿ; ಕೆಳಗಿನ ಪ್ರದೇಶಗಳಿಂದ ದೂರವಿರಿ.' : '⚠️ Thunderstorm likely — avoid standing on open walls or under trees, and keep clear of low ground.');
      plan.push(kn ? 'ಗುಡುಗು ಮಿಂಚಿನ ಸಮಯದಲ್ಲಿ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಪಡೆಯಿರಿ; ಮತ್ತೆ ಹೊರಡುವ ಮೊದಲು ಸ್ಥಳದ ಸೂಚನೆ ಪರಿಶೀಲಿಸಿ.' : 'During thunderstorms seek safe shelter; check access and local instructions before resuming.');
      items.push(kn ? 'ಸುರಕ್ಷಿತ ಕಟ್ಟಡದಲ್ಲಿ ಆಶ್ರಯ ಪಡೆಯಿರಿ; ಒಂಟಿ ಮರಗಳಿಂದ ದೂರವಿರಿ.' : 'Seek a substantial safe shelter; avoid isolated trees.');
    } else if (isHeavy) {
      risk.push(kn ? '⚠️ ಮಳೆ ಬಲವಾಗಿದೆ — ನೀರು ತುಂಬಿದ ರಸ್ತೆಗಳನ್ನು ತಪ್ಪಿಸಿ; ಹೊರಡುವ ಮುನ್ನ ಸ್ಥಳೀಯ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ.' : '⚠️ Heavy rain — avoid waterlogged streets; check local conditions before walking.');
      plan.push(kn ? 'ದೀರ್ಘ ಹೊರಾಂಗಣ ಭೇಟಿಗೆ ಸಲಹೆ ಇಲ್ಲ; ಒಳಾಂಗಣ ಸ್ಥಳಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಿ.' : 'Skip long outdoor stretches; prefer indoor attractions.');
      items.push(kn ? 'ಮಳೆರಕ್ಷೆ (ಗಾಳಿಯಲ್ಲಿ ಉದ್ದ ಛತ್ರಿ ಅನುಕೂಲವಲ್ಲ).' : 'Rainwear (a long umbrella is awkward in wind).');
    } else if (isRain || pop >= 60) {
      outfit.push(kn ? 'ಮಳೆ / ಮಳೆ ಸಾಧ್ಯತೆ ಇದೆ — ನೀರು ತಡೆಯುವ ಜಾಕೆಟ್ ಅಥವಾ ಛತ್ರಿ ಒಯ್ಯಿರಿ.' : 'Rain or high chance — a waterproof jacket or umbrella helps.');
      plan.push(kn ? 'ನೆಲ ಜಾರುವಂತಿರಬಹುದು, ನಡಿಗೆಯಲ್ಲಿ ಎಚ್ಚರಿಕೆ; ತೆರೆದ ವೇದಿಕೆಗಳು ಕಡಿಮೆ ಆನಂದದಾಯಕ.' : 'Pavements may be slippery — step carefully; open decks are less pleasant.');
      items.push(kn ? 'ಮಡಿಕೆ ಛತ್ರಿ.' : 'Foldable umbrella.');
    } else if (pop >= 40) {
      items.push(kn ? 'ಮಳೆ ಸಾಧ್ಯತೆ ಮಧ್ಯಮ — ಬ್ಯಾಕಪ್ ಛತ್ರಿ ಇಟ್ಟುಕೊಳ್ಳಿ.' : 'Moderate rain chance — keep a backup umbrella handy.');
    }

    if (isFog) {
      risk.push(kn ? '⚠️ ಮಂಜು — ಗೋಚರತೆ ಕಡಿಮೆ, ಹಳೆಯ ನಗರ ರಸ್ತೆಗಳು ಸಾಂದ್ರ; ನೆಮ್ಮದಿಯಾಗಿ ಚಲಿಸಿ.' : '⚠️ Fog — low visibility and busy old-city streets; move slowly.');
      items.push(kn ? 'ಮಾಸ್ಕ್ (ಮಂಜಿನ ಗಾಳಿ).' : 'A mask (hazy air in fog).');
    }

    // Heat / UV
    const hot = (feels != null && feels >= 32) || (tmax != null && tmax >= 34);
    if (hot) {
      outfit.push(kn ? 'ಬಿಸಿಲು ಹೆಚ್ಚು — ಹಗುರ, ಗಾಳಿ ಬೀಸುವ ಬಟ್ಟೆ ಧರಿಸಿ.' : 'Hot and bright — wear light, breathable clothing.');
      plan.push(kn ? 'ಮಧ್ಯಾಹ್ನ (ಸುಮಾರು 11–15 ಗಂ) ಹೊರಾಂಗಣವನ್ನು ತಪ್ಪಿಸಿ; ಬಿಸಿಲು ಸಮಯವನ್ನು ಕಡಿಮೆ ಮಾಡಿ.' : 'Avoid the midday hours (about 11–15h) outdoors and shorten sun exposure.');
      items.push(kn ? 'ಸನ್‌ಕ್ರೀಂ, ಕನ್ನಡಕ, ಟೋಪಿ, ಸಾಕಷ್ಟು ನೀರು.' : 'Sunscreen, shades, a hat and plenty of water.');
    }
    if (uv >= 5) {
      items.push(kn ? 'ಅತಿನೇರಳೆ ಬಲವಾಗಿದೆ — ಸನ್‌ಕ್ರೀಂ, ಕನ್ನಡಕ, ಟೋಪಿ ಒಯ್ಯಿರಿ.' : 'UV is strong — sunscreen, sunglasses and a hat.');
    } else if (uv >= 3) {
      items.push(kn ? 'ಸೌಮ್ಯ ಅತಿನೇರಳೆ — ದೀರ್ಘ ಹೊರಾಂಗಣದಲ್ಲಿ ಟೋಪಿ ಸಹಾಯಕ.' : 'Mild UV — a hat helps for long outdoor time.');
    }

    // Cold
    if (feels != null && feels < 18) {
      outfit.push(kn ? 'ಬೆಳಗ್ಗೆ / ಸಂಜೆ ತಂಪಾಗಿರಬಹುದು — ಹಗುರ ಜಾಕೆಟ್ ಒಯ್ಯಿರಿ.' : 'Cool mornings/evenings — a light jacket is handy.');
    }
    if (tmin != null && tmin <= 10) {
      outfit.push(kn ? 'ರಾತ್ರಿ ತಂಪಾಗಿರಬಹುದು — ದಟ್ಟ ಜಾಕೆಟ್, ಸ್ಕಾರ್ಫ್.' : 'Chilly low — a warmer jacket and scarf.');
    }
    if (tmax != null && tmin != null && tmax - tmin > 8) {
      outfit.push(kn ? 'ದಿನ-ರಾತ್ರಿ ತಾಪಮಾನ ವ್ಯತ್ಯಾಸ ಹೆಚ್ಚು — ಪದರ ಪದರವಾಗಿ ಬಟ್ಟೆ ಧರಿಸಿ, ಜಾಕೆಟ್ ಇಟ್ಟುಕೊಳ್ಳಿ.' : 'Big day-night swing — dress in layers and keep a jacket.');
    }

    // Wind
    if (bf >= 7) {
      risk.push(kn ? '⚠️ ಗಾಳಿ ಬಲವಾಗಿದೆ — ಹೋರ್ಡಿಂಗ್‌ಗಳು, ತಾತ್ಕಾಲಿಕ ರಚನೆಗಳಿಂದ ದೂರವಿರಿ; ಮುಕ್ತ ಎತ್ತರದ ಸ್ಥಳಗಳನ್ನು ತಪ್ಪಿಸಿ.' : '⚠️ Strong wind — keep away from hoardings and temporary structures; avoid open high spots.');
    } else if (bf >= 5) {
      plan.push(kn ? 'ಗಾಳಿ ಬಲವಾಗಿದೆ — ಮುಕ್ತ ವೇದಿಕೆಗಳು / ಎತ್ತರದ ಸ್ಥಳಗಳು ಅಲ್ಲಾಡಬಹುದು.' : 'Breezy — open decks and high points may feel exposed.');
      items.push(kn ? 'ಟೋಪಿ ಹಾರಾಡಬಹುದು — ಚಪ್ಪಟೆ ಟೋಪಿ ಬಳಸಿ, ಸಡಲ ಉಡುಪು ತಪ್ಪಿಸಿ.' : 'Hats can blow off — use a snug cap; avoid loose clothing.');
    }

    // Clear / cloudy — positive, only when no adverse weather
    if (!isStorm && !isHeavy && !isRain && !isFog && (code === 0 || code === 1)) {
      plan.push(kn ? 'ಹವಾಮಾನ ಒಳ್ಳೆಯದು — ಹೊರಾಂಗಣ ಪರಿಶೀಲನೆಗೆ ಸೂಕ್ತ; ಬೆಳಗ್ಗೆ / ಸಂಜೆ ಬೆಳಕು ಚೆನ್ನಾಗಿರುತ್ತದೆ.' : 'Good weather for outdoor touring and photos; early/late light is lovely.');
    } else if (!isStorm && !isHeavy && !isRain && !isFog && (code === 2 || code === 3)) {
      plan.push(kn ? 'ಮೋಡದಲ್ಲಿ ಫೋಟೋ ಬೆಳಕು ಮೃದುವಿರಬಹುದು; ನಡೆಗೆ ಮೊದಲು ನಿಜವಾದ ಬಿಸಿ ಮತ್ತು UV ಪರಿಶೀಲಿಸಿ.' : 'Cloud may soften light for photos; consider actual heat and UV before a walk.');
    }

    return { outfit, plan, items, risk };
  }

  function renderAdvice(a) {
    const blocks = [
      { title: kn ? 'ಹೊರಡುವ ಉಡುಪು' : 'What to wear', items: a.outfit },
      { title: kn ? 'ಭೇಟಿಯ ವ್ಯವಸ್ಥೆ' : 'Visit plans', items: a.plan },
      { title: kn ? 'ಜೊತೆಗೆ ತೆಗೆದುಕೊಳ್ಳುವುದು' : 'What to carry', items: a.items }
    ];
    const active = blocks.filter((b) => b.items.length);
    let html = `<p class="text-xs font-extrabold tracking-wider text-fort">${kn ? 'ನಿಮ್ಮ ಭೇಟಿಗೆ ಸಲಹೆಗಳು' : 'QUICK TIPS FOR YOUR VISIT'}</p>`;
    if (a.risk.length) {
      html += `<div class="mt-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm leading-7 text-red-700">
        <p class="font-extrabold">${kn ? '⚠️ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ' : '⚠️ WEATHER CAUTION'}</p>
        ${a.risk.map((t) => `<p class="mt-1">${t}</p>`).join('')}
      </div>`;
    }
    if (active.length) {
      html += active
        .map(
          (b) => `<div class="mt-3">
            <p class="text-xs font-bold tracking-wide text-stone-ink/55">${b.title}</p>
            <ul class="mt-1.5 space-y-1 text-sm leading-7 text-stone-ink/75">
              ${b.items.map((t) => `<li class="flex gap-2"><span class="text-fort">›</span><span>${t}</span></li>`).join('')}
            </ul>
          </div>`
        )
        .join('');
    } else if (!a.risk.length) {
      html += `<p class="mt-3 text-sm leading-7 text-stone-ink/70">${kn ? 'ಹವಾಮಾನ ಸಾಮಾನ್ಯ — ಸಾಮಾನ್ಯ ಪ್ರವಾಸ ವಸ್ತುಗಳೇ ಸಾಕು.' : 'Conditions look settled — usual travel basics are enough.'}</p>`;
    }
    adviceBox.innerHTML = html;
    adviceBox.classList.remove('hidden');
  }

  function renderCurrent(c, d) {
    const temp = fmt(c.temperature_2m, '°C');
    const feels = fmt(c.apparent_temperature, '°C');
    const hum = fmt(c.relative_humidity_2m, '%');
    const wind = fmt(c.wind_speed_10m, ' km/h');
    const rain = c.precipitation == null ? '—' : c.precipitation + ' mm';
    const popToday = (d && d.precipitation_probability_max && d.precipitation_probability_max[0] != null)
      ? d.precipitation_probability_max[0] + '%'
      : '—';
    currentEl.innerHTML = `
      <div class="text-5xl leading-none">${iconFor((WMO[c.weather_code] || ['cloud'])[0])}</div>
      <div class="mt-4 text-4xl font-black text-stone-ink">${temp}</div>
      <p class="mt-1 font-bold text-fort">${label(c.weather_code)}</p>
      <dl class="mt-5 grid w-full max-w-xs grid-cols-2 gap-x-4 gap-y-2 text-left text-sm text-stone-ink/70">
        <div class="flex justify-between gap-3"><dt>${kn ? 'ಅನುಭವ' : 'Feels'}</dt><dd class="font-bold">${feels}</dd></div>
        <div class="flex justify-between gap-3"><dt>${kn ? 'ಆರ್ದ್ರತೆ' : 'Humidity'}</dt><dd class="font-bold">${hum}</dd></div>
        <div class="flex justify-between gap-3"><dt>${kn ? 'ಗಾಳಿ' : 'Wind'}</dt><dd class="font-bold">${wind}</dd></div>
        <div class="flex justify-between gap-3"><dt>${kn ? 'ಮಳೆ ಸಾಧ್ಯತೆ' : 'Rain chance'}</dt><dd class="font-bold">${popToday}</dd></div>
        <div class="flex justify-between gap-3"><dt>${kn ? 'ಮಳೆ' : 'Rain'}</dt><dd class="font-bold">${rain}</dd></div>
      </dl>`;
  }

  function renderDaily(d) {
    const days = (d.time || []).map((_, i) => i);
    dailyEl.innerHTML = days.map((i) => {
      const date = new Date(d.time[i] + 'T12:00:00Z');
      const dateLabel = date.toLocaleDateString(lang === 'en' ? 'en-IN' : 'kn-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: TIMEZONE
      });
      const code = d.weather_code[i];
      const tmax = d.temperature_2m_max?.[i];
      const tmin = d.temperature_2m_min?.[i];
      const pop = d.precipitation_probability_max?.[i];
      const chip = Number.isFinite(pop) ? `<span class="wx-day-probability rounded-full bg-[#9c5d36]/10 px-2 py-0.5 text-xs font-bold text-[#9c5d36]">${kn ? 'ಮಳೆ ಸಾಧ್ಯತೆ' : 'Rain chance'}: ${pop}%</span>` : '';
      return `<li class="wx-day py-3 text-sm">
        <span class="wx-day-date font-bold text-stone-ink">${dateLabel}</span>
        <span class="wx-day-condition text-stone-ink/75"><span class="text-[#9c5d36]" aria-hidden="true">${iconFor((WMO[code] || ['cloud'])[0])}</span><span>${label(code)}</span></span>
        <span class="wx-day-temperature font-bold text-stone-ink">${fmt(tmax, '°')}<span class="font-normal text-stone-ink/50"> / ${fmt(tmin, '°')}</span></span>
        ${chip}
      </li>`;
    }).join('');
  }

  function fallback(msg) {
    currentEl.innerHTML = `<div class="max-w-xs text-sm leading-7 text-stone-ink/60">${msg}</div>`;
    dailyEl.innerHTML = '';adviceBox.innerHTML='';adviceBox.classList.add('hidden');
  }

  async function refresh() {
    try {
      const res = await fetch('/api/weather', { signal: AbortSignal.timeout(6500) });
      if (!res.ok) throw new Error('http ' + res.status);
      const j = validateWeather(await res.json());
      if (!j || !j.current || !j.daily) throw new Error('bad payload');
      const c = j.current, d = j.daily;
      renderCurrent(c, d);currentEl.insertAdjacentHTML('beforeend','<p class="mt-3 text-xs">'+c.time.replace('T',' ')+' · Asia/Kolkata · Open-Meteo</p>');
      renderDaily(d);
      renderAdvice(buildAdvice(c, d));
    } catch (e) {
      fallback(
        kn
          ? 'ಲೈವ್ ಹವಾಮಾನ ಲೋಡ್ ಆಗಲಿಲ್ಲ. ಮೇಲಿನ ಋತು ಕಾರ್ಡ್‌ಗಳನ್ನು ಬಳಸಿ; ಸರ್ಕಾರಿ ಹವಾಮಾನ ಇಲಾಖೆಯ ಮುನ್ನೋಟವನ್ನೂ ಪರಿಶೀಲಿಸಿ.'
          : 'Live weather could not load. Use the season cards above, and also check the national weather service before travelling.'
      );
    }
  }
  refresh();

}
