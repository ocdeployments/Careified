# ARCHITECTURE.md — Careified Technical Architecture
# Platform architecture, stack details, and infrastructure
# Last updated: May 9 2026

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│                   Next.js 16 App Router                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌─────────┐       ┌─────────┐       ┌──────────┐
   │ Clerk   │       │ Vapi    │       │OpenRouter│
   │ Auth   │       │ Outbound│       │ Scoring  │
   └─────────┘       │   AI    │       └──────────┘
                    └─────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                    ┌─────────────┐
                    │  Render     │
                    │ PostgreSQL  │
                    └─────────────┘
```

### Technology Stack
| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js App Router | 16.2.3 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS | v4 |
| Auth | Clerk | v7 (@clerk/nextjs ^7.0.12) |
| ORM | Prisma | 7 |
| DB Driver | pg (raw Pool) | ^8.20 |
| Database | Render PostgreSQL | — |
| Hosting | Vercel | — |
| Voice AI | Vapi | — |
| Scoring | OpenRouter (minimax/m2.5) | — |
| Icons | lucide-react | latest |
| Animation | Framer Motion | — |

---

## 2. TWO-DEPLOYMENT ARCHITECTURE

### Overview
- **careified.ca** — Canadian deployment (primary)
- **careified.com** — US deployment (future expansion)
- **Same codebase** — Single repo, locale-scoped data

### Implementation
```
┌─────────────────────────────────────────────────────┐
│                   SINGLE CODEBASE                   │
│                 (ocdeployments/Careified)          │
└──────────────────────────┬──────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
    ┌──────────────┐                ┌──────────────┐
    │  Vercel CA   │                │  Vercel US   │
    │careified.ca  │                │careified.com │
    └──────────────┘                └──────────────┘
```

### Deployment Rules
- Both deploy from same `main` branch
- Locale determined by `VERCEL_URL` or `NEXT_PUBLIC_LOCALE`
- CA is default, US is opt-in
- No cross-deployment data access

---

## 3. DATA SCOPING RULES

### Locale Column
Every record includes `locale` field:
- `'en-CA'` — Canadian data
- `'en-US'` — US data

### Scoping Queries
```sql
-- CA agency sees only CA caregivers
SELECT * FROM caregivers WHERE locale = 'en-CA';

-- US agency sees only US caregivers  
SELECT * FROM caregivers WHERE locale = 'en-US';
```

### Never Cross
- CA agency NEVER sees US caregiver data
- US agency NEVER sees CA caregiver data
- Admin sees ALL with explicit permission
- Search/filter always scoped by user's locale

### Locale Migration Plan
Before adding the `locale` column to existing tables:

1. **Pre-migration:** Full DB backup
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Default backfill:** All existing caregivers and agencies backfilled to `'en-CA'`
   - Canada is the primary launch market
   - Migration must be idempotent (can re-run safely)

3. **Column definition:** `locale` is NOT NULL with default `'en-CA'`

4. **Post-migration verification:**
   ```sql
   -- Count rows by locale
   SELECT locale, COUNT(*) FROM caregivers GROUP BY locale;
   SELECT locale, COUNT(*) FROM agencies GROUP BY locale;
   -- Flag any nulls
   SELECT COUNT(*) FROM caregivers WHERE locale IS NULL;
   ```

5. **US data handling:** Any agency or caregiver claiming to be US must be
   manually flipped to `'en-US'` by admin via /admin panel until US
   deployment is live.

6. **Post-migration DB check:** Re-run session start checklist counts —
   caregiver and agency counts must match pre-migration totals.

---

## 4. BRANCH STRATEGY

### Branch Structure
```
main     — production only. NEVER commit here directly.
develop  — all builds happen here. Your working branch.
feature/xxx — one branch per large feature.
hotfix/xxx   — emergency production fixes only.
```

### Workflow
```bash
# Always start here
git checkout develop
git pull origin develop

# Build and commit
git add .
git commit -m "feat: what you built"
git push origin develop

# When ready for production
git checkout main
git merge develop
git push origin main
```

### Rules
- **NEVER** push directly to main
- **NEVER** commit to main
- Only human operator merges develop → main manually
- Vercel auto-deploys on push to main

---

## 5. AI ARCHITECTURE

### Vapi (Voice AI)
Vapi config: see AI_PLAYBOOK.md
| Model | openai/gpt-4o |

### OpenRouter (Scoring)
| Component | Value |
|-----------|-------|
| Model | minimax/minimax-m2.5 |
| Endpoint | https://openrouter.ai/api/v1/chat/completions |
| Purpose | Transcript scoring, recommendation generation |

### Scoring Output
```typescript
interface ScoreResult {
  overallScore: number;      // 0-100
  recommendation: 'advance' | 'review' | 'pass';
  summary: string;
  questionScores: { question: string; score: number }[];
  flags: string[];
  confidence: number;
}
```

### WhatsApp Layer (Phase 3)
- WhatsApp Business API via Vapi integration
- Natural language queries
- Shift updates, matching, reminders

### Telegram Layer (Future)
- Alternative channel for international users

---

## 6. DATABASE SCHEMA OVERVIEW

### Key Tables
| Table | Columns | Purpose |
|-------|---------|---------|
| users | id, clerk_id, role, locale | Clerk-synced user records |
| agencies | id, name, status, modules, locale | Agency accounts |
| caregivers | id, user_id, aggregate_score, specializations, locale | Caregiver profiles |
| caregiver_certifications | id, caregiver_id, type, name, expiry_date | Credential records |
| caregiver_references | id, caregiver_id, name, phone, verified | Reference records |
| caregiver_communication_consents | id, caregiver_id, recruit_calls, reference_calls... | 6 consent types |
| client_needs | id, agency_id, requirements_json | Demo client profiles |
| agency_shortlist | id, agency_id, caregiver_id, created_at | Agency saved caregivers |
| agency_saved_searches | id, agency_id, name, filters_json, result_count | Saved filter combos |
| reference_verification_requests | id, reference_id, token, status | Pending reference invites |
| qa_reports | id, created_at, issues_json | QA audit reports |
| qa_issues | id, report_id, description, status | Individual QA issues |
| match_scores | id, agency_id, caregiver_id, score, created_at | Cached match results |

### Naming Rules
- **Prisma model fields:** camelCase
- **Database tables/columns:** snake_case
- **Joins:** Use `caregiver_id` (not "caregiverId")

### Column Aliases
- `aggregate_score` = trust score
- `specializations` = specialties
- `photo_url` = photo

---

## 7. AUTH ARCHITECTURE

### Clerk Integration
```
Clerk (Auth Provider)
     │
     ├── caregiver role → /profile/build/*
     ├── agency role    → /agency/*
     └── admin role    → /admin/*
```

### Roles
| Role | Redirect | Access |
|------|----------|--------|
| caregiver | /profile/build | Own profile only |
| agency | /agency/dashboard | Agency tools + search |
| admin | /admin | All agencies + users |

### Middleware
- Uses Clerk auth with public routes whitelist
- pg Pool NEVER in middleware.ts (Edge Runtime incompatible)

---

## 8. API ROUTE PATTERNS

### Standard Pattern
```typescript
// /api/example/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // 1. Auth check
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Role check (if needed)
  if (sessionClaims?.role !== 'agency') {
    return NextResponse.json({ error: 'Agency only' }, { status: 403 });
  }

  try {
    // 3. Parse & validate
    const body = await req.json();
    
    // 4. Process
    const result = await processSomething(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Rate Limiting
- Applied at Vercel (no custom rate limiting yet)
- AIRecruit: compliance-gated (TCPA/CRTC hours)

### Error Handling
- Always return JSON `{ error: string }`
- Use appropriate HTTP status codes (401, 403, 404, 500)

---

## 9. FILE STRUCTURE OVERVIEW

```
/Users/owner/careified/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (sign-in, sign-up)
│   ├── (public)/         # Public pages (landing, for-agencies)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   ├── agency/            # Agency dashboard pages
│   ├── profile/           # Caregiver profile builder
│   ├── admin/             # Admin pages
│   └── demo/              # Demo environment
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── agency/           # Agency-specific components
│   ├── profile/          # Profile builder components
│   └── demo/             # Demo components
├── lib/                   # Utilities and hooks
│   ├── context/           # React contexts
│   ├── hooks/            # Custom hooks
│   ├── airecruit/        # AIRecruit integrations
│   └── db.ts             # Database connection
├── prisma/               # Prisma schema
├── public/               # Static assets
├── tests/                # Test files
│   └── e2e/              # Playwright E2E tests
└── scripts/              # Utility scripts
```

---

## 10. THIRD-PARTY DEPENDENCIES

| Package | Version | Purpose |
|---------|---------|---------|
| @clerk/nextjs | ^7.0.12 | Authentication |
| @prisma/client | ^7.0.0 | ORM |
| prisma | ^7.0.0 | DB migrations |
| pg | ^8.20 | PostgreSQL driver |
| next | 16.2.3 | Framework |
| react | 19.2.4 | UI library |
| lucide-react | latest | Icons |
| framer-motion | latest | Animations |
| leaflet | ^1.9.4 | Maps |
| react-leaflet | ^4.2.1 | React map bindings |

### AI Dependencies
| Package | Purpose |
|---------|---------|
| @anthropic-ai/sdk | Claude API (if used) |
| openai | OpenAI SDK (Vapi uses internally) |

---

## LAYER OVERVIEW (Business Logic)

```
┌─────────────────────────────────────────────────────┐
│                  LAYER 4: COMMUNITY                 │
│          Network effects & social layer            │
├─────────────────────────────────────────────────────┤
│                 LAYER 3: INTELLIGENCE               │
│              AI-powered automation                  │
├─────────────────────────────────────────────────────┤
│                 LAYER 2: OPERATIONS                  │
│            Daily workflow & tools                  │
├─────────────────────────────────────────────────────┤
│                LAYER 1: REPUTATION                   │
│           Trust infrastructure (BASE)              │
└─────────────────────────────────────────────────────┘
```

### L1 — Reputation
- Verified profiles, credentials, references, trust score, badges

### L2 — Operations
- Agency Roster, QuickFill, scheduling, family portal, client matching

### L3 — Intelligence
- AIRecruit, WhatsApp assistant, retention AI, reference calls, smart matching

### L4 — Community
- Follow, connect, feed, rank, badges, referrals

---

## BUILD ORDER

```
Phase 1 (Launch): Layer 1 + 3 (partial)
  - Verified profiles
  - AIRecruit screening
  
Phase 2 (Growth): Layer 2
  - Agency Roster
  - QuickFill
  - Family portal
  
Phase 3 (Scale): Layer 3 (full) + Layer 4 (partial)
  - WhatsApp assistant
  - Retention AI
  - Community features
```

---

## DEPENDENCIES

| Layer | Depends on |
|-------|------------|
| L1 (Reputation) | Nothing — base layer |
| L2 (Operations) | L1 — needs verified caregivers |
| L3 (Intelligence) | L1 + L2 — needs data + workflow |
| L4 (Community) | L1 + L2 + L3 — needs scale |

---

## KEY DECISIONS

1. **Never launch Layer 2 without Layer 1** — Unverified caregivers = no trust = no payment
2. **Layer 3 enables Layer 2 scale** — QuickFill without AI is just a form
3. **Layer 4 requires critical mass** — Don't build community before 1000+ caregivers

---

Last updated: May 9 2026
