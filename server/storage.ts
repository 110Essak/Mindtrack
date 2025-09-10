import {
  users,
  assessments,
  insights,
  progressEntries,
  chatMessages,
  userGoals,
  type User,
  type UpsertUser,
  type Assessment,
  type InsertAssessment,
  type Insight,
  type InsertInsight,
  type ProgressEntry,
  type InsertProgressEntry,
  type ChatMessage,
  type InsertChatMessage,
  type UserGoal,
  type InsertUserGoal,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Assessment operations
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getUserAssessments(userId: string): Promise<Assessment[]>;
  getLatestAssessment(userId: string, platform?: string): Promise<Assessment | undefined>;
  
  // Insight operations
  createInsight(insight: InsertInsight): Promise<Insight>;
  getUserInsights(userId: string): Promise<Insight[]>;
  getLatestInsight(userId: string): Promise<Insight | undefined>;
  
  // Progress operations
  createProgressEntry(entry: InsertProgressEntry): Promise<ProgressEntry>;
  getUserProgress(userId: string, days?: number): Promise<ProgressEntry[]>;
  getLatestProgress(userId: string): Promise<ProgressEntry | undefined>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getUserChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
  
  // Goal operations
  createUserGoal(goal: InsertUserGoal): Promise<UserGoal>;
  getUserGoals(userId: string): Promise<UserGoal[]>;
  updateGoalProgress(goalId: string, currentValue: number, completed?: boolean): Promise<UserGoal>;
  getCompletedGoalsCount(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Assessment operations
  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [result] = await db.insert(assessments).values(assessment).returning();
    return result;
  }

  async getUserAssessments(userId: string): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.createdAt));
  }

  async getLatestAssessment(userId: string, platform?: string): Promise<Assessment | undefined> {
    const conditions = [eq(assessments.userId, userId)];
    if (platform) {
      conditions.push(eq(assessments.platform, platform));
    }
    
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(and(...conditions))
      .orderBy(desc(assessments.createdAt))
      .limit(1);
    
    return assessment;
  }

  // Insight operations
  async createInsight(insight: InsertInsight): Promise<Insight> {
    const [result] = await db.insert(insights).values(insight).returning();
    return result;
  }

  async getUserInsights(userId: string): Promise<Insight[]> {
    return await db
      .select()
      .from(insights)
      .where(eq(insights.userId, userId))
      .orderBy(desc(insights.createdAt));
  }

  async getLatestInsight(userId: string): Promise<Insight | undefined> {
    const [insight] = await db
      .select()
      .from(insights)
      .where(eq(insights.userId, userId))
      .orderBy(desc(insights.createdAt))
      .limit(1);
    
    return insight;
  }

  // Progress operations
  async createProgressEntry(entry: InsertProgressEntry): Promise<ProgressEntry> {
    const [result] = await db.insert(progressEntries).values(entry).returning();
    return result;
  }

  async getUserProgress(userId: string, days: number = 7): Promise<ProgressEntry[]> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    return await db
      .select()
      .from(progressEntries)
      .where(and(
        eq(progressEntries.userId, userId),
        gte(progressEntries.date, daysAgo)
      ))
      .orderBy(desc(progressEntries.date));
  }

  async getLatestProgress(userId: string): Promise<ProgressEntry | undefined> {
    const [progress] = await db
      .select()
      .from(progressEntries)
      .where(eq(progressEntries.userId, userId))
      .orderBy(desc(progressEntries.date))
      .limit(1);
    
    return progress;
  }

  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [result] = await db.insert(chatMessages).values(message).returning();
    return result;
  }

  async getUserChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // Goal operations
  async createUserGoal(goal: InsertUserGoal): Promise<UserGoal> {
    const [result] = await db.insert(userGoals).values(goal).returning();
    return result;
  }

  async getUserGoals(userId: string): Promise<UserGoal[]> {
    return await db
      .select()
      .from(userGoals)
      .where(eq(userGoals.userId, userId))
      .orderBy(desc(userGoals.createdAt));
  }

  async updateGoalProgress(goalId: string, currentValue: number, completed?: boolean): Promise<UserGoal> {
    const updateData: any = { currentValue };
    if (completed !== undefined) {
      updateData.isCompleted = completed;
      if (completed) {
        updateData.completedAt = new Date();
      }
    }

    const [result] = await db
      .update(userGoals)
      .set(updateData)
      .where(eq(userGoals.id, goalId))
      .returning();
    
    return result;
  }

  async getCompletedGoalsCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userGoals)
      .where(and(
        eq(userGoals.userId, userId),
        eq(userGoals.isCompleted, true)
      ));
    
    return result[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();
