export const siteConfig = {
  base: '',
  title: '追风少年',
  description: '一个有趣、真诚的年轻人的数字花园',
  author: '追风少年',
  avatar: '/images/avatar.svg',
  slogan: 'Hi, I\'m 追风少年',
  subSlogan: '赤诚、爽朗、不畏风',
  social: {
    github: 'https://github.com',
    twitter: 'https://twitter.com',
    email: 'hello@example.com',
  },
  navLinks: [
    { name: 'Home', href: '/', icon: '😊' },
    { name: 'About', href: '/about', icon: '☁️' },
    { name: 'Projects', href: '/projects', icon: '🧰' },
    { name: 'Writing', href: '/writing', icon: '✍️' },
    { name: 'Special', href: '/special', icon: '⭐' },
  ],
  easterEggs: {
    trigger: '少年',
    paperCount: 30,
  },
  giscus: {
    repo: 'DrSKYyyy/personal-site',
    repoId: 'R_kgDOSJuDOg',
    category: 'Announcements',
    categoryId: 'DIC_kwDOSJuDOs4C7z4Q',
    mapping: 'pathname',
    strict: '0',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'bottom',
    lang: 'zh-CN',
    theme: 'preferred_color_scheme',
  },
  analytics: {
    cloudflare: '',
  },
  admin: {
    password: 'SHTskycool200417',
    siteUrl: 'https://xxs.beauty',
  },
  formEndpoint: 'https://xxs.beauty/api/message', // 匿名留言接口
  intro: {
    lines: [
      "你好，我是 天天",
      '欢迎来到我的世界',
    ],
    subtitle: '我追风，也等你',
    typingSpeed: 80,
    eraseSpeed: 40,
    pauseAfterType: 1500,
    pauseBeforeNext: 500,
  },
};
