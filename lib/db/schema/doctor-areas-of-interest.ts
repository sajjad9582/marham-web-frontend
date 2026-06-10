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

export const doctorAreasOfInterest = mysqlTable("doctor_areas_of_interest", {
  id: int("id").autoincrement().primaryKey(),
  areaOfInterestId: varchar("area_of_interest_id", { length: 255 }).notNull().default("0"),
  doctorId: varchar("doctor_id", { length: 255 }).notNull().default("0"),
  isScrapped: tinyint("is_scrapped").default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at"),
});
