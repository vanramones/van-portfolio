import { isAuthed, cors } from './_auth.js'

export default function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.end()
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorized' })
  res.json({ ok: true })
}
