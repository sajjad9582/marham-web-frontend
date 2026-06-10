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

export const doctorReviewReplies = mysqlTable("doctor_review_replies", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: varchar("review_id", { length: 255 }).notNull(),
  userId: text("user_id"),
  replierType: tinyint("replier_type").notNull(),
  reply: text("reply").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});
