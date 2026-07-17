import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Session-mode pooler — migrations/introspection need a non-transaction-mode
    // connection. The running app uses DATABASE_URL instead, via lib/db.ts.
    // env() (not process.env + dotenv/config) — dotenv assumes a physical .env
    // file exists, which crashes on Vercel where env vars are injected directly
    // and no .env file is ever deployed.
    url: env("DIRECT_URL"),
  },
});
