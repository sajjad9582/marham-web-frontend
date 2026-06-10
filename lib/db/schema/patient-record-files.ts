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

export const patientRecordFiles = mysqlTable("patient_appointment_record_images", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().default(0),
  appointmentId: bigint("patient_appointment_id", { mode: "bigint" }).notNull().default(0),
  doctorId: int("doctor_id").notNull().default(0),
  uploadedBy: int("uploaded_by").notNull().default(0),
  ext: varchar("ext", { length: 10 }).notNull(),
  nameWithoutExt: varchar("nameWithoutExt", { length: 255 }).notNull(),
  attachment: varchar("attachment", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at"),
});
