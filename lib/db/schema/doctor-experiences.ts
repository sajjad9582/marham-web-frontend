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

export const doctorExperiences = mysqlTable("doctor_experiences", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: varchar("dID", { length: 255 }).notNull(),
  designation: varchar("designation", { length: 100 }),
  institute: varchar("institute", { length: 255 }),
  years: varchar("years", { length: 255 }).notNull().default("0"),
  yearFrom: varchar("year_from", { length: 50 }),
  yearTo: varchar("year_to", { length: 50 }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at"),
});
