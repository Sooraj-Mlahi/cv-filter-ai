import { 
  type CV, 
  type InsertCV,
  type Analysis,
  type InsertAnalysis,
  type FetchHistory,
  type InsertFetchHistory,
  type CVWithAnalysis,
  type DashboardStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // CV operations
  createCV(cv: InsertCV): Promise<CV>;
  getAllCVs(): Promise<CV[]>;
  getCVById(id: string): Promise<CV | undefined>;
  
  // Analysis operations
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysesByJobDescription(jobDescription: string): Promise<Analysis[]>;
  getAllAnalyses(): Promise<Analysis[]>;
  
  // Fetch history operations
  createFetchHistory(history: InsertFetchHistory): Promise<FetchHistory>;
  getAllFetchHistory(): Promise<FetchHistory[]>;
  getLatestFetchBySource(source: string): Promise<FetchHistory | undefined>;
  
  // Combined queries
  getCVsWithLatestAnalysis(): Promise<CVWithAnalysis[]>;
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private cvs: Map<string, CV>;
  private analyses: Map<string, Analysis>;
  private fetchHistory: Map<string, FetchHistory>;

  constructor() {
    this.cvs = new Map();
    this.analyses = new Map();
    this.fetchHistory = new Map();
  }

  async createCV(insertCV: InsertCV): Promise<CV> {
    const id = randomUUID();
    const cv: CV = {
      ...insertCV,
      id,
      dateReceived: new Date(),
    };
    this.cvs.set(id, cv);
    return cv;
  }

  async getAllCVs(): Promise<CV[]> {
    return Array.from(this.cvs.values());
  }

  async getCVById(id: string): Promise<CV | undefined> {
    return this.cvs.get(id);
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = randomUUID();
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      analyzedAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysesByJobDescription(jobDescription: string): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).filter(
      (a) => a.jobDescription === jobDescription
    );
  }

  async getAllAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values());
  }

  async createFetchHistory(insertHistory: InsertFetchHistory): Promise<FetchHistory> {
    const id = randomUUID();
    const history: FetchHistory = {
      ...insertHistory,
      id,
      fetchedAt: new Date(),
    };
    this.fetchHistory.set(id, history);
    return history;
  }

  async getAllFetchHistory(): Promise<FetchHistory[]> {
    return Array.from(this.fetchHistory.values())
      .sort((a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime());
  }

  async getLatestFetchBySource(source: string): Promise<FetchHistory | undefined> {
    const sourceHistory = Array.from(this.fetchHistory.values())
      .filter((h) => h.source.toLowerCase() === source.toLowerCase())
      .sort((a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime());
    
    return sourceHistory[0];
  }

  async getCVsWithLatestAnalysis(): Promise<CVWithAnalysis[]> {
    const allCVs = await this.getAllCVs();
    const allAnalyses = await this.getAllAnalyses();
    
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

  async getDashboardStats(): Promise<DashboardStats> {
    const allCVs = await this.getAllCVs();
    const allAnalyses = await this.getAllAnalyses();

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
}

export const storage = new MemStorage();
