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

export const userFriendsAndFamily = mysqlTable("user_friends_and_family", {
  id: bigint("id", { mode: "bigint", unsigned: true }).primaryKey(),
  userId: int("user_id").notNull().default(0),
  relationUserId: int("relation_user_id").notNull().default(0),
  relationType: varchar("relation_type", { length: 255 }).notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});
