import { isAuthed, sb, SUPABASE_URL, BUCKET, cors } from '../_auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.end()
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorized' })

  const p = String(req.query?.path || new URL(req.url, 'http://x').searchParams.get('path') || '')
  if (!p || p.includes('..') || p.startsWith('/'))
    return res.status(400).json({ error: 'Bad path' })

  try {
    const r = await sb(`/storage/v1/object/sign/${BUCKET}/${p}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresIn: 3600 }),
    })
    const j = await r.json().catch(() => null)
    if (!r.ok || !j?.signedURL) return res.status(502).json({ error: 'Sign failed' })
    res.json({ url: `${SUPABASE_URL}/storage/v1${j.signedURL}` })
  } catch {
    res.status(502).json({ error: 'Supabase unreachable' })
  }
}
