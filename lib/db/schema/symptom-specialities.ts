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

export const symptomSpecialities = mysqlTable("symptom_specialities", {
  id: bigint("id", { mode: "bigint", unsigned: true }).primaryKey(),
  symptomId: varchar("symptom_id", { length: 255 }).notNull(),
  specialityId: varchar("speciality_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
