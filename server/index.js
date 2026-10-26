import express from 'express'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = process.env.PORT || 3001
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme'
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || ''
const BUCKET = 'contact-attachments'
const COOKIE = 'van_admin'
const TTL_MS = 30 * 24 * 3600 * 1000

const sign = (v) => crypto.createHmac('sha256', ADMIN_PASSWORD).update(v).digest('hex')
const makeToken = () => {
  const exp = String(Date.now() + TTL_MS)
  return `${exp}.${sign(exp)}`
}
const validToken = (t) => {
  const [exp, sig] = String(t).split('.')
  return exp && sig === sign(exp) && Number(exp) > Date.now()
}
const authed = (req) => {
  const m = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))
  return !!m && validToken(decodeURIComponent(m[1]))
}
const auth = (req, res, next) => (authed(req) ? next() : res.status(401).json({ error: 'unauthorized' }))

const sb = (p, opts = {}) =>
  fetch(`${SUPABASE_URL}${p}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      ...(opts.headers || {}),
    },
  })

const app = express()
app.use(express.json({ limit: '1mb' }))

app.post('/api/admin/login', (req, res) => {
  if (req.body?.password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Wrong password' })
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${COOKIE}=${makeToken()}; HttpOnly; Path=/; Max-Age=${TTL_MS / 1000}; SameSite=Strict${secure}`)
  res.json({ ok: true })
})

app.post('/api/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; Max-Age=0`)
  res.json({ ok: true })
})

app.get('/api/me', auth, (req, res) => res.json({ ok: true }))

app.get('/api/submissions', auth, async (req, res) => {
  try {
    const r = await sb('/rest/v1/contact_submissions?select=*&order=created_at.desc&limit=200')
    res.status(r.ok ? 200 : 502).json(await r.json())
  } catch {
    res.status(502).json({ error: 'Supabase unreachable' })
  }
})

app.patch('/api/submissions/:id', auth, async (req, res) => {
  const r = await sb(`/rest/v1/contact_submissions?id=eq.${req.params.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ read: !!req.body?.read }),
  })
  res.status(r.ok ? 200 : 502).end()
})

app.delete('/api/submissions/:id', auth, async (req, res) => {
  const r = await sb(`/rest/v1/contact_submissions?id=eq.${req.params.id}`, { method: 'DELETE' })
  res.status(r.ok ? 200 : 502).end()
})

app.get('/api/files/sign', auth, async (req, res) => {
  const p = String(req.query.path || '')
  if (!p || p.includes('..') || p.startsWith('/')) return res.status(400).json({ error: 'Bad path' })
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
})

app.get('/', (req, res) => res.redirect('/admin'))
app.use('/admin', express.static(path.join(__dirname, '../public/admin')))

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Admin panel: http://localhost:${PORT}/admin`)
    if (ADMIN_PASSWORD === 'changeme') console.log('WARNING: set ADMIN_PASSWORD in server/.env')
    if (!SUPABASE_URL || !SUPABASE_KEY) console.log('WARNING: Supabase keys missing in server/.env')
  })
}

export default app
