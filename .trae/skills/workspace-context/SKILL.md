---
name: "workspace-context"
description: "Records workspace environment paths, IDE config locations, MCP settings, and common commands. Invoke when needing config file paths, MCP config, build commands, or project reference info."
---

# Workspace Context

Stores commonly used paths, configuration locations, and commands for this project.

## Project Info

| Item | Value |
|------|-------|
| Project Root | `e:\personal-sites\website-v5` |
| Framework | Astro |
| Package Manager | npm/pnpm |
| Site URL | https://sthtttt.com |

## Skill 存放位置

Trae 的 skill 是基于项目的，存放在每个项目根目录下：

```
.trae/skills/<skill-name>/SKILL.md
```

当前项目已有 skill：

| Skill | 路径 |
|-------|------|
| workspace-context | `.trae/skills/workspace-context/SKILL.md` |
| blog-writing | `.trae/skills/blog-writing/SKILL.md` |

> 注意：Trae CN 没有全局级别的 skill 目录。AppData 下的 `%APPDATA%\Trae CN\User\globalStorage` 只包含编辑器内部数据（如 `.ckg\storage`），不存放用户自定义 skill。

## IDE Config Files

### Trae IDE MCP Config
```
C:\Users\天天\AppData\Roaming\Trae CN\User\mcp.json
```
This file contains all MCP server configurations.

### Trae IDE Settings
```
C:\Users\天天\AppData\Roaming\Trae CN\User\settings.json
```

### Trae IDE Global Storage
```
%APPDATA%\Trae CN\User\globalStorage\
```
Contains editor internal data (ckg storage, MCP gallery cache, etc.). Not user-editable.

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## MCP Servers (currently configured)

| Server | Type | Location in mcp.json |
|--------|------|---------------------|
| Obsidian | npx | `mcpServers.mcp-obsidian` |
| GitHub | http | `mcpServers.github` |
| Magic UI | npx | `mcpServers.@magicuidesign/mcp` |

## Adding New MCP Servers

Edit `C:\Users\天天\AppData\Roaming\Trae CN\User\mcp.json` and add a new entry under `mcpServers`:

```json
"<server-name>": {
  "command": "npx",
  "args": ["-y", "<package-name>"]
}
```

After editing, restart Trae IDE to apply changes.
