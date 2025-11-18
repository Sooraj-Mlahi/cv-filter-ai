import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getUncachableGmailClient } from "./gmail-client";
import { getUncachableOutlookClient } from "./outlook-client";
import { extractTextFromCV, extractCandidateInfo } from "./cv-extractor";
import { analyzeCVWithOpenAI } from "./openai-service";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  // Get fetch history
  app.get("/api/fetch-history", async (req, res) => {
    try {
      const history = await storage.getAllFetchHistory();
      res.json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Get email provider status
  app.get("/api/email-providers", async (req, res) => {
    try {
      const providers = [];

      // Check Gmail connection
      try {
        await getUncachableGmailClient();
        const latestGmail = await storage.getLatestFetchBySource("gmail");
        providers.push({
          name: "Gmail",
          icon: "SiGmail",
          color: "#EA4335",
          status: "connected",
          lastFetch: latestGmail?.fetchedAt.toISOString(),
        });
      } catch (error) {
        providers.push({
          name: "Gmail",
          icon: "SiGmail",
          color: "#EA4335",
          status: "not_connected",
        });
      }

      // Check Outlook connection
      try {
        await getUncachableOutlookClient();
        const latestOutlook = await storage.getLatestFetchBySource("outlook");
        providers.push({
          name: "Outlook",
          icon: "SiMicrosoftoutlook",
          color: "#0078D4",
          status: "connected",
          lastFetch: latestOutlook?.fetchedAt.toISOString(),
        });
      } catch (error) {
        providers.push({
          name: "Outlook",
          icon: "SiMicrosoftoutlook",
          color: "#0078D4",
          status: "not_connected",
        });
      }

      res.json(providers);
    } catch (error) {
      console.error("Error checking email providers:", error);
      res.status(500).json({ error: "Failed to check email provider status" });
    }
  });

  // Fetch CVs from email
  app.post("/api/fetch-cvs", async (req, res) => {
    try {
      const schema = z.object({
        provider: z.enum(["gmail", "outlook"]),
      });

      const { provider } = schema.parse(req.body);
      let count = 0;

      if (provider === "gmail") {
        count = await fetchFromGmail();
      } else if (provider === "outlook") {
        count = await fetchFromOutlook();
      }

      // Create fetch history
      await storage.createFetchHistory({
        source: provider,
        cvsCount: count,
      });

      res.json({ count, message: `Successfully fetched ${count} CV(s)` });
    } catch (error: any) {
      console.error("Error fetching CVs:", error);
      res.status(500).json({ 
        error: error.message || "Failed to fetch CVs from email" 
      });
    }
  });

  // Analyze CVs with AI
  app.post("/api/analyze-cvs", async (req, res) => {
    try {
      const schema = z.object({
        jobDescription: z.string().min(10),
      });

      const { jobDescription } = schema.parse(req.body);

      const allCVs = await storage.getAllCVs();

      if (allCVs.length === 0) {
        return res.status(400).json({ error: "No CVs available to analyze" });
      }

      // Analyze each CV
      let successCount = 0;
      for (const cv of allCVs) {
        try {
          const analysis = await analyzeCVWithOpenAI(
            cv.extractedText,
            jobDescription,
            cv.candidateName
          );

          await storage.createAnalysis({
            cvId: cv.id,
            jobDescription,
            score: analysis.score,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
          });

          successCount++;
        } catch (error) {
          console.error(`Error analyzing CV ${cv.id}:`, error);
          // Continue with other CVs even if one fails
        }
      }

      if (successCount === 0) {
        return res.status(500).json({ error: "Failed to analyze any CVs" });
      }

      res.json({ 
        count: successCount, 
        message: `Successfully analyzed ${successCount} CV(s)` 
      });
    } catch (error: any) {
      console.error("Error in CV analysis:", error);
      res.status(500).json({ 
        error: error.message || "Failed to analyze CVs" 
      });
    }
  });

  // Get analysis results
  app.get("/api/results", async (req, res) => {
    try {
      const results = await storage.getCVsWithLatestAnalysis();
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ error: "Failed to fetch analysis results" });
    }
  });

  // Get all analyses
  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAllAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      res.status(500).json({ error: "Failed to fetch analyses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to fetch CVs from Gmail
async function fetchFromGmail(): Promise<number> {
  const gmail = await getUncachableGmailClient();
  let count = 0;

  try {
    // Search for emails with attachments in the last 30 days
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'has:attachment newer_than:30d',
      maxResults: 50,
    });

    const messages = response.data.messages || [];

    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
      });

      const parts = msg.data.payload?.parts || [];
      const headers = msg.data.payload?.headers || [];
      
      const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from');
      const senderEmail = fromHeader?.value?.match(/<(.+?)>/) ? 
        fromHeader.value.match(/<(.+?)>/)![1] : 
        fromHeader?.value || 'unknown@example.com';

      for (const part of parts) {
        if (part.filename && part.body?.attachmentId) {
          const filename = part.filename.toLowerCase();
          const mimeType = part.mimeType || '';

          // Check if it's a resume file
          if (filename.endsWith('.pdf') || 
              filename.endsWith('.doc') || 
              filename.endsWith('.docx') ||
              mimeType.includes('pdf') ||
              mimeType.includes('word') ||
              mimeType.includes('document')) {
            
            try {
              const attachment = await gmail.users.messages.attachments.get({
                userId: 'me',
                messageId: message.id!,
                id: part.body.attachmentId,
              });

              if (attachment.data.data) {
                const buffer = Buffer.from(attachment.data.data, 'base64');
                const fileType = filename.endsWith('.pdf') ? 'pdf' : 'docx';
                
                const extractedText = await extractTextFromCV(buffer, fileType);
                const { name, email } = extractCandidateInfo(extractedText, senderEmail);

                await storage.createCV({
                  candidateName: name,
                  candidateEmail: email,
                  fileName: part.filename,
                  fileType: fileType,
                  extractedText,
                  fileBuffer: attachment.data.data || null,
                  source: 'Gmail',
                });

                count++;
              }
            } catch (error) {
              console.error(`Error processing attachment ${part.filename}:`, error);
              // Continue with next attachment
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Gmail fetch error:", error);
    throw new Error("Failed to fetch emails from Gmail");
  }

  return count;
}

// Helper function to fetch CVs from Outlook
async function fetchFromOutlook(): Promise<number> {
  const outlook = await getUncachableOutlookClient();
  let count = 0;

  try {
    // Get messages with attachments from the last 30 days
    const response = await outlook
      .api('/me/messages')
      .filter('hasAttachments eq true')
      .top(50)
      .get();

    const messages = response.value || [];

    for (const message of messages) {
      try {
        const attachments = await outlook
          .api(`/me/messages/${message.id}/attachments`)
          .get();

        const senderEmail = message.from?.emailAddress?.address || 'unknown@example.com';

        for (const attachment of attachments.value || []) {
          if (attachment.contentType && attachment.contentBytes) {
            const filename = attachment.name?.toLowerCase() || '';

            // Check if it's a resume file
            if (filename.endsWith('.pdf') || 
                filename.endsWith('.doc') || 
                filename.endsWith('.docx') ||
                attachment.contentType.includes('pdf') ||
                attachment.contentType.includes('word') ||
                attachment.contentType.includes('document')) {
              
              try {
                const buffer = Buffer.from(attachment.contentBytes, 'base64');
                const fileType = filename.endsWith('.pdf') ? 'pdf' : 'docx';
                
                const extractedText = await extractTextFromCV(buffer, fileType);
                const { name, email } = extractCandidateInfo(extractedText, senderEmail);

                await storage.createCV({
                  candidateName: name,
                  candidateEmail: email,
                  fileName: attachment.name,
                  fileType: fileType,
                  extractedText,
                  fileBuffer: attachment.contentBytes || null,
                  source: 'Outlook',
                });

                count++;
              } catch (error) {
                console.error(`Error processing attachment ${attachment.name}:`, error);
                // Continue with next attachment
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
        // Continue with next message
      }
    }
  } catch (error) {
    console.error("Outlook fetch error:", error);
    throw new Error("Failed to fetch emails from Outlook");
  }

  return count;
}
