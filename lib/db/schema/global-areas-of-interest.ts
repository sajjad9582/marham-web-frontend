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

export const globalAreasOfInterest = mysqlTable("global_areas_of_interest", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }),
  specialityId: varchar("speciality_id", { length: 255 }).notNull().default("0"),
  subSpecialityId: varchar("sub_speciality_id", { length: 255 }).notNull().default("0"),
  doctorId: varchar("doctor_id", { length: 255 }).notNull().default("0"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: varchar("updated_at", { length: 255 }),
});
