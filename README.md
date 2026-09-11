# Civic Resolution Hub

Build CivicAI, a production-quality frontend MVP for an AI-powered civic issue reporting and resolution platform centered on the core principle: "Not just closed. Actually resolved."

Key pages & features:
1. Landing Page: Hero ("From civic complaints to verified solutions"), interactive workflow step visualization (Report -> AI Analysis -> Priority -> Department -> Resolution -> AI Verification -> Citizen Confirmation), key metric stats, and feature cards.
2. Citizen Dashboard: Personalized greeting, summary cards (My Reports, In Progress, Resolved, Needs Attention), active reports list with status, priority, and progress indicators.
3. Multi-Step Report Issue Flow: Step 1 (Describe & auto-triggers live AI analysis preview with category, severity, safety risk, recommended department), Step 2 (Interactive location & ward picker), Step 3 (Evidence photo upload), Step 4 (AI summary generation & user edits), Step 5 (Review & Submit) with duplicate issue detection alert.
4. Issue Details View: Deep dive with 2-column layout, original citizen photo, interactive issue timeline (Reported -> AI Analyzed -> Assigned -> Work Started -> Resolution Submitted -> AI Verification -> Citizen Confirmation -> Resolved), AI Assessment Card (Priority score out of 100, cluster multiplier, people affected, duration), and Related/Duplicate Reports section (showing distance, cluster similarity, and combined impact).
5. Authority Operations Dashboard: Metrics overview (Open, Critical, In Progress, Awaiting Verification, Overdue), rich filterable Priority Queue table (Issue, Category, Priority, Ward, Age, Duplicate Reports, Assigned Team, Status), quick-action resolution tools.
6. Authority Resolution Submission: After-photo upload, completion notes, transition to "AI Verification" status (not auto-closed).
7. AI Resolution Verification Screen (Core Differentiating Feature): Side-by-side BEFORE vs AFTER photo analysis, automated check criteria (location consistency, issue absence, evidence matching), circular/bar confidence score (e.g. 87% Probably Resolved), and explainable AI reasoning.
8. Citizen Confirmation Loop: Interactive "Yes, it's fixed" (resolves issue with Citizen Confirmed badge) vs "No, reopen issue" (with reason input and status revert).
9. Civic Issue Map: Interactive map with colored priority pins (Critical red, High orange, Medium yellow, Low neutral), cluster markers, filter drawer, and active issue preview panel.
10. Analytics Dashboard: Breakdown charts (Category, Priority, Department, AI Verification Outcomes, Citizen Confirmation Rate), resolution time trends, and key AI insight callout cards.
11. Architecture: Clean React + Vite + TypeScript + Tailwind CSS structure with reusable components (StatusBadge, PriorityBadge, AIInsightCard, IssueTimeline, BeforeAfterComparison), structured types, and an isolated API service layer (`src/services/api.ts`) with rich mock data covering road, sanitation, lighting, water, and drainage domains so the hackathon demo flow works seamlessly end-to-end.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://civicresolve-ai-verified.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8ed2cfe6-ff83-4bd9-a8b7-0ce7b733dc4d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
