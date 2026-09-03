import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// 唯一域名配置点：正式域名 bengalurufort.com（2026-09-03 绑定）。
// 留空时仍可正常构建；canonical / og:url 会省略，sitemap 不启用。
const SITE = 'https://bengalurufort.com';

export default defineConfig({
  site: SITE || undefined,
  output: 'static',
  integrations: SITE ? [sitemap()] : [],
  vite: {
    plugins: [tailwindcss()]
  }
});
