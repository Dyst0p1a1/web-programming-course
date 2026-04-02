import { Hono } from "hono";

import type { AppDependencies } from "../lib/types.js";

export const createCatalogRoutes = (dependencies: AppDependencies) => {
  const catalog = new Hono();

  catalog.get("/categories", async (c) => {
    const categories = await dependencies.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return c.json({ categories });
  });

  catalog.get("/questions", async (c) => {
    const categoryId = c.req.query("categoryId");

    const questions = await dependencies.prisma.question.findMany({
      where: categoryId ? { categoryId } : undefined,
      select: {
        id: true,
        text: true,
        type: true,
        categoryId: true,
        points: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ questions });
  });

  return catalog;
};