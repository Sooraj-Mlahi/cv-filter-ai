# ResumeRank - Requirements Checklist

## ✅ COMPLETED Features

### Core Functionality
- ✅ **Dashboard Page** - Displays total CVs, last analysis date, highest score, recent activity
- ✅ **Fetch CVs from Email** - Page to connect and fetch from Gmail/Outlook
  - ✅ Outlook email integration working (Microsoft Graph API)
  - ⚠️ Gmail integration partially working (scope limitation - see notes below)
  - ✅ PDF, DOC, DOCX file support
  - ✅ Text extraction from attachments
  - ✅ Save file name, extracted text, date fetched
- ✅ **Resume Scoring (OpenAI API)**
  - ✅ User enters job description/prompt
  - ✅ AI compares CVs with prompt
  - ✅ Scores each resume 0-100
  - ✅ Generates strengths (1-3 bullets)
  - ✅ Generates weaknesses (1-3 bullets)
  - ✅ Saves analysis with prompt, score, strengths, weaknesses
- ✅ **Ranking System**
  - ✅ Automatically sorts resumes highest → lowest score
  - ✅ Card layout displaying all results
  - ✅ Shows candidate name, score
  - ✅ "View CV Text" modal
  - ✅ Download CV file button
- ✅ **Dark/Light Mode** - Toggle with localStorage persistence

---

## ❌ MISSING Features (To Be Implemented)

### 1. Authentication System (OAuth Only)
- ❌ **Log in with Gmail** - OAuth flow
- ❌ **Log in with Outlook** - OAuth flow  
- ❌ **Sign up using Gmail or Outlook** - OAuth-based signup
- ❌ **Reset/Forgot password** - OAuth email validation flow
- ❌ **Log out** - Clear session
- ❌ **Stay logged in** - Session cookie management
- ❌ **Protected Routes** - Redirect unauthenticated users to /login

### 2. Pages to Build
- ❌ **/login** - OAuth login page with Gmail and Outlook buttons
- ❌ **/signup** - OAuth signup page (likely same as login for OAuth)
- ❌ **/forgot-password** - OAuth-based password reset flow
- ❌ **Profile Page** 
  - Show name from OAuth
  - Show email (read-only)
  - Show profile image from Google/Outlook
  - Show date joined
  - No editing required
- ❌ **Settings Page**
  - ✅ Dark/Light mode toggle (already exists, need to integrate)
  - ❌ Delete account button
  - ❌ Clear all stored CVs
  - ❌ Clear analysis history
- ❌ **History Page**
  - List all past analyses
  - Show date, used prompt, total resumes analyzed
  - "View Results" button for each analysis

### 3. Dashboard Updates Needed
- ❌ Update navigation to include:
  - ✅ "Fetch CVs from Email" (exists)
  - ✅ "Enter Job Prompt & Run AI" (exists as "Rank Resumes")
  - ❌ "View History"
  - ❌ "Settings" 
  - ❌ "Profile"
  - ❌ "Logout" button

### 4. Database Schema Changes
- ❌ **Users Table**
  - id, email, name, profileImageUrl, provider (gmail/outlook)
  - oauthId, dateJoined
- ❌ **Sessions Table**
  - sessionId, userId, expiresAt
- ❌ **User Scoping**
  - ❌ Add userId foreign key to CVs table
  - ❌ Add userId foreign key to analyses table
  - ❌ Add userId foreign key to fetchHistory table
- ❌ **Update Storage Interface** - All CRUD operations need userId filtering

### 5. Backend API Changes
- ❌ **OAuth Endpoints**
  - ❌ POST /api/auth/google - Google OAuth callback
  - ❌ POST /api/auth/outlook - Outlook OAuth callback
  - ❌ POST /api/auth/logout - Clear session
  - ❌ GET /api/auth/me - Get current user
- ❌ **Session Middleware** - Verify user session on protected routes
- ❌ **User-Scoped APIs** - Filter all CV/analysis queries by userId
  - ❌ Update GET /api/stats (user-specific)
  - ❌ Update POST /api/fetch-cvs (link to userId)
  - ❌ Update GET /api/results (user-specific)
  - ❌ Update POST /api/analyze-cvs (user-specific)
  - ❌ Add GET /api/analyses/history (user's analysis history)
  - ❌ Add DELETE /api/user/account
  - ❌ Add DELETE /api/user/cvs
  - ❌ Add DELETE /api/user/analyses

### 6. Frontend Changes
- ❌ **Protected Route Wrapper** - Redirect to /login if not authenticated
- ❌ **Update App.tsx** - Add login/signup/forgot-password/profile/settings/history routes
- ❌ **Update existing pages** - Fetch user-specific data instead of shared data
- ❌ **Add user context** - Provide current user info throughout app

---

## ⚠️ KNOWN ISSUES

### Gmail Scope Limitation (CRITICAL)
**Problem**: The Replit Gmail connector only has these limited scopes:
- `gmail.addons.current.*` (Gmail add-on scopes)
- `gmail.labels`

**What we need**:
- `gmail.readonly` or `gmail.modify` to read email messages and attachments

**Current Error**: 
```
GaxiosError: Request had insufficient authentication scopes.
Status: 403 PERMISSION_DENIED
```

**Solutions (Choose One)**:

**Option A - Request Broader Scopes** (Recommended if possible)
- Contact Replit or reconfigure the Gmail connector to request `gmail.readonly` scope
- This would allow reading emails and attachments
- User would need to re-authorize Gmail with new scopes

**Option B - Implement Custom OAuth**
- Build our own Google OAuth flow separate from Replit connector
- Register app in Google Cloud Console
- Manage our own OAuth client credentials
- Request exactly the scopes we need
- More control but more complex setup

**Option C - Outlook Only**
- Disable Gmail fetching temporarily
- Focus on Outlook which currently works
- Add Gmail support later when scope issue is resolved

**Impact**: Gmail CV fetching is currently non-functional. Outlook works perfectly.

---

## 📊 Completion Summary

### Completed: ~45%
- ✅ Core CV fetching (Outlook working)
- ✅ AI analysis and ranking
- ✅ Dashboard, Results, Rank Resumes pages
- ✅ Dark mode
- ✅ OpenAI integration
- ✅ Outlook integration

### Remaining: ~55%
- ❌ Full authentication system (OAuth login/signup/logout)
- ❌ Session management
- ❌ User-scoped data
- ❌ Profile, Settings, History pages
- ❌ Gmail scope fix
- ❌ Protected routes
- ❌ Account management features

---

## 🎯 Recommended Implementation Order

1. **Fix Gmail Scope Issue** (Choose solution A, B, or C above)
2. **Database Schema** - Add users, sessions tables and foreign keys
3. **Backend Authentication** - OAuth endpoints and session middleware
4. **Login/Signup Pages** - Build OAuth flow UI
5. **Protected Routes** - Add auth guards
6. **User-Scoped Data** - Update all APIs to filter by userId
7. **Profile Page** - Display OAuth user info
8. **History Page** - List past analyses
9. **Settings Page** - Account management features
10. **Testing** - End-to-end authentication and user flow testing
