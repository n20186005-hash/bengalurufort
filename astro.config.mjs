import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// 唯一域名配置点：确定正式域名后，仅修改此处并重新构建。
// 留空时仍可正常构建；canonical / og:url 会省略，sitemap 不启用。
const SITE = '';

export default defineConfig({
  site: SITE || undefined,
  output: 'static',
  integrations: SITE ? [sitemap()] : [],
  vite: {
    plugins: [tailwindcss()]
  }
});
