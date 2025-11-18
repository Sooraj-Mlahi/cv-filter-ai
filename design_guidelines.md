# ResumeRank Design Guidelines

## Design Approach
**System-Based Approach**: Material Design 3 / Tailwind UI patterns optimized for data-intensive productivity applications with clear information hierarchy and efficient workflows.

**Critical Requirement**: Design must match the provided screenshot references while supporting both light and dark modes.

## Design Principles
1. **Data-First Interface**: Prioritize clear data presentation and scanning efficiency
2. **Professional Utility**: Clean, distraction-free experience for HR/recruiters
3. **Status Clarity**: Clear visual feedback for OAuth connections, CV processing states
4. **Efficient Workflows**: Minimize clicks between CV import → analysis → review

## Typography
- **Headings**: font-semibold to font-bold, text-2xl to text-4xl
- **Body Text**: text-sm to text-base, font-normal, line-height relaxed for readability
- **Data/Scores**: font-mono for numerical scores, font-semibold for emphasis
- **Metadata**: text-xs to text-sm, muted styling for secondary info

## Layout System
**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16 for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: mb-6 to mb-12
- Card gaps: gap-4 to gap-6

**Container Strategy**:
- Dashboard: max-w-7xl with grid layouts for stats cards
- Content areas: max-w-6xl for forms and lists
- Modals/Dialogs: max-w-2xl for focused interactions

## Component Library

### Navigation & Header
- Fixed top navigation with logo, dark mode toggle, user profile menu
- Sidebar navigation (optional) or horizontal tabs for main sections: Dashboard, Fetch CVs, Rank Resumes
- Breadcrumbs for sub-navigation context

### Dashboard Cards
- Stats cards grid (2x2 or 4x1): Total CVs, Last Analysis, Highest Score, Average Score
- Each card: Large number display, label, subtle icon, trend indicator
- Recent Activity feed: Timeline-style list of recent actions

### OAuth Connection Cards
- Gmail and Outlook connection status cards
- Clear "Connect" CTAs when not authenticated
- Connected state: email display, disconnect option, last sync timestamp
- Visual status indicators (connected/disconnected)

### CV List/Table
- Table view with columns: Candidate Name, Email, Date Received, File Type, Status
- Checkbox selection for batch operations
- Sortable columns, search/filter controls
- Row actions: View, Download, Delete
- Pagination controls

### Job Description Input
- Large textarea (min-height: 200px) for job prompt entry
- Character count indicator
- "Analyze CVs" primary CTA
- Clear input button
- Save/Load previous prompts option

### Ranked Results Display
- Card-based layout for each candidate result
- Header: Candidate name, score badge (large, prominent, 0-100)
- Score visualization: Progress bar or circular gauge
- Collapsible sections:
  - **Strengths**: Bulleted list (1-3 items), positive indicator color
  - **Weaknesses**: Bulleted list (1-3 items), warning indicator color
- Action buttons: View Full CV, Download Original, View Details
- Sort controls: Score (high to low), Name, Date

### Buttons & Actions
- Primary: Prominent, high contrast for main actions (Analyze, Connect, Submit)
- Secondary: Outlined or ghost style for alternate actions
- Icon buttons: For compact actions (delete, download, expand)
- Loading states: Spinner or skeleton loaders during API calls

### Modals & Overlays
- CV text preview modal: Full-screen or large modal with formatted text display
- Confirmation dialogs: For destructive actions (delete, disconnect)
- Loading overlays: During CV extraction and AI analysis (with progress indicators)

### Dark Mode Specifications
- Implement complete dark mode theme with persistent toggle
- Use semantic color approach (not manual color swapping)
- Both modes should maintain identical layout and hierarchy
- Ensure sufficient contrast ratios (WCAG AA compliance minimum)

### Forms & Inputs
- Text inputs: border, rounded corners, focus states
- File upload areas: Drag-and-drop zones with clear upload status
- Validation feedback: Inline error/success messages
- Disabled states: Reduced opacity, no pointer events

## Data Visualization
- Score badges: Large, circular or rectangular with clear 0-100 display
- Progress indicators: For CV processing, analysis completion
- Status tags: Color-coded for CV states (Pending, Analyzed, Error)
- Empty states: Helpful messaging when no CVs or results exist

## Animations
**Minimal & Purposeful**:
- Subtle fade-in for new content loads
- Smooth expand/collapse for CV details
- Loading spinners for async operations
- No decorative animations

## Images
**No hero images needed** - this is a utility application focused on data and functionality. All visual elements should support information display and task completion.

## Accessibility
- Keyboard navigation for all interactive elements
- Focus indicators on all focusable elements
- ARIA labels for icon-only buttons
- Color is not the only indicator of state/status
- Maintain consistent form field implementation across all inputs