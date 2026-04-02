import { mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { PrismaClient } from "@prisma/client";

function createSchema(databasePath: string) {
  const database = new DatabaseSync(databasePath);

  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL,
      "name" TEXT,
      "githubId" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'student',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );

    CREATE TABLE "Category" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );

    CREATE TABLE "Question" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "text" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "categoryId" TEXT NOT NULL,
      "correctAnswer" JSON,
      "points" INTEGER NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );

    CREATE TABLE "Session" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'in_progress',
      "score" REAL,
      "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "expiresAt" DATETIME NOT NULL,
      "completedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );

    CREATE TABLE "Answer" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sessionId" TEXT NOT NULL,
      "questionId" TEXT NOT NULL,
      "userAnswer" JSON NOT NULL,
      "score" REAL,
      "isCorrect" BOOLEAN,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
    CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
    CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
    CREATE INDEX "Question_categoryId_idx" ON "Question"("categoryId");
    CREATE INDEX "Question_type_idx" ON "Question"("type");
    CREATE INDEX "Session_userId_idx" ON "Session"("userId");
    CREATE INDEX "Session_status_idx" ON "Session"("status");
    CREATE INDEX "Session_userId_status_idx" ON "Session"("userId", "status");
    CREATE UNIQUE INDEX "Answer_sessionId_questionId_key" ON "Answer"("sessionId", "questionId");
    CREATE INDEX "Answer_sessionId_idx" ON "Answer"("sessionId");
    CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");
  `);

  database.close();
}

export function createTestDatabase(name: string) {
  const databasePath = resolve(process.cwd(), "test-artifacts", `${name}.db`);
  mkdirSync(dirname(databasePath), { recursive: true });
  rmSync(databasePath, { force: true });

  createSchema(databasePath);

  const databaseUrl = `file:${databasePath.replace(/\\/g, "/")}`;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  return { prisma, databaseUrl, databasePath };
}