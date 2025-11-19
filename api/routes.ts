import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./googleAuth";
import { getGmailAuthUrl, setGmailTokens, isGmailConnected, getGmailClient } from "./gmail-auth";
import { getOutlookAuthUrl, setOutlookTokens, isOutlookConnected, getOutlookClient } from "./outlook-auth";
import { extractTextFromCV, extractCandidateInfo } from "./cv-extractor";
import { analyzeCVWithOpenAI } from "./openai-service";
import { z } from "zod";
import { db } from "./db";
import { cvs } from "./shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    });
  });

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Get dashboard stats (protected)
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  // Email Provider Authentication Routes
  app.get("/api/auth/gmail", isAuthenticated, (req, res) => {
    const authUrl = getGmailAuthUrl();
    res.redirect(authUrl);
  });

  app.get("/api/auth/callback/gmail", isAuthenticated, async (req: any, res) => {
    try {
      const { code } = req.query;
      const userId = req.user.id;
      
      console.log(`Gmail callback: userId=${userId}, code=${code ? 'present' : 'missing'}`);
      
      await setGmailTokens(userId, code);
      
      console.log(`Gmail tokens set successfully, redirecting to dashboard`);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
      res.redirect(`${frontendUrl}?gmail_connected=true`);
    } catch (error) {
      console.error("Gmail auth error:", error);
      console.log(`Gmail auth failed, redirecting to dashboard with error`);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
      res.redirect(`${frontendUrl}?error=gmail_auth_failed`);
    }
  });

  app.get("/api/auth/outlook", isAuthenticated, (req, res) => {
    const authUrl = getOutlookAuthUrl();
    res.redirect(authUrl);
  });

  app.get("/api/auth/callback/outlook", isAuthenticated, async (req: any, res) => {
    try {
      const { code } = req.query;
      const userId = req.user.id;
      
      await setOutlookTokens(userId, code);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
      res.redirect(`${frontendUrl}?outlook_connected=true`);
    } catch (error) {
      console.error("Outlook auth error:", error);
      res.redirect("http://localhost:5000?error=outlook_auth_failed");
    }
  });

  // Get fetch history (protected)
  app.get("/api/fetch-history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const history = await storage.getAllFetchHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Get email provider status (protected)
  app.get("/api/email-providers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const providers = [];

      // Check Gmail connection
      try {
        if (isGmailConnected(userId)) {
          const latestGmail = await storage.getLatestFetchBySource("gmail", userId);
          providers.push({
            name: "Gmail",
            icon: "SiGmail",
            color: "#EA4335",
            status: "connected",
            lastFetch: latestGmail?.fetchedAt.toISOString(),
          });
        } else {
          providers.push({
            name: "Gmail",
            icon: "SiGmail",
            color: "#EA4335",
            status: "not_connected",
            authUrl: "/api/auth/gmail"
          });
        }
      } catch (error) {
        providers.push({
          name: "Gmail",
          icon: "SiGmail",
          color: "#EA4335",
          status: "not_connected",
          authUrl: "/api/auth/gmail"
        });
      }

      // Check Outlook connection
      try {
        if (isOutlookConnected(userId)) {
          const latestOutlook = await storage.getLatestFetchBySource("outlook", userId);
          providers.push({
            name: "Outlook",
            icon: "Inbox",
            color: "#0078D4",
            status: "connected",
            lastFetch: latestOutlook?.fetchedAt.toISOString(),
          });
        } else {
          providers.push({
            name: "Outlook",
            icon: "Inbox",
            color: "#0078D4",
            status: "not_connected",
            authUrl: "/api/auth/outlook"
          });
        }
      } catch (error) {
        providers.push({
          name: "Outlook",
          icon: "Inbox",
          color: "#0078D4",
          status: "not_connected",
          authUrl: "/api/auth/outlook"
        });
      }

      res.json(providers);
    } catch (error) {
      console.error("Error checking email providers:", error);
      res.status(500).json({ error: "Failed to check email provider status" });
    }
  });

  // Fetch CVs from email (protected)
  app.post("/api/fetch-cvs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const schema = z.object({
        provider: z.enum(["gmail", "outlook"]),
        daysBack: z.number().min(1).max(365).optional().default(30),
        keywords: z.array(z.string()).optional().default([]),
      });

      const { provider, daysBack, keywords } = schema.parse(req.body);
      let count = 0;

      if (provider === "gmail") {
        count = await fetchFromGmail(userId, daysBack, keywords);
      } else if (provider === "outlook") {
        count = await fetchFromOutlook(userId);
      }

      // Create fetch history
      await storage.createFetchHistory({
        userId,
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

  // Analyze CVs with AI (protected)
  app.post("/api/analyze-cvs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const schema = z.object({
        jobDescription: z.string().min(10),
      });

      const { jobDescription } = schema.parse(req.body);

      const allCVs = await storage.getAllCVs(userId);

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
            userId,
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

  // Get analysis results (protected)
  app.get("/api/results", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const results = await storage.getCVsWithLatestAnalysis(userId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ error: "Failed to fetch analysis results" });
    }
  });

  // Get all analyses (protected)
  app.get("/api/analyses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const analyses = await storage.getAllAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      res.status(500).json({ error: "Failed to fetch analyses" });
    }
  });

  // Delete account (protected)
  app.delete("/api/user/account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.deleteUserAccount(userId);
      req.logout(() => {
        res.json({ message: "Account deleted successfully" });
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  // Delete all CVs (protected)
  app.delete("/api/user/cvs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.deleteAllCVs(userId);
      res.json({ message: "All CVs deleted successfully" });
    } catch (error) {
      console.error("Error deleting CVs:", error);
      res.status(500).json({ error: "Failed to delete CVs" });
    }
  });

  // Download original CV file (protected)
  app.get("/api/cv/:id/download", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const cv = await storage.getCVById(id, userId);
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }

      if (!cv.fileBuffer) {
        return res.status(404).json({ error: "Original file not available" });
      }

      // Set appropriate headers for file download
      const fileExtension = cv.fileType === 'pdf' ? 'pdf' : 'docx';
      const contentType = cv.fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${cv.fileName || `resume.${fileExtension}`}"`);
      
      // Convert base64 back to buffer and send
      const buffer = Buffer.from(cv.fileBuffer, 'base64');
      res.send(buffer);
    } catch (error) {
      console.error("Error downloading CV:", error);
      res.status(500).json({ error: "Failed to download CV" });
    }
  });

  // Re-process existing CVs to extract real text (protected)
  app.post("/api/reprocess-cvs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const allCVs = await storage.getAllCVs(userId);
      
      let processedCount = 0;
      
      for (const cv of allCVs) {
        if (cv.fileBuffer && cv.extractedText.includes('placeholder text for testing purposes')) {
          try {
            const buffer = Buffer.from(cv.fileBuffer, 'base64');
            const newExtractedText = await extractTextFromCV(buffer, cv.fileType);
            
            // Update the CV with new extracted text
            await db.update(cvs)
              .set({ extractedText: newExtractedText })
              .where(eq(cvs.id, cv.id));
              
            processedCount++;
          } catch (error) {
            console.error(`Failed to reprocess CV ${cv.id}:`, error);
          }
        }
      }
      
      res.json({ 
        message: `Successfully reprocessed ${processedCount} CV(s)`,
        count: processedCount 
      });
    } catch (error) {
      console.error("Error reprocessing CVs:", error);
      res.status(500).json({ error: "Failed to reprocess CVs" });
    }
  });

  // Delete all analyses (protected)
  app.delete("/api/user/analyses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.deleteAllAnalyses(userId);
      res.json({ message: "All analyses deleted successfully" });
    } catch (error) {
      console.error("Error deleting analyses:", error);
      res.status(500).json({ error: "Failed to delete analyses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to fetch CVs from Gmail
async function fetchFromGmail(userId: string, daysBack: number = 30, customKeywords: string[] = []): Promise<number> {
  const gmail = getGmailClient(userId);
  let count = 0;

  try {
    // Build search queries with date range and keywords
    const dateFilter = `newer_than:${daysBack}d`;
    const baseKeywords = ['resume', 'cv', 'curriculum vitae', 'application', 'job application'];
    const allKeywords = [...baseKeywords, ...customKeywords];
    
    // More comprehensive search queries to catch different patterns
    const searchQueries = [
      // Basic attachment search with broader terms
      `has:attachment ${dateFilter}`,
      // Specific CV/resume terms
      `(resume OR cv OR "curriculum vitae") ${dateFilter}`,
      // Job application terms  
      `(application OR "job application" OR "job posting") ${dateFilter}`,
      // File-based searches
      `filename:(.pdf OR .doc OR .docx) ${dateFilter}`,
      // Subject line searches
      `subject:(resume OR cv OR application) ${dateFilter}`,
      // Combined searches
      `has:attachment (resume OR cv) ${dateFilter}`,
      `has:attachment (application OR intern OR position) ${dateFilter}`
    ];

    let allMessages: any[] = [];

    console.log(`Searching with ${searchQueries.length} different queries for last ${daysBack} days...`);

    // Search with multiple targeted queries to catch different CV patterns
    for (let i = 0; i < searchQueries.length; i++) {
      const query = searchQueries[i];
      console.log(`Query ${i + 1}: ${query}`);
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50,
      });
      
      const messages = response.data.messages || [];
      console.log(`Query ${i + 1} found ${messages.length} messages`);
      allMessages = allMessages.concat(messages);
    }

    // Remove duplicates based on message ID
    const uniqueMessages = Array.from(
      new Map(allMessages.map(msg => [msg.id, msg])).values()
    );

    console.log(`Found ${uniqueMessages.length} potential CV emails`);

    for (const message of uniqueMessages) {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
      });

      const parts = msg.data.payload?.parts || [];
      const headers = msg.data.payload?.headers || [];
      
      const fromHeader = headers.find((h: any) => h.name?.toLowerCase() === 'from');
      const senderEmail = fromHeader?.value?.match(/<(.+?)>/) ? 
        fromHeader.value.match(/<(.+?)>/)![1] : 
        fromHeader?.value || 'unknown@example.com';

      console.log(`Processing email from: ${senderEmail}, parts: ${parts.length}`);

      // Function to recursively find attachments in nested parts
      const findAttachments = (emailParts: any[]): any[] => {
        let attachments: any[] = [];
        for (const part of emailParts) {
          if (part.filename && part.body?.attachmentId) {
            attachments.push(part);
          }
          if (part.parts && Array.isArray(part.parts)) {
            attachments = attachments.concat(findAttachments(part.parts));
          }
        }
        return attachments;
      };

      const allAttachments = findAttachments(parts);
      console.log(`Found ${allAttachments.length} total attachments in email`);

      for (const part of allAttachments) {
        console.log(`Checking part: ${part.filename}, mimeType: ${part.mimeType}, hasAttachment: ${!!part.body?.attachmentId}`);
        
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
            
            console.log(`Processing CV attachment: ${part.filename}`);
            
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
                  userId,
                  candidateName: name,
                  candidateEmail: email,
                  fileName: part.filename,
                  fileType: fileType,
                  extractedText,
                  fileBuffer: attachment.data.data || null,
                  source: 'Gmail',
                });

                count++;
                console.log(`Successfully created CV: ${part.filename} from ${senderEmail}`);
              }
            } catch (error) {
              console.error(`Error processing attachment ${part.filename}:`, error);
              // Still try to save the CV even if text extraction failed
              try {
                const attachment = await gmail.users.messages.attachments.get({
                  userId: 'me',
                  messageId: message.id!,
                  id: part.body.attachmentId,
                });

                if (attachment.data.data) {
                  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                  await storage.createCV({
                    userId,
                    candidateName: 'Unknown',
                    candidateEmail: senderEmail,
                    fileName: part.filename,
                    fileType: filename.endsWith('.pdf') ? 'pdf' : 'docx',
                    extractedText: `Text extraction failed: ${errorMessage}`,
                    fileBuffer: attachment.data.data || null,
                    source: 'Gmail',
                  });
                  count++;
                  console.log(`Saved CV with extraction error: ${part.filename}`);
                }
              } catch (saveError) {
                console.error(`Failed to save CV ${part.filename}:`, saveError);
              }
            }
          } else {
            console.log(`Skipping non-CV attachment: ${part.filename} (${mimeType})`);
          }
        } else {
          console.log(`Skipping part without attachment: ${part.filename || 'unnamed'}`);
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
async function fetchFromOutlook(userId: string): Promise<number> {
  const outlook = getOutlookClient(userId);
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
                  userId,
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
