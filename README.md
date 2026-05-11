# 追风少年 - 个人网站

> 一个有趣、真诚的年轻人的数字花园

基于 **Astro 5** 构建的静态个人网站，部署于 **Cloudflare Pages**，使用 **GitHub API** 实现内容管理。

***

## 目录

- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [如何修改网站内容](#如何修改网站内容)
  - [全局配置（推荐）](#1-全局配置-srcdatasitedatajs)
  - [博客文章](#2-博客文章-srccontentblog)
  - [项目](#3-项目-srccontentprojects)
- [后台管理 CMS](#后台管理-cms)
- [常见操作](#常见操作)
  - [添加新文章](#添加新文章)
  - [修改首页文字](#修改首页文字)
  - [修改关于页面](#修改关于页面)
  - [修改 Special 页面](#修改-special-页面读书健身旅行)
  - [修改 Giscus 评论配置](#修改-giscus-评论配置)
- [部署](#部署)
- [技术栈](#技术栈)

***

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（热更新，浏览器打开 http://localhost:4321）
npm run dev

# 构建生产版本
npm run build

# 本地预览构建结果
npm run preview
```

***

## 项目结构

```
website-v5/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Header.astro     # 导航栏
│   │   ├── Footer.astro     # 页脚
│   │   ├── TypingIntro.astro # 打字机动画
│   │   ├── SearchDialog.astro # 搜索弹窗
│   │   ├── GiscusComments.astro # Giscus 评论
│   │   ├── VisitorMessageForm.astro # 匿名留言表单
│   │   ├── ThemeToggle.astro # 暗黑模式切换
│   │   ├── CloudBackground.astro # 云朵动画
│   │   ├── EasterEgg.astro  # 纸飞机彩蛋
│   │   └── VisitorCounter.astro # 访客计数
│   ├── content/             # ⭐ 内容文件夹（在此添加.md文件）
│   │   ├── blog/            #   博客文章
│   │   └── projects/        #   项目
│   ├── data/
│   │   └── siteData.js      # ⭐ 全局配置文件（所有常修改内容）
│   ├── layouts/
│   │   ├── Layout.astro     # 基础布局
│   │   └── BlogLayout.astro # 文章详情布局
│   ├── pages/               # 页面文件
│   │   ├── index.astro      # 首页
│   │   ├── about.astro      # 关于
│   │   ├── writing/         # 文章列表/详情
│   │   ├── projects/        # 项目列表
│   │   ├── special/         # 特别角落
│   │   └── admin/           # CMS 管理后台
│   └── styles/
│       └── global.css       # 全局样式
├── public/
│   ├── admin/               # CMS 前端资源
│   └── images/              # 图片资源
├── functions/               # Cloudflare Functions（留言接口）
├── astro.config.mjs         # Astro 构建配置
└── siteData.js              # 不再使用，见 src/data/siteData.js
```

***

## 如何修改网站内容

### 1. 全局配置（`src/data/siteData.js`）

> ⭐ **这是你修改网站内容最常用的文件。**

所有可修改的内容都集中在此，并附有中文注释。修改后保存，本地开发服务器会自动热更新。

**包含的内容：**

| 配置项                  | 说明                 | 默认值示例                            |
| -------------------- | ------------------ | -------------------------------- |
| `title`              | 网站名称（导航栏、页脚、浏览器标签） | 追风少年                             |
| `description`        | 网站描述（SEO）          | 一个有趣、真诚的年轻人的数字花园                 |
| `avatar`             | 头像图片路径             | /images/avatar.svg               |
| `hero.sloganEn`      | 首页大标题英文部分          | Hi, I'm                          |
| `hero.sloganZh`      | 首页大标题中文部分          | 追风少年                             |
| `hero.description`   | 首页描述文字             | 这是一个有趣的...                       |
| `hero.speechBubbles` | 头像气泡文字列表           | \['今天很开心！🎉', ...]               |
| `intro.lines`        | 打字机逐行文字            | \['你好，我是 天天', ...]               |
| `intro.typingSpeed`  | 打字速度（毫秒/字）         | 80                               |
| `navLinks`           | 导航栏菜单项             | \[...]                           |
| `about.*`            | 关于页面全部文字           | 见文件内注释                           |
| `special.*`          | Special页面全部数据      | 见文件内注释                           |
| `giscus.*`           | Giscus 评论系统配置      | 见下方说明                            |
| `admin.password`     | CMS 登录密码           | SHTskycool200417                 |
| `social.*`           | 社交链接               | GitHub、Twitter、Email             |
| `formEndpoint`       | 匿名留言接口地址           | <https://xxs.beauty/api/message> |
| `footer.copyright`   | 页脚版权文字             | 用 ❤️ 和 ☀️ 建造                     |

**示例：修改首页大标题**

在 `siteData.js` 中找到：

```js
hero: {
    sloganEn: "Hi, I'm",  // ← 修改英文部分
    sloganZh: '追风少年',  // ← 修改中文部分
    // ...
}
```

### 2. 博客文章（`src/content/blog/`）

> 每篇文章是一个 `.md` 文件，使用 Markdown 格式。

**文件名格式：** `YYYY-MM-DD-slug-name.md`（日期-英文短标题）

**文件内容格式：**

```markdown
---
title: "文章标题"
date: "2025-01-01"
description: "文章简介（显示在列表页）"
tags: ["标签1", "标签2"]
visibility: "公开"  # 公开、私密、草稿
coverImage: "/images/xxx.jpg"  # 可选，封面图
---

这里是文章正文，使用 Markdown 语法。
```

**添加新文章步骤：**

1. 在 `src/content/blog/` 文件夹内创建 `.md` 文件
2. 按照上方格式填写开头的 `---` 元数据（frontmatter）
3. 在 `---` 下方写正文
4. 保存后，本地开发服务器会自动刷新显示新文章
5. 推送到 GitHub 后，自动部署上线

### 3. 项目（`src/content/projects/`）

格式与博客类似，但元数据字段不同：

```markdown
---
title: "项目名称"
category: "代码"  # 代码、写作、策划
description: "项目描述"
link: "/writing"  # 点击跳转链接
tags: ["标签"]
date: "2025-02"
---
```

***

## 后台管理 CMS

除了直接修改本地文件，你也可以通过网页版 CMS 管理内容：

1. 访问 `https://xxs.beauty/admin`
2. 点击"登录管理后台"，输入密码（在 `siteData.js` 的 `admin.password` 中设置）
3. 登录后可以：
   - 查看所有文章列表
   - 在线编辑文章（Markdown 编辑器，支持实时预览）
   - 新建文章
   - 删除文章
   - 管理项目

CMS 通过 GitHub API 直接操作仓库文件，修改会实时同步到 GitHub。

***

## 常见操作

### 添加新文章

**方法一（推荐）：本地添加文件**

1. 在 `src/content/blog/` 下创建 `2025-04-28-my-new-post.md`
2. 写入 frontmatter + 正文
3. 保存后运行 `git add . && git commit -m "新文章" && git push`
4. GitHub Actions 自动部署

**方法二：CMS 后台**

1. 访问 `/admin` 登录
2. 点击"新建文章"
3. 写内容并发布

### 修改首页文字

编辑 `siteData.js` 中的 `hero` 和 `intro` 字段。

### 修改关于页面

编辑 `siteData.js` 中的 `about` 字段，包括：

- 简介段落（`about.intro.paragraphs`）
- 详细介绍（`about.detail.sections`）
- 当前任务（`about.details.current.items`）
- 技术栈（`about.details.techStack.skills`）
- 兴趣爱好（`about.details.hobbies.items`）
- 此刻状态（`about.details.status.items`）

### 修改 Special 页面（读书/健身/旅行）

编辑 `siteData.js` 中的 `special` 字段。

### 修改 Giscus 评论配置

1. 访问 <https://giscus.app/zh-CN>
2. 填写你的 GitHub 仓库信息
3. 获取 `repo`, `repoId`, `category`, `categoryId`
4. 更新 `siteData.js` 中的 `giscus` 字段

***

## 部署

### 自动部署（推荐）

项目已配置 GitHub Actions，推送到 `main` 分支后自动构建并部署到 Cloudflare Pages。

```bash
git add .
git commit -m "描述修改内容"
git push
```

### 手动部署

```bash
npm run build     # 构建到 dist/ 目录
```

然后将 `dist/` 目录上传到任何静态托管服务。

***

## 技术栈

- **框架：** Astro 5（静态站点生成）
- **样式：** 原生 CSS（CSS 变量 + Flex/Grid）
- **字体：** ZCOOL KuaiLe（标题）+ Inter（正文）
- **评论：** Giscus（基于 GitHub Discussions）
- **部署：** Cloudflare Pages + GitHub Actions
- **内容管理：** 本地 Markdown 文件 + GitHub API
- **留言：** Cloudflare Pages Functions + MailChannels

