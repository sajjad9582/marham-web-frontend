// @ts-nocheck
import {
  mysqlTable,
  int,
  bigint,
  float,
  double,
  tinyint,
  smallint,
  boolean,
  varchar,
  text,
  longtext,
  date,
  time,
  timestamp,
  datetime,
  json,
  decimal,
} from "drizzle-orm/mysql-core";

export const symptoms = mysqlTable("symptoms", {
  id: bigint("id", { mode: "bigint", unsigned: true }).primaryKey(),
  name: varchar("name", { length: 255 }),
  urduName: varchar("urdu_name", { length: 255 }),
  icon: varchar("icon", { length: 255 }),
  slug: varchar("slug", { length: 255 }),
  seo: longtext("seo").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});
