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

export const patientAppointmentMedicines = mysqlTable("patient_appointment_medicines", {
  id: int("id").autoincrement().primaryKey(),
  appointmentId: bigint("appt_id", { mode: "bigint" }).notNull().default(0),
  patientId: int("patient_id").notNull().default(0),
  patientRecordId: int("patient_record_id").notNull().default(0),
  medicineId: int("medicine_id").notNull().default(0),
  medicineTitle: varchar("medicine_title", { length: 255 }),
  time: varchar("time", { length: 255 }),
  quantity: varchar("quantity", { length: 255 }),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at"),
});
