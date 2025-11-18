# ResumeRank - AI-Powered Resume Screening Platform

## Overview
ResumeRank is a full-stack web application that helps HR professionals and recruiters automatically fetch, analyze, and rank candidate resumes using AI. Built with React, Express, and OpenAI API.

## Recent Changes (Nov 18, 2025)
- **Authentication System**: Full Google OAuth via Replit Auth with session management
  - PostgreSQL-backed sessions with user-scoped data access
  - AuthProvider context for shared authentication state
  - Protected routes and authenticated navigation
  - User profile menu with logout functionality
- Complete MVP implementation with all core features
- Gmail and Outlook email integration for CV fetching
- OpenAI-powered resume analysis and scoring
- Full dark mode support with persistent theme
- Comprehensive dashboard with statistics and activity tracking

## Project Architecture

### Frontend (React + TypeScript)
- **Dashboard**: Overview with total CVs, last analysis date, highest score, and recent activity
- **Fetch CVs**: Connect Gmail/Outlook to import resume attachments automatically
- **Rank Resumes**: Enter job description for AI-powered CV analysis
- **Results**: View ranked candidates with scores, strengths, and weaknesses
- **Theme System**: Full dark/light mode with localStorage persistence

### Backend (Express + Node.js)
- **Authentication**: Replit Auth for Google OAuth login with PostgreSQL sessions
- **Email Integration**: Gmail API and Microsoft Graph API for fetching attachments
- **CV Extraction**: pdf-parse and mammoth for text extraction from PDF/DOCX
- **AI Analysis**: OpenAI GPT-4 for resume scoring and insights
- **Storage**: DatabaseStorage with PostgreSQL for user-scoped data persistence

### Key Technologies
- React with wouter for routing
- TanStack Query for data fetching
- Shadcn UI components
- OpenAI API for AI analysis
- Replit Connectors for Gmail/Outlook OAuth
- TypeScript for type safety

## API Endpoints

### Dashboard & Stats
- `GET /api/stats` - Dashboard statistics (total CVs, highest score, etc.)
- `GET /api/fetch-history` - Recent CV fetch activities

### Email Integration
- `GET /api/email-providers` - Check Gmail/Outlook connection status
- `POST /api/fetch-cvs` - Fetch CVs from email inbox
  - Body: `{ provider: "gmail" | "outlook" }`

### AI Analysis
- `POST /api/analyze-cvs` - Analyze all CVs with AI
  - Body: `{ jobDescription: string }`
- `GET /api/results` - Get ranked CVs with analysis
- `GET /api/analyses` - Get all analyses

## Data Models

### CV
- candidateName, candidateEmail
- fileName, fileType (pdf/docx)
- extractedText (full resume content)
- source (Gmail/Outlook)
- dateReceived

### Analysis
- cvId (foreign key)
- jobDescription
- score (0-100)
- strengths (array of strings)
- weaknesses (array of strings)
- analyzedAt

### FetchHistory
- source (gmail/outlook)
- cvsCount
- fetchedAt

## Environment Variables
- `OPENAI_API_KEY` - Required for AI analysis
- `REPLIT_CONNECTORS_HOSTNAME` - Auto-provided by Replit
- `REPL_IDENTITY` / `WEB_REPL_RENEWAL` - Auto-provided by Replit

## User Workflow
1. **Sign In**: Authenticate with Google OAuth via Replit Auth
2. **Connect Email**: Authorize Gmail or Outlook integration
3. **Fetch CVs**: Import resume attachments from inbox
4. **Define Role**: Enter job description and requirements
5. **Analyze**: AI scores and ranks all candidates
6. **Review**: View ranked results with insights

## Design Guidelines
- Uses Inter font for modern, professional appearance
- Blue primary color (#3B82F6) for CTAs and key actions
- Dark mode with proper contrast ratios
- Card-based layout for information hierarchy
- Comprehensive loading and empty states

## Development
- Run: `npm run dev` (starts Express server on port 5000)
- Build: `npm run build`
- Type check: `npm run check`

## Future Enhancements
- Bulk CV re-analysis with different job descriptions
- Advanced filtering and search
- Side-by-side candidate comparison
- Email notifications for top candidates
- Export results to CSV/PDF
