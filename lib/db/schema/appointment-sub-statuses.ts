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

export const appointmentSubStatuses = mysqlTable("appointment_sub_statuses", {
  id: int("id").autoincrement().primaryKey(),
  value: int("value").notNull().default(0),
  title: varchar("title", { length: 50 }),
  text: varchar("text", { length: 255 }),
  buttonText: varchar("button_text", { length: 255 }),
});
