import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@/lib/db/schema";

const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined;
};

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "dev_marham_doctordb",
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
    timezone: process.env.DB_TIMEZONE || "+05:00",
    waitForConnections: true,
    enableKeepAlive: true,
  });
}

const pool = globalForDb.pool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });
export type Db = typeof db;
export { pool };
