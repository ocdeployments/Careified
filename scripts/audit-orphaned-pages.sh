#!/bin/bash
# Audit orphaned pages — pages not linked from any navigation
# Usage: bash scripts/audit-orphaned-pages.sh

echo "=== Orphaned Pages Audit ==="
echo ""

# Get all page.tsx files in app/
PAGES=$(find app -name "page.tsx" -type f | sed 's|^app||' | sed 's|/page\.tsx$||')

# Check each page for navigation links
ORPHANED=0
for page in $PAGES; do
  # Skip root page
  if [ -z "$page" ]; then
    continue
  fi

  # Skip API routes
  if echo "$page" | grep -q "^/api"; then
    continue
  fi

  # Skip private dirs (starting with _ or .)
  if echo "$page" | grep -q "^/_"; then
    continue
  fi

  # Full path to check
  full_path="app${page}/page.tsx"

  # Check if this page is linked from any other page
  # Look for Link components or <a href= that reference this path
  if ! grep -rn "href=['\"]${page}" app/ --include="*.tsx" 2>/dev/null | grep -v "page.tsx" | grep -q .; then
    # Also check for pattern without leading slash variations
    page_slug=$(echo "$page" | sed 's|^/||')
    if ! grep -rn "href=['\"]/${page_slug}" app/ --include="*.tsx" 2>/dev/null | grep -v "page.tsx" | grep -q .; then
      echo "ORPHANED: $page"
      ORPHANED=$((ORPHANED + 1))
    fi
  fi
done

echo ""
if [ $ORPHANED -eq 0 ]; then
  echo "✓ No orphaned pages found"
else
  echo "Found $ORPHANED orphaned page(s)"
fi