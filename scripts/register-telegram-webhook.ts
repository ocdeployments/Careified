// Add TELEGRAM_WEBHOOK_SECRET=careified-webhook-secret to Vercel env vars dashboard

const token = process.env.TELEGRAM_BOT_TOKEN
const secret = process.env.TELEGRAM_WEBHOOK_SECRET || 'careified-webhook-secret'
const url = `https://careified.com/api/telegram/webhook`

async function register() {
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is required')
    process.exit(1)
  }

  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        secret_token: secret,
        allowed_updates: ['message'],
        drop_pending_updates: true
      })
    }
  )
  const data = await res.json()
  console.log('Webhook registration result:', JSON.stringify(data, null, 2))
}

register().catch(console.error)