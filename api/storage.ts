import { 
  type CV, 
  type InsertCV,
  type Analysis,
  type InsertAnalysis,
  type FetchHistory,
  type InsertFetchHistory,
  type CVWithAnalysis,
  type DashboardStats,
  type User,
  type UpsertUser,
  users,
  cvs,
  analyses,
  fetchHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required by Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // CV operations (user-scoped)
  createCV(cv: InsertCV): Promise<CV>;
  getAllCVs(userId: string): Promise<CV[]>;
  getCVById(id: string, userId: string): Promise<CV | undefined>;
  deleteAllCVs(userId: string): Promise<void>;
  
  // Analysis operations (user-scoped)
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysesByJobDescription(jobDescription: string, userId: string): Promise<Analysis[]>;
  getAllAnalyses(userId: string): Promise<Analysis[]>;
  deleteAllAnalyses(userId: string): Promise<void>;
  
  // Fetch history operations (user-scoped)
  createFetchHistory(history: InsertFetchHistory): Promise<FetchHistory>;
  getAllFetchHistory(userId: string): Promise<FetchHistory[]>;
  getLatestFetchBySource(source: string, userId: string): Promise<FetchHistory | undefined>;
  
  // Combined queries (user-scoped)
  getCVsWithLatestAnalysis(userId: string): Promise<CVWithAnalysis[]>;
  getDashboardStats(userId: string): Promise<DashboardStats>;
  
  // Account management
  deleteUserAccount(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required by Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
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

  // CV operations (user-scoped)
  async createCV(insertCV: InsertCV): Promise<CV> {
    const [cv] = await db.insert(cvs).values(insertCV).returning();
    return cv;
  }

  async getAllCVs(userId: string): Promise<CV[]> {
    return await db.select().from(cvs).where(eq(cvs.userId, userId));
  }

  async getCVById(id: string, userId: string): Promise<CV | undefined> {
    const [cv] = await db.select().from(cvs).where(
      and(eq(cvs.id, id), eq(cvs.userId, userId))
    );
    return cv || undefined;
  }

  async deleteAllCVs(userId: string): Promise<void> {
    await db.delete(cvs).where(eq(cvs.userId, userId));
  }

  // Analysis operations (user-scoped)
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db.insert(analyses).values({
      ...insertAnalysis,
      strengths: insertAnalysis.strengths as any,
      weaknesses: insertAnalysis.weaknesses as any,
    }).returning();
    return analysis;
  }

  async getAnalysesByJobDescription(jobDescription: string, userId: string): Promise<Analysis[]> {
    return await db.select().from(analyses).where(
      and(eq(analyses.jobDescription, jobDescription), eq(analyses.userId, userId))
    );
  }

  async getAllAnalyses(userId: string): Promise<Analysis[]> {
    return await db.select().from(analyses).where(eq(analyses.userId, userId));
  }

  async deleteAllAnalyses(userId: string): Promise<void> {
    await db.delete(analyses).where(eq(analyses.userId, userId));
  }

  // Fetch history operations (user-scoped)
  async createFetchHistory(insertHistory: InsertFetchHistory): Promise<FetchHistory> {
    const [history] = await db.insert(fetchHistory).values(insertHistory).returning();
    return history;
  }

  async getAllFetchHistory(userId: string): Promise<FetchHistory[]> {
    return await db.select().from(fetchHistory)
      .where(eq(fetchHistory.userId, userId))
      .orderBy(desc(fetchHistory.fetchedAt));
  }

  async getLatestFetchBySource(source: string, userId: string): Promise<FetchHistory | undefined> {
    const [history] = await db.select().from(fetchHistory)
      .where(and(eq(fetchHistory.source, source), eq(fetchHistory.userId, userId)))
      .orderBy(desc(fetchHistory.fetchedAt))
      .limit(1);
    return history || undefined;
  }

  // Combined queries (user-scoped)
  async getCVsWithLatestAnalysis(userId: string): Promise<CVWithAnalysis[]> {
    const allCVs = await this.getAllCVs(userId);
    const allAnalyses = await this.getAllAnalyses(userId);
    
    // Group analyses by CV ID and get the latest one
    const latestAnalysesByCV = new Map<string, Analysis>();
    allAnalyses.forEach((analysis) => {
      const existing = latestAnalysesByCV.get(analysis.cvId);
      if (!existing || new Date(analysis.analyzedAt) > new Date(existing.analyzedAt)) {
        latestAnalysesByCV.set(analysis.cvId, analysis);
      }
    });

    // Combine CVs with their latest analysis
    const cvsWithAnalysis: CVWithAnalysis[] = allCVs.map((cv) => ({
      ...cv,
      analysis: latestAnalysesByCV.get(cv.id),
    }));

    // Sort by score (highest first), then by date
    return cvsWithAnalysis.sort((a, b) => {
      const scoreA = a.analysis?.score ?? -1;
      const scoreB = b.analysis?.score ?? -1;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime();
    });
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const allCVs = await this.getAllCVs(userId);
    const allAnalyses = await this.getAllAnalyses(userId);

    const totalCVs = allCVs.length;
    
    const sortedAnalyses = allAnalyses.sort(
      (a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
    );
    const lastAnalysisDate = sortedAnalyses.length > 0 
      ? sortedAnalyses[0].analyzedAt.toISOString() 
      : null;

    const scores = allAnalyses.map((a) => a.score);
    const highestScore = scores.length > 0 ? Math.max(...scores) : null;
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      : null;

    return {
      totalCVs,
      lastAnalysisDate,
      highestScore,
      averageScore,
    };
  }

  // Account management
  async deleteUserAccount(userId: string): Promise<void> {
    // Delete user (cascade will handle related records)
    await db.delete(users).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
