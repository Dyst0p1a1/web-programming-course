import type { PrismaClient } from "@prisma/client";

export type JwtPayload = {
  userId: string;
  email: string;
  role: string;
  exp: number;
};

export type AppDependencies = {
  prisma: PrismaClient;
  jwtSecret: string;
};