# Careified Design System — MASTER
Generated: 2026-06-01

## Typography
- Display/Hero: DM Serif Display 400 (headings, gap statement, triage narrative)
- UI text: Plus Jakarta Sans 300/400/500/600/700 (everything else)
- Body line-height: 1.6
- Min font size: 11px

## Color surfaces
- Page background: #0A0F1E
- Card background: #111827
- Card border: 1px solid rgba(255,255,255,0.08)
- Card hover border: rgba(255,255,255,0.15)
- Input background: rgba(255,255,255,0.05)

## Brand colors
- Gold primary: #C9973A
- Gold light: #E8B86D
- Gold gradient: linear-gradient(135deg, #C9973A, #E8B86D)

## Semantic colors
- Green (available/success/covered): #22C55E
- Amber (expiring/review/pending): #F59E0B
- Red (urgent/failed/unmatched): #E24B4A
- Purple (AI/scores/AIRecruit): #818CF8
- Text primary: #F8FAFC
- Text muted: rgba(255,255,255,0.55)
- Text tertiary: rgba(255,255,255,0.3)

## Interactions (mandatory on all UI)
- Hover transition: all 150ms ease
- Clickable elements: cursor-pointer always
- Card hover: border-color rgba(255,255,255,0.15)
- Row hover: background rgba(255,255,255,0.03)
- Button hover: opacity 0.9

## Spacing
- Page padding: 24px desktop / 16px mobile
- Card padding: 20px desktop / 16px mobile
- Card border-radius: 12px
- Section gap: 16px
- Row min-height: 44px (touch target)

## Skeleton loading
Pattern: linear-gradient(90deg, #111827 25%, #1a2332 50%, #111827 75%)
Animation: shimmer 1.5s infinite linear
Required on: all components that fetch data

## Rules
- Inline styles only — no Tailwind classes in production
- No emojis in UI — Lucide icons only
- No green as primary CTA — gold only
- No border-radius on single-sided borders
- All tables/lists must have empty states with copy + gold CTA