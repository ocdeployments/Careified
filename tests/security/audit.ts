import { execSync } from 'child_process'
import fs from 'fs'

const results: string[] = []
const failures: string[] = []

function check(name: string, pass: boolean, detail?: string) {
  const status = pass ? '✅' : '❌'
  const line = `${status} ${name}${detail ? ': ' + detail : ''}`
  results.push(line)
  if (!pass) failures.push(name)
  console.log(line)
}

// 1. No secrets in client-side code
const clientSecrets = execSync(
  'grep -rn "VAPI_API_KEY\\|RESEND_API_KEY\\|OPENROUTER\\|DATABASE_URL" ' +
  'app/ components/ --include="*.tsx" --include="*.ts" ' +
  '| grep -v "process.env\\|node_modules\\|.next\\|//" || true'
).toString().trim()
check('No secrets in client code', clientSecrets === '', clientSecrets)

// 2. No NEXT_PUBLIC_ on sensitive vars
const publicSecrets = execSync(
  'grep -rn "NEXT_PUBLIC_VAPI\\|NEXT_PUBLIC_RESEND\\|NEXT_PUBLIC_DATABASE" ' +
  'app/ .env.local 2>/dev/null || true'
).toString().trim()
check('No sensitive vars as NEXT_PUBLIC_', publicSecrets === '', publicSecrets)

// 3. No dangerouslySetInnerHTML
const dangerous = execSync(
  'grep -rn "dangerouslySetInnerHTML" app/ components/ ' +
  '--include="*.tsx" 2>/dev/null || true'
).toString().trim()
check('No dangerouslySetInnerHTML', dangerous === '', dangerous)

// 4. No template literal SQL
const sqlInjection = execSync(
  'grep -rn "db.query`\\|pool.query`" app/ lib/ ' +
  '--include="*.ts" 2>/dev/null || true'
).toString().trim()
check('No template literal SQL queries', sqlInjection === '', sqlInjection)

// 5. Non-recommender compliance
const badLanguage = execSync(
  'grep -rn "screens candidates\\|delivers interview-ready\\|' +
  'recommends.*caregiver\\|best.*caregiver\\|ideal.*match" ' +
  'app/ components/ --include="*.tsx" 2>/dev/null || true'
).toString().trim()
check('Non-recommender language clean', badLanguage === '', badLanguage)

// 6. npm audit
try {
  execSync('npm audit --audit-level=high 2>&1')
  check('npm audit: no high/critical vulnerabilities', true)
} catch (e) {
  check('npm audit: no high/critical vulnerabilities', false,
    'Run npm audit for details')
}

// 7. Rate limits on sensitive routes
const sensitiveRoutes = [
  'app/api/roster/import/confirm/route.ts',
  'app/api/claim',
  'app/api/airecruit/reference/route.ts',
]
for (const route of sensitiveRoutes) {
  const hasRateLimit = execSync(
    `grep -l "checkRateLimit\\|rateLimit" ${route} 2>/dev/null || true`
  ).toString().trim()
  check(`Rate limit on ${route}`, hasRateLimit !== '')
}

// Report
console.log('\n--- Security Audit Summary ---')
console.log(`Total checks: ${results.length}`)
console.log(`Passed: ${results.length - failures.length}`)
console.log(`Failed: ${failures.length}`)

if (failures.length > 0) {
  console.log('\nFailed checks:')
  failures.forEach(f => console.log(`  ❌ ${f}`))
  process.exit(1)
} else {
  console.log('\n✅ All security checks passed')
}