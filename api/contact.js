import { SUPABASE_URL, SUPABASE_KEY } from './_auth.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.end()
  if (req.method !== 'POST') return res.status(405).end()

  const chunks = []
  for await (const c of req) chunks.push(c)
  const body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
  const { name, email, social = '', subject, message, files = [] } = body

  if (!name || !email || !subject || !message)
    return res.status(400).json({ error: 'All fields are required.' })

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  }
  const insert = async (payload) =>
    fetch(`${SUPABASE_URL}/rest/v1/contact_submissions`, {
      method: 'POST', headers, body: JSON.stringify(payload),
    })

  try {
    let r = await insert({ name, email, social, subject, message, files })
    // If social column doesn't exist yet, retry without it
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      if (err.code === 'PGRST204' && err.message?.includes('social')) {
        r = await insert({ name, email, subject, message, files })
      }
      if (!r.ok) {
        const err2 = await r.json().catch(() => ({}))
        return res.status(r.status).json({ error: err2.message || 'Database error' })
      }
    }
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
