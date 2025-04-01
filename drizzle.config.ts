import { defineConfig } from "drizzle-kit";

if (!process.env.REACT_APP_DATABASE_URL) {
  throw new Error("DATABASE_URL, in drizzle, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.REACT_APP_DATABASE_URL,
  },
});
