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

export const doctorLeaves = mysqlTable("doctor_leaves", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: varchar("doctor_id", { length: 255 }).notNull(),
  hospitalId: varchar("hospital_id", { length: 255 }).notNull(),
  leaveFrom: date("leave_from").notNull(),
  leaveTo: date("leave_to").notNull(),
  reason: varchar("reason", { length: 500 }),
  reasonType: tinyint("reason_type"),
  createdBy: varchar("created_by", { length: 255 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});
