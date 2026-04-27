# 追风少年 · 数字花园

一个基于 **Astro 5** 构建的个人网站 / 数字花园。非功利性、高度个人化，承载社会性展示与主体性生长双重使命。

---

## 目录

- [快速开始](#快速开始)
- [测试网站](#测试网站)
- [功能大全](#功能大全)
- [如何修改内容](#如何修改内容)
- [部署到 GitHub Pages](#部署到-github-pages)
- [Obsidian 工作流](#obsidian-工作流)
- [CMS 后台管理](#cms-后台管理)
- [项目结构](#项目结构)
- [注意事项](#注意事项)

---

## 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**（用于部署）

### 启动开发服务器

```bash
# 1. 安装依赖（首次运行）
npm install

# 2. 启动本地开发服务器
npm run dev

# 3. 在浏览器打开
#    http://localhost:4321
```

开发模式下，修改代码后浏览器会自动热更新。

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

---

## 测试网站

测试网站意味着验证所有页面和功能是否正常工作。请按以下清单逐项检查：

### 1. 基本功能测试

| 测试项 | 检查方法 | 预期结果 |
|--------|----------|----------|
| 首页加载 | 访问 `/` | 显示标题 "Hi, I'm 追风少年"、头像、最新 3 篇文章 |
| 导航跳转 | 点击导航栏每个链接 | 正确跳转到对应页面，当前页面链接高亮 |
| 页面切换动画 | 切换页面时观察 | 内容淡入上移动画 |
| 移动端菜单 | 缩小浏览器宽度 < 768px | 导航折叠为汉堡菜单，点击展开 |
| 滚动导航栏 | 向下滚动页面 | 导航栏变为毛玻璃背景 |
| 页脚 | 滚动到底部 | 显示版权信息、社交链接（GitHub/Twitter/Email） |

### 2. 暗黑模式测试

| 测试项 | 检查方法 | 预期结果 |
|--------|----------|----------|
| 切换开关 | 点击导航栏的 ☀️/🌙 按钮 | 全站切换为暗黑/明亮模式 |
| 持久化 | 切换后刷新页面 | 保持上次选择的主题 |
| 系统跟随 | 清除 localStorage 后刷新 | 自动跟随系统偏好 |
| 所有页面 | 逐个页面检查 | 所有页面都正确适配暗黑模式 |

### 3. 首页（Home）测试

| 测试项 | 检查方法 | 预期结果 |
|--------|----------|----------|
| 头像悬停 | 鼠标悬停头像 | 弹出随机台词气泡（"今天很开心！🎉"等） |
| 按钮跳转 | 点击 "了解更多" / "阅读文章" | 跳转到 About / Writing 页面 |
| 最新文章 | 检查文章列表 | 显示最近 3 篇公开文章 |

### 4. 文章页面（Writing）测试

| 测试项 | 检查方法 | 预期结果 |
|--------|----------|----------|
| 文章列表 | 访问 `/writing` | 显示所有公开文章，按日期排序 |
| 搜索功能 | 在搜索框输入关键词 | 实时过滤匹配的文章（搜索标题/标签） |
| 标签筛选 | 点击标签按钮（"全部"/"生活"/"技术"等） | 只显示该标签的文章 |
| 年份筛选 | 选择某个年份 | 只显示该年份的文章 |
| 月份筛选 | 选择某个月份 | 只显示该月份的文章 |
| 时段筛选 | 选择"上午"/"下午"/"晚上"等 | 只显示该时段的文章 |
| 文章详情 | 点击一篇文章 | 进入详情页，显示标题、日期、标签、内容 |
| Ctrl+K 搜索 | 按 `Ctrl+K` | 弹出全局搜索框 |
| 私密/草稿不可见 | 设置某篇文章为"私密"或"草稿" | 该文章在列表和搜索中均不显示 |

### 5. 项目页面（Projects）测试

| 测试项 | 检查方法 | 预期结果 |
|--------|----------|----------|
| 项目列表 | 访问 `/projects` | 显示所有项目卡片 |
| 分类筛选 | 点击"全部"/"代码"/"写作"/"策划" | 只显示对应分类的项目 |
| 外部链接 | 点击项目卡片 | 链接为 `http` 开头则新窗口打开，否则当前窗口 |
| 项目标签 | 查看项目卡片底部 | 显示项目的标签 |

### 6. 关于页面（About）测试

| 测试项 | 检查方法 | 预期结果 |
|--------|----------|----------|
| 自我介绍 | 查看页面 | 显示头像、简介文字 |
| 折叠介绍 | 点击 "查看完整介绍" | 展开包含"追风少年"故事、数字花园哲学的详细内容 |
| 生活剪影 | 查看画廊区域 | 4 张彩色卡片，悬浮放大 |
| 技术栈标签 | 查看技术栈模块 | 显示 JS/TS/React 等标签 |
| 兴趣爱好 | 查看兴趣爱好模块 | 显示阅读/写作/跑步等兴趣标签，悬浮有动画 |
| 此刻状态 | 查看状态模块 | 显示心情/在听/在读，带呼吸圆点动画 |

### 7. 特别角落（Special）测试

| 测试项 | 检查方法 | 预期结果 |
|--------|----------|----------|
| 读书角落 | 查看读书模块 | 显示 6 本书，含评分、状态（在读/已读/想读） |
| 健身日志 | 查看健身模块 | 显示 4 项运动的进度条和百分比 |
| 旅行足迹 | 查看旅行模块 | 显示 5 个城市标记，带虚线路径图 |
| 彩蛋提示 | 查看彩蛋模块 | 提示输入"少年"触发彩蛋 |

### 8. 彩蛋测试

| 测试项 | 检查方法 | 预期结果 |
|--------|----------|----------|
| 打字触发 | 在任意页面键盘输入 `少年` | 屏幕飘落 30 架纸飞机动画 |
| 缩写触发 | 在任意页面键盘输入 `sn` | 同样触发彩蛋 |
| 多次触发 | 连续触发多次 | 每次都能正常触发 |

### 9. 搜索功能测试

| 测试项 | 检查方法 | 预期结果 |
|--------|----------|----------|
| 打开方式 | 点击导航栏搜索按钮 | 弹出搜索弹窗 |
| 快捷键 | 按 `Ctrl+K` | 弹出搜索弹窗 |
| 实时搜索 | 输入关键词 | 实时显示匹配结果（标题/描述/标签） |
| 无结果 | 输入不存在的关键词 | 显示"未找到相关的内容" |
| 点击结果 | 点击搜索结果 | 跳转到对应文章 |
| 关闭 | 点击遮罩层 / 按 Escape | 关闭搜索弹窗 |

### 10. 构建测试（重要）

每次修改后务必运行构建验证：

```bash
npm run build
```

检查输出中是否有 `[ERROR]`。无错误、无警告即为通过。

---

## 功能大全

### 页面功能一览

| 页面 | 路由 | 核心功能 |
|------|------|----------|
| **首页** | `/` | 英雄区（Slogan + 头像 + 随机台词气泡）、最新 3 篇文章 |
| **关于** | `/about` | 自我介绍、可折叠详细经历、生活画廊、技术栈、兴趣、此刻状态 |
| **项目** | `/projects` | 项目卡片列表、分类筛选（全部/代码/写作/策划） |
| **文章** | `/writing` | 文章列表、搜索、标签云、年/月/时段筛选、文章详情页 |
| **特别** | `/special` | 读书角落、健身日志（进度条）、旅行足迹、彩蛋入口 |

### 全局功能

| 功能 | 说明 |
|------|------|
| **暗黑模式** | 点击导航栏 ☀️/🌙 按钮切换，自动记住偏好 |
| **搜索** | 点击搜索按钮或按 `Ctrl+K`，实时搜索所有公开文章 |
| **彩蛋** | 任意页面键盘输入 `少年` 或 `sn`，触发纸飞机飘落动画 |
| **云朵背景** | 三朵 SVG 云朵以不同速度缓缓飘过屏幕 |
| **响应式** | 完美适配手机、平板、桌面端 |
| **预加载** | 页面间导航预加载，切换极其流畅 |
| **可见性控制** | 文章支持"公开/私密/草稿"三种状态 |

### 交互细节

- **头像悬停**：首页头像鼠标悬停时，随机显示 7 句台词中的一句
- **卡片动画**：所有卡片悬浮时上移并加深阴影
- **进度条动画**：健身日志的进度条从 0 开始动画填充
- **导航滚动**：滚动超过 80px 后导航栏出现毛玻璃背景

---

## 如何修改内容

### 修改站点的全局文字

大多数通用文字在 `src/data/siteData.js` 中集中管理：

| 配置项 | 路径 | 说明 |
|--------|------|------|
| 站点标题 | `src/data/siteData.js` → `title` | 导航栏和页脚的标题 |
| 站点描述 | `src/data/siteData.js` → `description` | SEO 描述和页脚描述 |
| Slogan | `src/data/siteData.js` → `slogan` | 首页大标题 |
| 副标题 | `src/data/siteData.js` → `subSlogan` | 首页副标题 |
| 社交链接 | `src/data/siteData.js` → `social` | GitHub/Twitter/Email |
| 导航链接 | `src/data/siteData.js` → `navLinks` | 导航栏菜单项 |

### 修改页面特定文字

#### 首页（`src/pages/index.astro`）

| 修改内容 | 搜索关键词 | 位置 |
|----------|-----------|------|
| 英雄区描述 | `这是一个有趣的、真诚的人的数字花园` | 约第 17 行 |
| 按钮文字 | `了解更多` / `阅读文章` | 约第 19-20 行 |
| 滚动提示 | `向下滚动` | 约第 33 行 |
| 头像台词列表 | `今天很开心！🎉` | 约第 67 行（`messages` 数组） |

#### 关于页（`src/pages/about.astro`）

| 修改内容 | 搜索关键词 | 位置 |
|----------|-----------|------|
| 简介文字 | `我是一个热爱生活、热爱技术的追风少年` | 约第 17-18 行 |
| 折叠详细内容 | `关于"追风少年"` / `我的数字花园哲学` / `关于长期主义` | 约第 27-39 行 |
| 现在在做 | `探索 AI 与前端技术的结合` | 约第 76-80 行 |
| 技术栈标签 | `JavaScript` / `TypeScript` / `React` | 约第 86-93 行 |
| 兴趣爱好 | `阅读` / `写作` / `跑步` | 约第 100-105 行 |
| 此刻状态 | `心情` / `在听` / `在读` | 约第 111-123 行 |

#### 特别角落（`src/pages/special/index.astro`）

| 修改内容 | 搜索关键词 | 位置 |
|----------|-----------|------|
| 书籍列表 | `books = [` | 约第 4-11 行 |
| 健身数据 | `fitnessData = [` | 约第 13-18 行 |
| 旅行地点 | `travelSpots = [` | 约第 20-26 行 |

### 修改样式 / 主题色

所有颜色变量定义在 `src/styles/global.css`：

```css
:root {
  --color-primary: #5DADE2;    /* 天空蓝 - 主色 */
  --color-secondary: #F4D03F;  /* 暖阳黄 - 辅助色 */
  --color-accent: #E67E22;     /* 活力橙 - 强调色 */
  --color-bg: #F8F9FA;         /* 背景色 */
  --color-surface: #FFFFFF;    /* 卡片/表面色 */
  --color-text: #2C3E50;       /* 文字主色 */
  /* ... 更多变量 */
}

[data-theme="dark"] {
  /* 暗黑模式颜色覆盖 */
}
```

### 添加博客文章

在 `src/content/blog/` 目录下创建 `.md` 文件即可：

```markdown
---
title: "文章标题"
date: "2025-04-01"
description: "文章描述，会显示在列表和搜索中"
tags: ["标签1", "标签2"]
coverImage: "/images/cover.jpg"    # 可选：封面图片路径
visibility: "公开"                  # 可选：公开 / 私密 / 草稿
---

这里是文章内容，支持 Markdown 语法。
```

文件名推荐格式：`YYYY-MM-DD-slug-name.md`

**可见性说明**：
- `公开`：在文章列表和搜索中可见
- `私密`：只有知道直接 URL 的人能访问，不在列表显示
- `草稿`：完全不可访问（构建时会被排除）

### 添加项目

在 `src/content/projects/` 目录下创建 `.md` 文件：

```markdown
---
title: "项目名称"
category: "代码"        # 可选值：代码 / 写作 / 策划
description: "项目描述"
link: "https://github.com/xxx"   # 点击卡片跳转的链接
tags: ["React", "Node.js"]       # 可选
date: "2025-04"                  # 可选
---
```

### 修改头像

替换 `public/images/avatar.svg` 文件即可。要求：
- SVG 格式（推荐）或 PNG/JPEG
- 建议 200x200px 或以上
- 圆形裁切会在浏览器渲染

### 修改彩蛋触发词

在 `src/data/siteData.js` 中：

```js
easterEggs: {
  trigger: '少年',    // 触发文字
  paperCount: 30,     // 纸飞机数量
},
```

同时需要同步修改 `src/components/EasterEgg.astro` 中的逻辑（约第 39 行）。

### 配置 Giscus 评论

需要先在 GitHub 仓库启用 Discussions 功能，然后：

1. 访问 https://giscus.app 配置
2. 将生成的配置填入 `src/data/siteData.js` 中的 `giscus` 对象：

```js
giscus: {
  repo: 'your-username/your-repo',       // GitHub 仓库
  repoId: 'your-repo-id',                 // 仓库 ID
  category: 'Announcements',              // Discussion 分类
  categoryId: 'your-category-id',         // 分类 ID
  // ... 其他配置保持默认即可
}
```

### 配置网站统计

在 `src/data/siteData.js` 中填入 Cloudflare Web Analytics token：

```js
analytics: {
  cloudflare: 'https://static.cloudflareinsights.com/beacon.min.js?token=YOUR_TOKEN',
}
```

留空则不加载统计脚本。

---

## 部署到 GitHub Pages

### 前提条件

1. 在 GitHub 创建一个仓库（如 `your-username/your-username.github.io`）
2. 仓库已初始化为 Git 仓库并关联远程

### 配置部署

1. 修改 `astro.config.mjs` 中的 `site` 地址为你的 GitHub Pages 地址：

```js
site: 'https://your-username.github.io',
```

2. 在仓库 Settings → Pages 中设置：
   - Source: **GitHub Actions**
   - Branch: `gh-pages` (需要创建对应 workflow)

### 使用 GitHub Actions 自动部署

在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

之后每次推送 `main` 分支，GitHub Actions 会自动构建并部署。

---

## Obsidian 工作流

### 推荐设置

如果你使用 Obsidian 写作，推荐设置软链接实现无缝发布：

```powershell
# 以管理员身份运行 PowerShell
New-Item -ItemType SymbolicLink -Path .\src\content\blog -Target D:\Obsidian\Vault\blog
```

将 `D:\Obsidian\Vault\blog` 替换为你的 Obsidian 仓库路径。

### 一键发布

项目提供了两个一键发布脚本：

**方式一：双击运行（推荐）**

直接双击 `deploy.bat`，脚本会自动：
1. 检查 Git 变更状态
2. 运行 `npm run build` 验证构建
3. 暂存所有变更
4. 提示输入提交信息（直接回车使用智能生成的默认信息）
5. 提交并推送到 GitHub

**方式二：命令行**

```powershell
# 交互式发布
.\deploy.ps1

# 直接指定提交信息发布
.\deploy.ps1 -Message "📝 新文章：我的学习心得"

# 跳过构建检查（如果确信代码无误）
.\deploy.ps1 -SkipBuild

# 查看帮助
.\deploy.ps1 -Help
```

脚本会自动检测变更类型（文章/项目/配置）并生成对应的 emoji 提交信息。

---

## CMS 管理后台

项目提供了**两种** CMS 方案：

### 方案一：自定义管理后台（推荐，无需服务器）

访问 `/admin` 进入内置的**可视化在线编辑器**。

#### 工作原理

使用 **GitHub API** + **Personal Access Token (PAT)** 直接操作仓库文件。

```
浏览器中的管理页面
    ↓
输入密码 + GitHub PAT 认证
    ↓
通过 GitHub REST API 读取/写入文件
    ↓
自动生成 commit 推送到 GitHub
    ↓
GitHub Actions 自动构建部署
```

#### 使用步骤

**1. 准备 GitHub Token**

前往 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)，创建一个新 token：
- Name: `my-website-admin`
- Expiration: 根据你的需要选择（如 90 天或 No expiration）
- Scopes: 勾选 `repo`（访问仓库）

创建后复制 token 字符串（格式如 `ghp_xxxxxxxxxxxx`）。

**2. 配置管理员密码**

在 `src/data/siteData.js` 中设置：
```js
admin: {
  password: '你设置的密码',
  siteUrl: 'https://your-site.github.io',
}
```

**3. 访问管理后台**

- 本地开发：`http://localhost:4321/admin`
- 部署后：`https://your-site.github.io/admin`

进入后填写：
| 字段 | 说明 |
|------|------|
| 管理员密码 | `siteData.js` 中设置的密码 |
| GitHub Token | 上面创建的 `ghp_xxx` token |
| GitHub 用户名 | 如 `DrSKYyyy` |
| 仓库名 | 如 `my-website` |

#### 后台功能

| 功能 | 说明 |
|------|------|
| **文章管理** | 浏览、编辑、删除所有博客文章 |
| **项目管理** | 浏览、编辑、删除项目 |
| **新建文章** | 可视化 Markdown 编辑器，支持标题、标签、可见性设置 |
| **上传 .md 文件** | 拖拽或点击选择 .md 文件，一键上传到博客目录 |
| **自动 commit** | 所有修改自动通过 API 提交到 GitHub，无需手动操作 |

> **本地测试**：即使网站部署在本地，只要有网络连接，管理后台就可以通过 GitHub API 直接操作仓库文件。

### 方案二：Decap CMS（原 Netlify CMS，需部署+认证服务）

访问 `/admin/index.html` 进入（需先配置 Git Gateway 认证）。

> 方案一（自定义后台）**不依赖任何第三方服务**，只需要一个 GitHub Token，推荐优先使用。

---

## 项目结构

```
my-website/
├── public/
│   ├── admin/
│   │   ├── config.yml         # CMS 配置文件
│   │   └── index.html         # CMS 入口页面
│   ├── images/
│   │   └── avatar.svg         # 网站头像
│   └── favicon.svg            # 浏览器标签图标
├── src/
│   ├── components/
│   │   ├── CloudBackground.astro   # 云朵背景动画
│   │   ├── EasterEgg.astro         # 彩蛋（纸飞机）
│   │   ├── Footer.astro            # 全局页脚
│   │   ├── GiscusComments.astro    # Giscus 评论组件
│   │   ├── Header.astro            # 全局导航栏
│   │   ├── SearchDialog.astro      # 搜索弹窗
│   │   └── ThemeToggle.astro       # 暗黑模式切换
│   ├── content/
│   │   ├── blog/                   # 博客文章（.md 文件）
│   │   ├── projects/               # 项目（.md 文件）
│   │   └── config.ts               # 内容集合 Schema
│   ├── data/
│   │   └── siteData.js             # 全局配置数据
│   ├── layouts/
│   │   ├── Layout.astro            # 基础布局
│   │   └── BlogLayout.astro        # 文章详情布局
│   ├── pages/
│   │   ├── index.astro             # 首页
│   │   ├── about.astro             # 关于
│   │   ├── projects/index.astro    # 项目列表
│   │   ├── writing/index.astro     # 文章列表
│   │   ├── writing/[...slug].astro # 文章详情（动态路由）
│   │   └── special/index.astro     # 特别角落
│   └── styles/
│       └── global.css              # 全局样式
├── astro.config.mjs                # Astro 配置
├── deploy.bat                      # 一键发布（批处理）
├── deploy.ps1                      # 一键发布（PowerShell）
├── package.json
└── tsconfig.json
```

---

## 注意事项

### 开发阶段

1. **评论默认不显示**：Giscus 需要配置真实的 GitHub 仓库信息才能工作。评论功能开启前，文章详情页的评论区区域会显示空白。不影响其他功能。
2. **首次运行 `npm run dev`** 如果报错，尝试删除 `.astro/` 和 `node_modules/.vite/` 目录后重试。
3. **图片路径**：放在 `public/images/` 下的图片通过 `/images/xxx.jpg` 引用；放在 `src/` 下的图片需要 import 导入。

### 内容管理

4. **文章文件名**：推荐使用 `YYYY-MM-DD-slug-name.md` 格式。slug 会作为 URL 路径的一部分，不支持中文文件名（建议用英文或拼音）。
5. **日期格式**：frontmatter 中的 `date` 字段建议使用 `YYYY-MM-DD` 格式，时段筛选基于该日期的小时数（默认为 0，即凌晨）。如果希望文章显示特定时段，可以写成 `2025-04-01 14:30` 这样的完整格式。
6. **标签一致性**：建议使用统一的标签名称（所有标签统一用"技术"而不要有些用"Tech"），否则会出现重复标签。
7. **项目链接**：`http://` 开头的链接会在新窗口打开，站内链接（如 `/writing`）在当前窗口打开。

### 部署阶段

8. **Git 初始化**：如果项目还没有初始化为 Git 仓库，需手动执行 `git init` 并关联远程仓库，否则部署脚本和 GitHub Actions 无法工作。
9. **GitHub Actions Token**：自动部署 workflow 需要使用 `GITHUB_TOKEN`，这个由 GitHub 自动提供，不需要手动配置。
10. **第一次部署**：如果使用 GitHub Actions，第一次部署需要手动在 Settings → Pages 中将 Source 改为 GitHub Actions 模式。

### 构建检查

11. **每次修改后务必运行 `npm run build`** 验证构建是否通过。构建失败最常见的原因：
    - 文章 frontmatter 格式错误（缺少冒号、引号不成对）
    - 引用了不存在的组件或文件
    - 样式语法错误
12. **构建输出**：构建产物在 `dist/` 目录，不需要提交到 Git（已在 `.gitignore` 中忽略）。

### 浏览器兼容

13. 网站支持所有现代浏览器（Chrome/Firefox/Safari/Edge）。不支持 IE。
14. 搜索弹窗使用 `<dialog>` 标签，在非常老旧的部分浏览器中可能需要 polyfill。

### SEO

15. 每篇文章的 `<title>` 和 `<meta description>` 自动根据 frontmatter 生成。建议为每篇文章填写 `description` 字段。
16. 在 `astro.config.mjs` 中修改 `site` 地址后，Astro 会自动生成标准的 sitemap（需安装 `@astrojs/sitemap` 集成）。

### 安全

17. Giscus 评论使用 GitHub Discussions，用户通过 GitHub OAuth 登录评论，不需要网站处理用户数据。
18. Cloudflare Web Analytics 不收集个人数据，符合隐私法规要求。
