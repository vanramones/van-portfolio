import { SUPABASE_URL, SUPABASE_KEY, BUCKET } from './_auth.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.end()
  if (req.method !== 'POST') return res.status(405).end()

  const chunks = []
  for await (const c of req) chunks.push(c)
  const body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
  const { filename, type } = body
  if (!filename) return res.status(400).json({ error: 'Missing filename' })

  const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`

  try {
    const r = await fetch(
      `${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET}/${path}`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ upsert: false }),
      }
    )
    const j = await r.json()
    if (!r.ok) return res.status(r.status).json({ error: j?.error || 'Sign failed' })
    // j.url is a relative path — prepend base URL to make it absolute
    const signedUrl = `${SUPABASE_URL}/storage/v1${j.url}`
    res.json({ signedUrl, path: j.path || path })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
