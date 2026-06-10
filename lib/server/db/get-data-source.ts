import "reflect-metadata";
import { DataSource } from "typeorm";
import { entities, preserveEntityClassNames } from "@/lib/server/entities";

declare global {
  // eslint-disable-next-line no-var
  var __marhamDataSource: DataSource | undefined;
  // eslint-disable-next-line no-var
  var __marhamDataSourcePromise: Promise<DataSource> | undefined;
}

function createDataSource() {
  preserveEntityClassNames();
  return new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "dev_marham_doctordb",
    entities,
    synchronize: false,
    logging: process.env.DB_LOGGING === "true",
    charset: "utf8mb4",
    timezone: process.env.DB_TIMEZONE || "+05:00",
    extra: {
      dateStrings: true,
    },
  });
}

// Turbopack HMR re-evaluates modules; tear down stale connections and entity metadata.
if (process.env.NODE_ENV !== "production" && global.__marhamDataSource?.isInitialized) {
  void global.__marhamDataSource.destroy();
  global.__marhamDataSource = undefined;
  global.__marhamDataSourcePromise = undefined;
}

export async function getDataSource(): Promise<DataSource> {
  if (!global.__marhamDataSourcePromise) {
    global.__marhamDataSourcePromise = (async () => {
      global.__marhamDataSource = createDataSource();
      await global.__marhamDataSource.initialize();
      return global.__marhamDataSource;
    })();
  }
  return global.__marhamDataSourcePromise;
}

/** @deprecated Use getDataSource() — kept for any lingering imports */
export const AppDataSource = new Proxy({} as DataSource, {
  get(_target, prop) {
    if (prop === "isInitialized") return global.__marhamDataSource?.isInitialized ?? false;
    throw new Error("Use getDataSource() instead of AppDataSource");
  },
});
