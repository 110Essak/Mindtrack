import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Platform-specific assessments
export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: varchar("platform").notNull(), // instagram, facebook, snapchat, twitter
  responses: jsonb("responses").notNull(), // JSON object with question-answer pairs
  overallScore: decimal("overall_score", { precision: 3, scale: 1 }),
  moodScore: decimal("mood_score", { precision: 3, scale: 1 }),
  usageScore: decimal("usage_score", { precision: 3, scale: 1 }),
  comparisonScore: decimal("comparison_score", { precision: 3, scale: 1 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated insights and recommendations
export const insights = pgTable("insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  keyInsight: text("key_insight").notNull(),
  recommendations: jsonb("recommendations").notNull(), // Array of recommendation objects
  riskLevel: varchar("risk_level").notNull(), // low, moderate, high
  createdAt: timestamp("created_at").defaultNow(),
});

// User progress tracking
export const progressEntries = pgTable("progress_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  overallWellness: decimal("overall_wellness", { precision: 3, scale: 1 }),
  screenTime: decimal("screen_time", { precision: 4, scale: 1 }), // hours
  moodScore: decimal("mood_score", { precision: 3, scale: 1 }),
  platformUsage: jsonb("platform_usage"), // { platform: minutes }
  goalsCompleted: integer("goals_completed").default(0),
  totalGoals: integer("total_goals").default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chatbot conversations
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  isBot: boolean("is_bot").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User goals and recommendations tracking
export const userGoals = pgTable("user_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // time_limit, mindful_browsing, feed_curation, gratitude
  isCompleted: boolean("is_completed").default(false),
  targetValue: decimal("target_value", { precision: 10, scale: 2 }),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).default(sql`0`),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assessments: many(assessments),
  insights: many(insights),
  progressEntries: many(progressEntries),
  chatMessages: many(chatMessages),
  goals: many(userGoals),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
  insights: many(insights),
}));

export const insightsRelations = relations(insights, ({ one }) => ({
  user: one(users, {
    fields: [insights.userId],
    references: [users.id],
  }),
  assessment: one(assessments, {
    fields: [insights.assessmentId],
    references: [assessments.id],
  }),
}));

export const progressEntriesRelations = relations(progressEntries, ({ one }) => ({
  user: one(users, {
    fields: [progressEntries.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const userGoalsRelations = relations(userGoals, ({ one }) => ({
  user: one(users, {
    fields: [userGoals.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  createdAt: true,
});

export const insertProgressEntrySchema = createInsertSchema(progressEntries).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertUserGoalSchema = createInsertSchema(userGoals).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Insight = typeof insights.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type ProgressEntry = typeof progressEntries.$inferSelect;
export type InsertProgressEntry = z.infer<typeof insertProgressEntrySchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type UserGoal = typeof userGoals.$inferSelect;
export type InsertUserGoal = z.infer<typeof insertUserGoalSchema>;
