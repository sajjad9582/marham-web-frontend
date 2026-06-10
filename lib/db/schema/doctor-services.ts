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

export const doctorServices = mysqlTable("servicesdoctor", {
  doctorId: varchar("dID", { length: 255 }).notNull(),
  serviceId: varchar("sID", { length: 255 }).notNull(),
  _dummy_id: varchar("dummy_id", { length: 255 }),
});
