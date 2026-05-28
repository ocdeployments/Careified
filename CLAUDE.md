# CLAUDE.md - Project Rules and Conventions

## Development Rules

### Shared Components and Layout Changes
Before any commit that touches shared components or layout, agent must audit all consuming files and report findings before writing code.

This includes but is not limited to:
- `components/nav/AgencySidebar.tsx`
- `components/shells/AgencyShell.tsx`
- `app/agency/AgencyLayoutClient.tsx`
- Any layout.tsx files in the agency routes

When modifying these files:
1. Identify all pages/components that import or use the shared component
2. Report what files consume it and how they would be affected
3. Get approval before proceeding with changes
4. Ensure all consuming files are updated as needed

### Database
- Never call `pool.end()` in API routes - the pool must stay open for Vercel serverless
- Always cast text parameters to UUID when comparing to UUID columns: `$1::uuid`

### API Error Handling
- Audit log writes should silently swallow errors with `console.warn`
- Always wrap external API calls in try/catch