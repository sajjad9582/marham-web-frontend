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

export const medicalShareables = mysqlTable("medical_shareables", {
  id: bigint("id", { mode: "bigint", unsigned: true }).primaryKey(),
  userId: int("user_id").notNull().default(0),
  sharedBy: int("shared_by").notNull().default(0),
  objectId: int("object_id"),
  objectType: varchar("object_type", { length: 255 }),
  type: int("type").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});
