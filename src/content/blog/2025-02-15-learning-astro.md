---
title: "学习 Astro：构建现代静态网站"
date: "2025-02-15"
description: "Astro 是一个令人兴奋的静态网站生成器，这篇文章分享了我的学习心得和实践经验。"
tags: ["技术", "前端", "Astro"]
visibility: "公开"
---

# 学习 Astro：构建现代静态网站

最近我使用 Astro 重构了我的个人网站，整个过程非常愉快。这篇文章分享一些学习和使用 Astro 的心得。

## 为什么选择 Astro？

Astro 是一个**以内容为核心**的静态网站生成器，它有以下几个突出的优点：

### 1. 零 JS 默认

Astro 默认生成纯 HTML，这意味着页面加载速度极快。只有在需要交互的地方才会加载 JavaScript，这就是 Astro 著名的**岛屿架构**。

### 2. 原生 Markdown 支持

对于博客类网站来说，Markdown 支持是刚需。Astro 内置了对 Markdown 和 MDX 的支持，可以直接在 `.md` 文件中编写内容。

### 3. 框架无关

Astro 支持在同一个项目中混合使用 React、Vue、Svelte 等框架。这意味着你可以根据需求选择最合适的工具。

## 实践心得

在构建这个网站的过程中，我学到了很多：

```
// Astro 组件示例
---
const title = "Hello World";
---

<h1>{title}</h1>
<style>
  h1 { color: var(--color-primary); }
</style>
```

### 文件路由

Astro 的文件路由系统非常直观，`src/pages/` 目录下的文件会自动生成对应的路由。

### 内容集合

使用 `Astro.glob()` 可以方便地读取 Markdown 文件集合：

```javascript
const posts = await Astro.glob('../content/blog/*.md');
```

## 结语

Astro 让构建内容型网站变成了一件很有乐趣的事情。如果你也在寻找一个优秀的静态网站生成器，强烈推荐尝试 Astro。
