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

export const doctorQualifications = mysqlTable("doctor_qualifications", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: varchar("dID", { length: 255 }).notNull(),
  institute: varchar("institute", { length: 255 }),
  qualification: varchar("qualification", { length: 255 }).notNull(),
  yearFrom: date("year_from"),
  yearTo: date("year_to"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at"),
  status: varchar("status", { length: 255 }).notNull().default("0"),
});
