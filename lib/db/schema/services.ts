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

export const services = mysqlTable("services", {
  id: int("sID").autoincrement().primaryKey(),
  name: varchar("service", { length: 255 }).notNull(),
  specialityId: varchar("spID", { length: 255 }).notNull().default("0"),
  slug: varchar("slug", { length: 255 }),
});
