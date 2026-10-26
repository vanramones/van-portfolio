import crypto from 'node:crypto'

const COOKIE = 'van_admin'
const TTL_MS = 30 * 24 * 3600 * 1000

export const ADMIN_PASSWORD  = process.env.ADMIN_PASSWORD  || 'changeme'
export const SUPABASE_URL    = process.env.SUPABASE_URL    || ''
export const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_KEY || ''
export const BUCKET          = 'contact-attachments'

const sign = (v) => crypto.createHmac('sha256', ADMIN_PASSWORD).update(v).digest('hex')

export const makeToken = () => {
  const exp = String(Date.now() + TTL_MS)
  return `${exp}.${sign(exp)}`
}

export const validToken = (t) => {
  const [exp, sig] = String(t || '').split('.')
  return !!(exp && sig === sign(exp) && Number(exp) > Date.now())
}

export const getCookie = (req) => {
  const m = (req.headers.cookie || '').match(
    new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`)
  )
  return m ? decodeURIComponent(m[1]) : null
}

export const isAuthed = (req) => validToken(getCookie(req))

export const setCookie = (res, value, maxAge) => {
  const secure = '; Secure'
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${value}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure}`
  )
}

export const sb = (path, opts = {}) =>
  fetch(`${SUPABASE_URL}${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      ...(opts.headers || {}),
    },
  })

export const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}
