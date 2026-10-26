import { cors } from '../_auth.js'

export default function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.end()
  res.setHeader('Set-Cookie', 'van_admin=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure')
  res.json({ ok: true })
}
