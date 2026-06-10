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

export const patientAppointmentTests = mysqlTable("patient_appointment_tests", {
  id: int("patient_appointment_test_id").autoincrement().primaryKey(),
  appointmentId: bigint("patient_appointment_id", { mode: "bigint" }).notNull(),
  patientId: varchar("patient_id", { length: 255 }).notNull().default("0"),
  globalTestId: varchar("global_test_id", { length: 255 }).notNull().default("0"),
  globalTestTitle: varchar("global_test_title", { length: 255 }),
  laboratoryId: int("laboratory_id").default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at"),
});
