import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cvs = pgTable("cvs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateName: text("candidate_name").notNull(),
  candidateEmail: text("candidate_email").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  extractedText: text("extracted_text").notNull(),
  fileBuffer: text("file_buffer"),
  dateReceived: timestamp("date_received").notNull().defaultNow(),
  source: text("source").notNull(),
});

export const analyses = pgTable("analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cvId: varchar("cv_id").notNull().references(() => cvs.id, { onDelete: "cascade" }),
  jobDescription: text("job_description").notNull(),
  score: integer("score").notNull(),
  strengths: jsonb("strengths").$type<string[]>().notNull(),
  weaknesses: jsonb("weaknesses").$type<string[]>().notNull(),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
});

export const fetchHistory = pgTable("fetch_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  source: text("source").notNull(),
  cvsCount: integer("cvs_count").notNull(),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

export const insertCVSchema = createInsertSchema(cvs).omit({
  id: true,
  dateReceived: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  analyzedAt: true,
});

export const insertFetchHistorySchema = createInsertSchema(fetchHistory).omit({
  id: true,
  fetchedAt: true,
});

export type InsertCV = z.infer<typeof insertCVSchema>;
export type CV = typeof cvs.$inferSelect;

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

export type InsertFetchHistory = z.infer<typeof insertFetchHistorySchema>;
export type FetchHistory = typeof fetchHistory.$inferSelect;

export type CVWithAnalysis = CV & {
  analysis?: Analysis;
};

export type DashboardStats = {
  totalCVs: number;
  lastAnalysisDate: string | null;
  highestScore: number | null;
  averageScore: number | null;
};
