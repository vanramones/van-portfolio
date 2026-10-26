import { isAuthed, sb, cors } from './_auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.end()
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorized' })

  // GET /api/submissions
  if (req.method === 'GET') {
    try {
      const r = await sb('/rest/v1/contact_submissions?select=*&order=created_at.desc&limit=200')
      res.status(r.ok ? 200 : 502).json(await r.json())
    } catch {
      res.status(502).json({ error: 'Supabase unreachable' })
    }
    return
  }

  // PATCH /api/submissions?id=xxx  or  DELETE /api/submissions?id=xxx
  const id = req.query?.id || new URL(req.url, 'http://x').searchParams.get('id')
  if (!id) return res.status(400).json({ error: 'Missing id' })

  if (req.method === 'PATCH') {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
    const r = await sb(`/rest/v1/contact_submissions?id=eq.${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ read: !!body?.read }),
    })
    return res.status(r.ok ? 200 : 502).end()
  }

  if (req.method === 'DELETE') {
    const r = await sb(`/rest/v1/contact_submissions?id=eq.${id}`, { method: 'DELETE' })
    return res.status(r.ok ? 200 : 502).end()
  }

  res.status(405).end()
}
