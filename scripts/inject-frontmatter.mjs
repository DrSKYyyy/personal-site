/**
 * inject-frontmatter.mjs
 * 构建前自动补全博客 markdown 文件中缺失的 frontmatter。
 *
 * 处理逻辑：
 * 1. 扫描 src/content/blog/ 下所有 .md 文件（含子目录）
 * 2. 如果文件中 `title` 缺失 → 从正文第一个 `# 标题` 提取，若没有则用文件名
 * 3. 如果文件中 `date` 缺失 → 用文件修改日期 (YYYY-MM-DD)
 * 4. 如果文件中 `tags` 缺失 → 从正文中提取 `#Tag` 格式标签
 * 5. 修复格式异常（如 `---\ncontent\n---\n---\n` 多余分隔符）
 *
 * 使用方式：作为 "prebuild" 脚本自动运行，或手动执行
 *   node scripts/inject-frontmatter.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const BLOG_DIR = path.resolve('src/content/blog');
const ENCODING = 'utf-8';
const DATE_REGEX = /(\d{4})-(\d{2})-(\d{2})/;

// ============================================================
//  文件收集
// ============================================================

function collectMarkdownFiles(dir) {
  const results = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return results; }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectMarkdownFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.md')) results.push(fullPath);
  }
  return results;
}

// ============================================================
//  容错解析：处理 Obsidian 导出的各种 frontmatter 异常格式
// ============================================================

function safeParse(raw) {
  // 1) 修复双分隔符：`---\n...\n---\n---\n` → `---\n...\n---\n`
  //    即 content 以 `---` 开头时，去除这个多余的分隔符
  const lines = raw.split('\n');
  let dashCount = 0;
  let secondDashIndex = -1; // 第二组 --- 所在行（frontmatter 结束）

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      dashCount++;
      if (dashCount === 2) { secondDashIndex = i; break; }
    }
  }

  let clean = raw;
  if (secondDashIndex >= 0 && secondDashIndex + 1 < lines.length) {
    // 看 frontmatter 结束后的第一行是否也是 ---
    const nextLine = lines[secondDashIndex + 1].trim();
    if (nextLine === '---') {
      lines.splice(secondDashIndex + 1, 1); // 移除多余分隔符
      clean = lines.join('\n');
    }
  }

  // 2) 尝试用 gray-matter 解析
  let parsed;
  try {
    parsed = matter(clean);
  } catch (e) {
    // 3) 如果还失败：可能完全无 frontmatter 或格式严重损坏
    if (!clean.startsWith('---')) {
      parsed = matter(`---\n---\n${clean}`);
    } else {
      throw e;
    }
  }

  return { data: parsed.data, content: parsed.content, cleaned: clean !== raw };
}

// ============================================================
//  字段提取
// ============================================================

function extractFirstHeading(content) {
  const m = content.match(/^#\s+(.+)/m);
  return m ? m[1].trim() : null;
}

function extractTagsFromContent(content) {
  const tags = new Set();
  const tagRegex = /(?<!\w)(?<![#])#([\p{L}\p{N}_-]+)/gu;
  let m;
  while ((m = tagRegex.exec(content)) !== null) {
    const tag = m[1].trim();
    if (tag && tag.length >= 2 && tag.length <= 20 && isNaN(Number(tag))) {
      tags.add(tag);
    }
  }
  return [...tags];
}

// ============================================================
//  处理单个文件
// ============================================================

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, ENCODING);
  const relativePath = path.relative(BLOG_DIR, filePath);
  const fileName = path.basename(filePath, '.md');

  // 容错解析
  let parsed, content;
  try {
    parsed = safeParse(raw);
    content = parsed.content;
  } catch (e) {
    console.warn(`  ⚠️  ${relativePath}: 格式无法修复，已跳过 (${e.message})`);
    return false;
  }

  const data = parsed.data;
  let needsRewrite = parsed.cleaned; // 双分隔符已修复 → 需要写回

  // ---- title ----
  if (!data.title) {
    const heading = extractFirstHeading(content);
    if (heading) data.title = heading;
    else data.title = fileName.replace(/^脚本_/, '').replace(/[_-]/g, ' ');
    console.log(`  📝 title → "${data.title}" (${relativePath})`);
    needsRewrite = true;
  }

  // ---- date ----
  if (!data.date) {
    const nameMatch = fileName.match(DATE_REGEX);
    if (nameMatch) {
      data.date = `${nameMatch[1]}-${nameMatch[2]}-${nameMatch[3]}`;
      console.log(`  📅 date → "${data.date}" (文件名: ${relativePath})`);
    } else {
      const stats = fs.statSync(filePath);
      const d = new Date(stats.mtime);
      data.date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      console.log(`  📅 date → "${data.date}" (文件修改时间: ${relativePath})`);
    }
    needsRewrite = true;
  }

  // ---- tags ----
  if (!data.tags || data.tags.length === 0) {
    const extracted = extractTagsFromContent(content);
    if (extracted.length > 0) {
      data.tags = extracted;
      console.log(`  🏷️  tags → [${extracted.join(', ')}] (${relativePath})`);
      needsRewrite = true;
    }
  }

  // ---- 确保 date 字段始终是字符串（YAML 会把 2026-05-31 解析成 Date 对象） ----
  if (data.date && typeof data.date !== 'string') {
    const d = new Date(data.date);
    data.date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    needsRewrite = true;
  }

  // ---- 确保 date 写入时带引号（js-yaml 配置） ----
  if (needsRewrite) {
    const out = matter.stringify(content, data, {
      security: false,
      // 对 date 字段强制引号，防止 YAML 重新解析为 Date
    });
    // 手动给 date 加引号（防止 YAML 重新解析为 Date 对象）
    let final = out;
    if (data.date) {
      final = final.replace(/^(date:\s*)(\d{4}-\d{2}-\d{2})\s*$/m, '$1"$2"');
    }
    fs.writeFileSync(filePath, final, ENCODING);
    return true;
  }
  return false;
}

// ============================================================
//  主流程
// ============================================================

function main() {
  console.log('\n🔍 扫描博客文件，自动补全 frontmatter...\n');
  const files = collectMarkdownFiles(BLOG_DIR);
  console.log(`   找到 ${files.length} 个 .md 文件\n`);

  let modified = 0;
  for (const fp of files) {
    const rel = path.relative(BLOG_DIR, fp);
    if (rel.includes('从Obsidian复制到博客的注意事项')) continue;
    try {
      if (processFile(fp)) { modified++; console.log(`  ✅ 已更新: ${rel}\n`); }
    } catch (err) {
      console.error(`  ❌ ${rel}: ${err.message}`);
    }
  }

  console.log(`\n✨ 处理完成！共修改 ${modified} / ${files.length} 个文件\n`);
}

main();
