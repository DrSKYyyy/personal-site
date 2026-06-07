import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
    time: z.string().optional(),
    pinned: z.number().optional(),
    visibility: z.enum(['公开', '私密', '草稿']).default('公开'),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    seriesTitle: z.string().optional(),
    seriesSection: z.string().optional(),
  }),
});

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.enum(['代码', '写作', '策划']),
    description: z.string(),
    link: z.string(),
    pdf: z.string().optional(),
    tags: z.array(z.string()).optional(),
    date: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  projects: projectsCollection,
};
