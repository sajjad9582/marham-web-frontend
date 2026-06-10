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

export const appointmentStatuses = mysqlTable("appointment_statuses", {
  id: int("id").autoincrement().primaryKey(),
  value: int("value").notNull().default(0),
  title: varchar("title", { length: 250 }),
});
