// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: true,
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
  ],

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'zh',
    locales: [
      { code: 'zh', name: '简体中文', file: 'zh.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    langDir: 'locales',
    lazy: true,
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    public: {
      appName: 'MysticTarot',
    },
  },

  css: ['~/assets/css/main.css'],

  app: {
    baseURL: '/mystic-tarot/', // GitHub Pages 部署路径
    buildAssetsDir: 'static/', // 避免 GitHub Pages 忽略以下划线开头的目录
    head: {
      title: '神秘塔罗 — MysticTarot',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: '兼具仪式感与交互美学的塔罗牌在线抽取与 AI 解读系统',
        },
        { name: 'theme-color', content: '#050505' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap',
        },
      ],
    },
  },
  // 2. 针对 3D 动画库的优化
  build: {
    transpile: ['gsap', 'three', '@tresjs/client'],
  },
  nitro: {
    preset: 'github-pages',
  },
  // TresJS uses client-only rendering
  vite: {
    ssr: {
      noExternal: ['gsap', 'three', '@tresjs/client'], // 确保这些包在 SSR 期间被正确处理
    },
    optimizeDeps: {
      include: ['three', 'gsap'], // 预构建提升开发体验
    } 
  },
})
