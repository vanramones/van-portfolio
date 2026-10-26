import { ADMIN_PASSWORD, makeToken, setCookie, cors } from '../_auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.end()
  if (req.method !== 'POST') return res.status(405).end()

  let body = req.body
  if (!body) {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
  }

  if (body?.password !== ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Wrong password' })

  setCookie(res, makeToken(), 30 * 24 * 3600)
  res.json({ ok: true })
}
