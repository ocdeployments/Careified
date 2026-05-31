import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || ''

const PLAN_LIMITS: Record<string, number> = {
  starter: 0,
  growth: 30,
  scale: 100,
}

async function sendTelegram(chatId: number, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

async function checkRateLimit(agencyId: string, planTier: string): Promise<boolean> {
  const limit = PLAN_LIMITS[planTier] ?? 0
  if (limit === 0) return false

  const today = new Date().toISOString().split('T')[0]
  const result = await pool.query(
    `INSERT INTO telegram_usage (agency_id, date, count) VALUES ($1::uuid, $2, 1)
     ON CONFLICT (agency_id, date) DO UPDATE SET count = telegram_usage.count + 1
     RETURNING count`,
    [agencyId, today]
  )
  return result.rows[0].count <= limit
}

async function getAgencyByTelegramUserId(telegramUserId: number) {
  const result = await pool.query(
    'SELECT id, name, plan_tier, telegram_user_id FROM agencies WHERE telegram_user_id = $1',
    [telegramUserId]
  )
  return result.rows[0] || null
}

async function handleConnect(chatId: number, code: string): Promise<void> {
  const codeResult = await pool.query(
    `SELECT * FROM telegram_connect_codes WHERE code = $1 AND used_at IS NULL AND expires_at > now()`,
    [code]
  )

  if (codeResult.rows.length === 0) {
    await sendTelegram(chatId, 'Code not found or expired. Generate a new one in Settings → Integrations.')
    return
  }

  const connectCode = codeResult.rows[0]
  const agencyId = connectCode.agency_id

  await pool.query(
    `UPDATE agencies SET telegram_user_id = $1, telegram_connected_at = now() WHERE id = $2`,
    [chatId, agencyId]
  )
  await pool.query(
    `UPDATE telegram_connect_codes SET used_at = now() WHERE code = $1`,
    [code]
  )

  await sendTelegram(chatId, `✅ Connected! Your Careified account is now linked.\n\nTry /morning for your triage briefing or /help for all commands.`)
}

async function handleMorning(agencyId: string, chatId: number): Promise<void> {
  const [unmatched, airecruit, expiringCreds] = await Promise.all([
    pool.query(
      `SELECT client_first_name as client_name, EXTRACT(DAY FROM now()-created_at)::int as days
       FROM client_needs WHERE agency_id = $1::uuid AND matched_caregiver_id IS NULL AND status != 'closed'
       ORDER BY created_at ASC LIMIT 5`,
      [agencyId]
    ),
    pool.query(
      `SELECT c.first_name||' '||c.last_name as name, cr.overall_score, cr.recommendation
       FROM airecruit_call_results cr
       JOIN caregivers c ON c.id=cr.caregiver_id
       WHERE cr.agency_id = $1::uuid AND cr.created_at > now()-interval '24 hours'
       ORDER BY cr.overall_score DESC LIMIT 3`,
      [agencyId]
    ),
    pool.query(
      `SELECT COUNT(*)::int as count FROM caregiver_certifications cc
       JOIN caregivers c ON c.id=cc.caregiver_id
       WHERE c.created_by_agency_id = $1::uuid AND cc.expiry_date BETWEEN now() AND now()+interval '60 days'`,
      [agencyId]
    ),
  ])

  const unmatchedList = unmatched.rows
  const airecruitList = airecruit.rows
  const expiringCount = expiringCreds.rows[0]?.count || 0

  let response = `<b>☀️ Morning Briefing</b>\n\n`

  response += `<b>Unmatched Clients</b>\n`
  if (unmatchedList.length === 0) {
    response += `• No unmatched clients ✅\n`
  } else {
    for (const c of unmatchedList) {
      response += `• ${c.client_name} — ${c.days} days waiting\n`
    }
  }

  response += `\n<b>AIRecruit Overnight</b>\n`
  if (airecruitList.length === 0) {
    response += `• No calls completed overnight\n`
  } else {
    for (const r of airecruitList) {
      response += `• ${r.name} — ${Math.round(r.overall_score)}/100 (${r.recommendation})\n`
    }
  }

  response += `\n<b>Expiring Credentials</b>\n`
  response += `- ${expiringCount} credential(s) expiring in 60 days\n`

  response += `\nView full dashboard: https://careified.com/agency/dashboard`

  await sendTelegram(chatId, response)
}

async function handleUnmatched(agencyId: string, chatId: number): Promise<void> {
  const result = await pool.query(
    `SELECT client_first_name as client_name, EXTRACT(DAY FROM now()-created_at)::int as days
     FROM client_needs WHERE agency_id = $1::uuid AND matched_caregiver_id IS NULL AND status != 'closed'
     ORDER BY created_at ASC LIMIT 10`,
    [agencyId]
  )

  let response = `<b>Unmatched Clients</b>\n`
  if (result.rows.length === 0) {
    response += `No unmatched clients ✅\n`
  } else {
    for (const c of result.rows) {
      response += `• ${c.client_name} — ${c.days} days waiting\n`
    }
  }

  response += `\nView all: https://careified.com/agency/clients?tab=unmatched`

  await sendTelegram(chatId, response)
}

async function handleAirecruit(agencyId: string, chatId: number): Promise<void> {
  const result = await pool.query(
    `SELECT c.first_name||' '||c.last_name as name, cr.overall_score, cr.recommendation, cr.created_at
     FROM airecruit_call_results cr
     JOIN caregivers c ON c.id=cr.caregiver_id
     WHERE cr.agency_id = $1::uuid ORDER BY cr.created_at DESC LIMIT 5`,
    [agencyId]
  )

  let response = `<b>Recent AIRecruit Results</b>\n`
  if (result.rows.length === 0) {
    response += `No AIRecruit results yet.\n`
  } else {
    for (const r of result.rows) {
      response += `• ${r.name} — ${Math.round(r.overall_score)}/100 (${r.recommendation})\n`
    }
  }

  response += `\nView all: https://careified.com/agency/airecruit`

  await sendTelegram(chatId, response)
}

async function handleCreds(agencyId: string, chatId: number): Promise<void> {
  const result = await pool.query(
    `SELECT c.first_name||' '||c.last_name as name, cc.credential_type, cc.expiry_date
     FROM caregiver_credentials cc
     JOIN caregivers c ON c.id=cc.caregiver_id
     JOIN agency_roster ar ON ar.caregiver_id=c.id
     WHERE ar.agency_id = $1::uuid AND cc.expiry_date BETWEEN now() AND now()+interval '60 days'
     ORDER BY cc.expiry_date ASC LIMIT 10`,
    [agencyId]
  )

  let response = `<b>Expiring Credentials (60 days)</b>\n`
  if (result.rows.length === 0) {
    response += `No credentials expiring in the next 60 days ✅\n`
  } else {
    for (const c of result.rows) {
      const expDate = new Date(c.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      response += `• ${c.name} — ${c.credential_type} expires ${expDate}\n`
    }
  }

  response += `\nView roster: https://careified.com/agency/roster?tab=credentials`

  await sendTelegram(chatId, response)
}

async function handleSearch(query: string, chatId: number): Promise<void> {
  await sendTelegram(chatId, `Searching for: ${query}`)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'upstage/ring-2.6-1t:free',
        messages: [
          { role: 'system', content: `You are a search assistant. Convert this natural language query into URL params for /agency/search. Output only a JSON object with these optional keys: language, specialty, availability, city, urgent (true/false), vehicle (true/false). Example: {"language":"French","availability":"overnight","city":"Toronto"}` },
          { role: 'user', content: query },
        ],
        max_tokens: 100,
      }),
    })

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '{}'

    let params
    try {
      params = JSON.parse(content)
    } catch {
      params = {}
    }

    const searchParams = new URLSearchParams()
    if (params.language) searchParams.set('language', params.language)
    if (params.specialty) searchParams.set('specialty', params.specialty)
    if (params.availability) searchParams.set('availability', params.availability)
    if (params.city) searchParams.set('city', params.city)
    if (params.urgent) searchParams.set('urgent', 'true')
    if (params.vehicle) searchParams.set('vehicle', 'true')

    const url = `https://careified.com/agency/search?${searchParams.toString()}`
    await sendTelegram(chatId, `Open in Careified: ${url}`)
  } catch (error) {
    await sendTelegram(chatId, `Search failed. Try: https://careified.com/agency/search`)
  }
}

async function handleHelp(chatId: number): Promise<void> {
  const response = `<b>Careified Bot Commands</b>

/morning — Morning triage briefing
/unmatched — List unmatched clients
/airecruit — Latest AIRecruit results
/creds — Expiring credentials
/search [query] — Search caregivers
/help — This message

Questions? Visit https://careified.com/agency/support`

  await sendTelegram(chatId, response)
}

export async function POST(request: NextRequest) {
  // Security: verify Telegram secret token
  const secretToken = request.headers.get('x-telegram-bot-api-secret-token')
  if (!secretToken || secretToken !== TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: true })
  }

  const update = await request.json()
  const message = update?.message
  if (!message) return NextResponse.json({ ok: true })

  const chatId = message.chat.id
  const text = (message.text || '').trim()
  const telegramUserId = message.from.id

  // Step 1: Look up agency
  const agency = await getAgencyByTelegramUserId(telegramUserId)

  if (!agency) {
    if (text.startsWith('/connect ')) {
      const code = text.split(' ')[1]?.toUpperCase()
      if (!code) {
        await sendTelegram(chatId, 'Please send /connect followed by your 6-character code.')
        return NextResponse.json({ ok: true })
      }
      await handleConnect(chatId, code)
      return NextResponse.json({ ok: true })
    }

    await sendTelegram(chatId, 'To connect your Careified account, send /connect [CODE] — generate your code in Settings → Integrations.')
    return NextResponse.json({ ok: true })
  }

  // Step 2: Rate limiting
  const allowed = await checkRateLimit(agency.id, agency.plan_tier)
  if (!allowed) {
    await sendTelegram(chatId, 'Telegram is available on Growth and Scale plans. Upgrade at https://careified.com/agency/billing')
    return NextResponse.json({ ok: true })
  }

  // Route commands
  const command = text.split(' ')[0]?.toLowerCase()

  switch (command) {
    case '/connect':
      const code = text.split(' ')[1]?.toUpperCase()
      if (!code) {
        await sendTelegram(chatId, 'Please send /connect followed by your 6-character code.')
      } else {
        await handleConnect(chatId, code)
      }
      break
    case '/morning':
      await handleMorning(agency.id, chatId)
      break
    case '/unmatched':
      await handleUnmatched(agency.id, chatId)
      break
    case '/airecruit':
      await handleAirecruit(agency.id, chatId)
      break
    case '/creds':
      await handleCreds(agency.id, chatId)
      break
    case '/search':
      const query = text.replace('/search', '').trim()
      if (!query) {
        await sendTelegram(chatId, 'Usage: /search [criteria]\nExample: /search French-speaking overnight Toronto')
      } else {
        await handleSearch(query, chatId)
      }
      break
    case '/help':
      await handleHelp(chatId)
      break
    default:
      await sendTelegram(chatId, "I didn't understand that. Send /help for available commands.")
  }

  return NextResponse.json({ ok: true })
}