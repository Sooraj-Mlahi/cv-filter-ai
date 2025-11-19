# CVFilterAI - AI-Powered Resume Screening Platform

A modern web application that automates resume screening and candidate ranking using AI. Connect your email providers (Gmail/Outlook), automatically fetch resumes, and get AI-powered analysis with ranking scores.

## Features

- 🤖 **AI-Powered Analysis**: OpenAI integration for intelligent resume screening
- 📧 **Email Integration**: Automatic CV fetching from Gmail and Outlook
- 📊 **Smart Ranking**: Candidates ranked by job match score with detailed insights  
- 🎨 **Modern UI**: Clean, responsive design with professional interface
- 🔒 **Secure Authentication**: Google OAuth integration
- 📄 **Multi-Format Support**: PDF and DOCX resume processing
- ⬇️ **File Management**: Download original resumes and view full content

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with Google OAuth
- **AI**: OpenAI API for text analysis
- **Email APIs**: Gmail API, Microsoft Graph API
- **PDF Processing**: pdf-parse for text extraction

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Google OAuth credentials
- Microsoft OAuth credentials (for Outlook)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CVFilterAI
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.production .env
# Edit .env with your configuration
```

4. Initialize database:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

### Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## Environment Configuration

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Session
SESSION_SECRET=your-secure-random-string

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback/google

# Gmail API  
GMAIL_REDIRECT_URI=https://yourdomain.com/api/auth/callback/gmail

# Microsoft OAuth (Optional)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_REDIRECT_URI=https://yourdomain.com/api/auth/callback/outlook
```

## Usage

1. **Login**: Authenticate with Google account
2. **Connect Email**: Link Gmail or Outlook account
3. **Fetch CVs**: Automatically import resumes from email attachments
4. **Analyze**: Enter job description and analyze candidates with AI
5. **Review**: View ranked results with scores, strengths, and weaknesses
6. **Download**: Access original resume files

## API Endpoints

- `GET /api/auth/user` - Get current user
- `GET /api/stats` - Dashboard statistics
- `POST /api/fetch-cvs` - Fetch CVs from email providers
- `POST /api/analyze` - Analyze CVs with AI
- `GET /api/results` - Get analysis results
- `GET /api/cv/:id/download` - Download CV file

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Application pages
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and configs
├── server/               # Express backend
│   ├── routes.ts         # API routes
│   ├── auth/             # Authentication logic
│   ├── db.ts             # Database connection
│   └── services/         # Business logic
├── shared/               # Shared types and schemas
└── dist/                 # Build output
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run check` - TypeScript type checking
- `npm run db:push` - Update database schema

## License

MIT License - see LICENSE file for details.