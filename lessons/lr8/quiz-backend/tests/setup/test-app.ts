import { createApp } from "../../src/app.js";

import { createTestDatabase } from "./test-db.js";

export async function createTestApp(name: string) {
  const uniqueName = `${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const db = createTestDatabase(uniqueName);
  const app = createApp({
    prisma: db.prisma,
    jwtSecret: "test-secret",
  });

  return {
    app,
    prisma: db.prisma,
    async cleanup() {
      await db.prisma.$disconnect();
    },
  };
}