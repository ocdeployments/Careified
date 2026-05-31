#!/bin/bash
# Audit broken links — check for dead internal links
# Usage: bash scripts/audit-broken-links.sh

echo "=== Broken Links Audit ==="
echo ""

# Collect all internal hrefs from the app
# Look for patterns like href="/agency/..." or href="/profile/..."

# Get all unique hrefs
HREFS=$(grep -roh "href=['\"][^'\"]*['\"]" app/ --include="*.tsx" 2>/dev/null | \
  sed "s/href=//g" | sed "s/'//g" | sed 's/"//g' | \
  grep '^/' | sort -u)

BROKEN=0

# Check each internal href to see if the route exists
for href in $HREFS; do
  # Skip external links and anchors
  if echo "$href" | grep -q "^http"; then
    continue
  fi
  if echo "$href" | grep -q "^#"; then
    continue
  fi

  # Get the route path (remove query params)
  route=$(echo "$href" | cut -d'?' -f1)

  # Convert route to file path
  # /agency/dashboard -> app/agency/dashboard/page.tsx
  # /profile/[id] -> app/profile/[id]/page.tsx

  # Handle dynamic routes [id] etc
  file_path="app${route}"

  # Check if it's a file or directory with page.tsx
  if [ ! -e "${file_path}/page.tsx" ] && [ ! -e "${file_path}.tsx" ] && [ ! -e "${file_path}.ts" ]; then
    # Also check for route.ts / route.tsx
    if [ ! -e "${file_path}/route.ts" ] && [ ! -e "${file_path}/route.tsx" ]; then
      # Skip API routes (they don't have page.tsx)
      if ! echo "$route" | grep -q "^/api"; then
        echo "BROKEN: $href (no page.tsx found)"
        BROKEN=$((BROKEN + 1))
      fi
    fi
  fi
done

echo ""
if [ $BROKEN -eq 0 ]; then
  echo "✓ No broken links found"
else
  echo "Found $BROKEN broken link(s)"
fi