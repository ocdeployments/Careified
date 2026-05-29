#!/bin/bash
# Careified QA Snapshot — run before any feature sprint
# Usage: bash scripts/qa-snapshot.sh

DATE=$(date +%Y-%m-%d)
REPORT="scripts/qa-report-$DATE.md"

echo "# QA Snapshot — $DATE" > $REPORT
echo "" >> $REPORT

echo "## TypeScript" >> $REPORT
npx tsc --noEmit 2>&1 | tail -5 >> $REPORT
echo "" >> $REPORT

echo "## Build" >> $REPORT
npm run build 2>&1 | tail -5 >> $REPORT
echo "" >> $REPORT

echo "## Playwright Results" >> $REPORT
npx playwright test tests/e2e/agency-pages.spec.ts tests/e2e/api-smoke.spec.ts --reporter=list 2>&1 >> $REPORT
echo "" >> $REPORT

echo "## Light Theme Audit" >> $REPORT
grep -rn "background: 'white'\|background: '#fff'\|background: '#F7F4F0'\|background: '#F8F9FC'\|bg-white" app/agency/ --include="*.tsx" -l >> $REPORT 2>&1
echo "" >> $REPORT

echo "## Console.log Audit" >> $REPORT
grep -rn "console.log" app/ --include="*.tsx" --include="*.ts" -l >> $REPORT 2>&1

echo "Report written to $REPORT"
cat $REPORT
