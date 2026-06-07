/**
 * remark-wiki-link
 * 将 Markdown 中的 [[文章标题]] 转换为可点击的 wiki 链接
 * 客户端 JS 负责解析标题到实际 slug 并处理悬浮预览
 */
import { visit } from 'unist-util-visit';

export default function remarkWikiLink() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;

      const parts = String(node.value).split(/(\[\[[^\]]+\]\])/g);
      if (parts.length <= 1) return;

      const children = parts
        .filter(Boolean)
        .map((part) => {
          const match = part.match(/^\[\[([^\]]+)\]\]$/);
          if (match) {
            const title = match[1].trim();
            // 使用 title 作为 slug 近似值，客户端 JS 会进行修正
            const slug = title
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^\w\u4e00-\u9fff-]/g, '')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            return {
              type: 'link',
              url: '/writing/' + encodeURIComponent(slug),
              title: title,
              data: {
                hProperties: {
                  'data-wiki': 'true',
                  'data-wiki-title': title,
                  'data-wiki-slug': slug,
                },
              },
              children: [{ type: 'text', value: title }],
            };
          }
          return { type: 'text', value: part };
        });

      parent.children.splice(index, 1, ...children);
    });
  };
}
