import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Determine database type from connection string
const isSQLite = connectionString.startsWith('file:');
const isMySQL = connectionString.startsWith('mysql:');

let config;

if (isSQLite) {
  config = defineConfig({
    schema: "./drizzle/schema-sqlite.ts",
    out: "./drizzle/migrations-sqlite",
    dialect: "sqlite",
    dbCredentials: {
      url: connectionString,
    },
  });
} else if (isMySQL) {
  config = defineConfig({
    schema: "./drizzle/schema.ts",
    out: "./drizzle/migrations-mysql",
    dialect: "mysql",
    dbCredentials: {
      url: connectionString,
    },
  });
} else {
  throw new Error("Unsupported database type. Use SQLite (file:) or MySQL (mysql:) connection string.");
}

export default config;