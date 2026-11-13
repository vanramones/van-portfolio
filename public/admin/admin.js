const $ = (s) => document.querySelector(s)
const $$ = (s) => [...document.querySelectorAll(s)]

const api = (p, opts) =>
  fetch(p, { headers: { 'Content-Type': 'application/json' }, ...opts })

/* ── local storage helpers ── */
const ls = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
}
let STARS = ls.get('van_stars', {})
let NOTES = ls.get('van_notes', {})
let PREFS = { interval: 30, notify: false, compact: false, ...ls.get('van_prefs', {}) }

/* ── toast ── */
function toast(msg, err) {
  const t = document.createElement('div')
  t.className = 'toast' + (err ? ' err' : '')
  t.textContent = msg
  $('#toasts').appendChild(t)
  setTimeout(() => t.remove(), 3200)
}

/* ── clock ── */
function tick() {
  const el = $('#tb-time')
  if (el) el.textContent = new Date().toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}
tick()
setInterval(tick, 30000)

/* ── auth ── */
async function boot() {
  const r = await fetch('/api/me')
  if (r.ok) showApp()
  else $('#login').classList.remove('hidden')
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  $('#login-err').textContent = ''
  const r = await api('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password: $('#pw').value }),
  })
  if (r.ok) showApp()
  else $('#login-err').textContent = 'Incorrect password. Try again.'
})

$('#logout').addEventListener('click', async () => {
  await api('/api/admin/logout', { method: 'POST' })
  location.reload()
})

function showApp() {
  $('#login').classList.add('hidden')
  $('#shell').classList.remove('hidden')
  load()
  schedule()
}

/* ── state ── */
let ALL = []
let filter = 'all'
let view = 'inbox'
let query = ''
let sort = 'new'
let range = 'all'
const SEL = new Set()
let knownIds = null

/* ── helpers ── */
const fmtDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

const initials = (name) =>
  String(name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

const fileExt = (name) => String(name).split('.').pop().toLowerCase()
const fileIconMap = { pdf: '📄', doc: '📝', docx: '📝', ppt: '📊', pptx: '📊',
                      xls: '📗', xlsx: '📗', txt: '🗒', png: '🖼', jpg: '🖼',
                      jpeg: '🖼', webp: '🖼', fig: '🎨' }
const fileIcon = (name) => fileIconMap[fileExt(name)] || '📎'

const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString()
const download = (name, text, type) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

/* ── navigation ── */
const TITLES = { inbox: 'Message Inbox', starred: 'Starred Messages', analytics: 'Analytics', settings: 'Settings' }

function nav(v) {
  view = v
  $$('[data-nav]').forEach((b) => b.classList.toggle('active', b.dataset.nav === v))
  $('#view-title').textContent = TITLES[v]
  const key = v === 'inbox' || v === 'starred' ? 'inbox' : v
  $$('.view').forEach((el) => el.classList.toggle('on', el.id === 'v-' + key))
  SEL.clear()
  render()
  if (v === 'analytics') renderAnalytics()
}
$$('[data-nav]').forEach((b) => b.addEventListener('click', () => nav(b.dataset.nav)))

$$('.filter-pill').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.filter-pill').forEach((b) => b.classList.remove('on'))
    btn.classList.add('on')
    filter = btn.dataset.filter
    render()
  })
})

$('#q').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); render() })
$('#sort').addEventListener('change', (e) => { sort = e.target.value; render() })
$('#range').addEventListener('change', (e) => { range = e.target.value; render() })
$('#refresh').addEventListener('click', () => load(true))

document.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
    if (e.key === 'Escape') document.activeElement.blur()
    return
  }
  if (e.key === '/') { e.preventDefault(); nav('inbox'); $('#q').focus() }
  if (e.key === 'r') load(true)
})

/* ── load ── */
async function load(manual) {
  if (manual) $('#st-unread').textContent = '…'
  let r
  try { r = await fetch('/api/submissions') } catch { r = { ok: false } }
  if (!r.ok) {
    $('#list').innerHTML = '<div class="empty-state"><div class="empty-icon">⚠</div><h3>Could not load</h3><p>Check your Supabase connection (SUPABASE_URL / SUPABASE_SERVICE_KEY).</p></div>'
    return
  }
  ALL = await r.json()
  notifyNew()
  updateStats()
  render()
  if (view === 'analytics') renderAnalytics()
  if (manual) toast('Refreshed')
}

function notifyNew() {
  const ids = new Set(ALL.map((s) => s.id))
  if (knownIds && PREFS.notify && 'Notification' in window && Notification.permission === 'granted') {
    ALL.filter((s) => !knownIds.has(s.id)).forEach((s) =>
      new Notification(`New message from ${s.name}`, { body: s.subject }))
  }
  if (knownIds) {
    const n = ALL.filter((s) => !knownIds.has(s.id)).length
    if (n) toast(`${n} new message${n > 1 ? 's' : ''}`)
  }
  knownIds = ids
}

function updateStats() {
  const unread = ALL.filter((s) => !s.read).length
  $('#st-unread').textContent = unread
  $('#st-total').textContent = ALL.length
  $('#st-today').textContent = ALL.filter((s) => isToday(s.created_at)).length
  $('#st-files').textContent = ALL.filter((s) => s.files?.length).length

  const badge = $('#sb-unread')
  badge.textContent = unread
  badge.style.display = unread > 0 ? '' : 'none'
  document.title = unread ? `(${unread}) Van.dev · Admin` : 'Van.dev · Admin'
}

/* ── filtering ── */
function visible() {
  let subs = ALL
  if (view === 'starred') subs = subs.filter((s) => STARS[s.id])
  if (filter === 'unread') subs = subs.filter((s) => !s.read)
  if (filter === 'files') subs = subs.filter((s) => s.files?.length)
  if (range !== 'all') {
    const since = Date.now() - Number(range) * 86400000
    subs = subs.filter((s) => new Date(s.created_at).getTime() >= since)
  }
  if (query) {
    subs = subs.filter((s) =>
      [s.name, s.email, s.social, s.subject, s.message, NOTES[s.id]].join(' ').toLowerCase().includes(query))
  }
  subs = [...subs]
  if (sort === 'old') subs.reverse()
  if (sort === 'name') subs.sort((a, b) => String(a.name).localeCompare(String(b.name)))
  return subs
}

const hl = (text) => {
  const t = esc(text)
  if (!query) return t
  const q = esc(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return t.replace(new RegExp(`(${q})`, 'gi'), '<mark style="background:rgba(251,191,36,.35);color:inherit;border-radius:3px">$1</mark>')
}

/* ── render ── */
function render() {
  document.body.classList.toggle('compact', PREFS.compact)
  const list = $('#list')
  const subs = visible()
  updateBulk()

  if (!subs.length) {
    const msg = query ? 'No messages match your search.'
      : view === 'starred' ? 'Star messages to find them here.'
      : filter === 'all' ? 'No messages yet — share your portfolio link!'
      : filter === 'unread' ? 'No unread messages.' : 'No messages with attachments.'
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${view === 'starred' ? '★' : filter === 'files' ? '📎' : '✉'}</div>
        <h3>${filter === 'all' && !query && view === 'inbox' ? 'Inbox is empty' : 'Nothing here'}</h3>
        <p>${msg}</p>
      </div>`
    return
  }

  list.innerHTML = subs.map((s) => {
    const files = s.files?.length ? `
      <div class="msg-files">
        ${s.files.map((f) => {
          const name = f.split('/').pop().replace(/^[^-]+-/, '')
          return `<button type="button" class="file-chip" data-path="${esc(f)}">
            <span class="file-icon">${fileIcon(name)}</span>
            <span title="${esc(f)}">${esc(name)}</span>
          </button>`
        }).join('')}
      </div>` : ''

    const long = (s.message || '').length > (PREFS.compact ? 120 : 240)
    const starred = !!STARS[s.id]
    const note = NOTES[s.id] || ''
    return `
    <article class="msg-card ${s.read ? '' : 'unread'}" data-id="${s.id}">
      <div class="msg-head">
        <input type="checkbox" class="chk sel" ${SEL.has(s.id) ? 'checked' : ''} aria-label="Select" />
        <div class="msg-avatar">${esc(initials(s.name))}</div>
        <div class="msg-meta">
          <div class="msg-name">
            ${!s.read ? '<span class="unread-dot"></span>' : ''}
            ${hl(s.name)}
          </div>
          <div class="msg-email">${hl(s.email)}${s.social ? ` · <span style="color:#a5b4fc">${hl(s.social)}</span>` : ''}</div>
        </div>
        <div class="msg-time">${fmtDate(s.created_at)}</div>
        <button type="button" class="star-btn ${starred ? 'on' : ''}" title="Star">${starred ? '★' : '☆'}</button>
      </div>
      <div class="msg-subject">${hl(s.subject)}</div>
      <div class="msg-body${long ? ' collapsed' : ''}">${hl(s.message)}</div>
      ${long ? '<button class="expand-btn" type="button">Show more ▾</button>' : ''}
      ${files}
      <textarea class="note-box ${note ? 'on' : ''}" placeholder="Private note (saved in this browser)…">${esc(note)}</textarea>
      <div class="msg-actions">
        <a class="act-btn reply" href="mailto:${esc(s.email)}?subject=${encodeURIComponent('Re: ' + s.subject)}">✉ Reply</a>
        <button type="button" class="act-btn copy-btn">⧉ Copy email</button>
        <button type="button" class="act-btn note-btn ${note ? 'on' : ''}">✎ Note</button>
        <button type="button" class="act-btn read-btn">${s.read ? '○ Mark unread' : '✓ Mark read'}</button>
        <button type="button" class="act-btn del">✕ Delete</button>
      </div>
    </article>`
  }).join('')
}

/* ── bulk ── */
function updateBulk() {
  const ids = new Set(ALL.map((s) => s.id))
  ;[...SEL].forEach((id) => { if (!ids.has(id)) SEL.delete(id) })
  $('#bulk').classList.toggle('on', SEL.size > 0)
  $('#bulk-n').textContent = SEL.size
}

$('#select-all').addEventListener('click', () => {
  const subs = visible()
  const all = subs.length && subs.every((s) => SEL.has(s.id))
  subs.forEach((s) => (all ? SEL.delete(s.id) : SEL.add(s.id)))
  render()
})

async function setRead(ids, read) {
  await Promise.all(ids.map((id) => api(`/api/submissions?id=${id}`, {
    method: 'PATCH', body: JSON.stringify({ read }),
  })))
}

$('#mark-all').addEventListener('click', async () => {
  const ids = ALL.filter((s) => !s.read).map((s) => s.id)
  if (!ids.length) return toast('Nothing unread')
  await setRead(ids, true)
  toast(`Marked ${ids.length} as read`)
  load()
})

$('#bulk').addEventListener('click', async (e) => {
  const act = e.target.closest('[data-bulk]')?.dataset.bulk
  if (!act) return
  const ids = [...SEL]
  if (act === 'read' || act === 'unread') {
    await setRead(ids, act === 'read')
    toast(`Marked ${ids.length} ${act}`)
  } else if (act === 'star') {
    ids.forEach((id) => (STARS[id] = true))
    ls.set('van_stars', STARS)
    toast(`Starred ${ids.length}`)
  } else if (act === 'export') {
    exportRows(ALL.filter((s) => SEL.has(s.id)), 'csv')
    return
  } else if (act === 'delete') {
    if (!confirm(`Delete ${ids.length} message(s)? This cannot be undone.`)) return
    await Promise.all(ids.map((id) => api(`/api/submissions?id=${id}`, { method: 'DELETE' })))
    toast(`Deleted ${ids.length}`)
  }
  SEL.clear()
  load()
})

/* ── export ── */
function exportRows(rows, type) {
  if (!rows.length) return toast('Nothing to export', true)
  const stamp = new Date().toISOString().slice(0, 10)
  if (type === 'json') {
    download(`messages-${stamp}.json`, JSON.stringify(rows, null, 2), 'application/json')
  } else {
    const cols = ['id', 'created_at', 'name', 'email', 'social', 'subject', 'message', 'read', 'files']
    const cell = (v) => `"${String(Array.isArray(v) ? v.join('; ') : v ?? '').replace(/"/g, '""')}"`
    const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\r\n')
    download(`messages-${stamp}.csv`, '\ufeff' + csv, 'text/csv')
  }
  toast(`Exported ${rows.length} message(s)`)
}
$('#export-csv').addEventListener('click', () => exportRows(visible(), 'csv'))
$('#export-json').addEventListener('click', () => exportRows(visible(), 'json'))

/* ── card interactions ── */
$('#list').addEventListener('change', (e) => {
  if (!e.target.classList.contains('sel')) return
  const id = Number(e.target.closest('.msg-card').dataset.id)
  e.target.checked ? SEL.add(id) : SEL.delete(id)
  updateBulk()
})

$('#list').addEventListener('input', (e) => {
  if (!e.target.classList.contains('note-box')) return
  const id = e.target.closest('.msg-card').dataset.id
  const v = e.target.value.trim()
  if (v) NOTES[id] = e.target.value; else delete NOTES[id]
  ls.set('van_notes', NOTES)
})

$('#list').addEventListener('click', async (e) => {
  const card = e.target.closest('.msg-card')
  if (!card) return
  const id = Number(card.dataset.id)
  const sub = ALL.find((s) => s.id === id)

  if (e.target.closest('.expand-btn')) {
    const btn = e.target.closest('.expand-btn')
    const collapsed = card.querySelector('.msg-body').classList.toggle('collapsed')
    btn.textContent = collapsed ? 'Show more ▾' : 'Show less ▴'
    if (!collapsed && sub && !sub.read) { sub.read = true; setRead([id], true).then(() => load()) }
    return
  }

  if (e.target.closest('.star-btn')) {
    STARS[id] ? delete STARS[id] : (STARS[id] = true)
    ls.set('van_stars', STARS)
    render()
    return
  }

  if (e.target.closest('.note-btn')) {
    const box = card.querySelector('.note-box')
    box.classList.toggle('on')
    if (box.classList.contains('on')) box.focus()
    return
  }

  if (e.target.closest('.copy-btn')) {
    try { await navigator.clipboard.writeText(sub.email); toast('Email copied') }
    catch { toast('Copy failed', true) }
    return
  }

  if (e.target.closest('.read-btn')) {
    await setRead([id], card.classList.contains('unread'))
    load()
    return
  }

  if (e.target.closest('.del')) {
    if (!confirm('Delete this message? This cannot be undone.')) return
    const r = await api(`/api/submissions?id=${id}`, { method: 'DELETE' })
    if (!r.ok) return toast('Delete failed', true)
    delete STARS[id]; delete NOTES[id]
    ls.set('van_stars', STARS); ls.set('van_notes', NOTES)
    card.style.cssText = 'opacity:0;transform:scale(.97);transition:all .25s'
    toast('Message deleted')
    setTimeout(load, 300)
    return
  }

  if (e.target.closest('.file-chip')) {
    const chip = e.target.closest('.file-chip')
    const orig = chip.innerHTML
    chip.textContent = 'Opening…'
    try {
      const r = await fetch(`/api/files/sign?path=${encodeURIComponent(chip.dataset.path)}`)
      const j = await r.json()
      if (j.url) window.open(j.url, '_blank')
      else toast('Could not open file', true)
    } catch { toast('Could not open file', true) }
    chip.innerHTML = orig
  }
})

/* ── analytics ── */
function renderAnalytics() {
  const days = [...Array(14)].map((_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (13 - i))
    return { d, n: 0 }
  })
  ALL.forEach((s) => {
    const t = new Date(s.created_at); t.setHours(0, 0, 0, 0)
    const hit = days.find((x) => x.d.getTime() === t.getTime())
    if (hit) hit.n++
  })
  const max = Math.max(1, ...days.map((x) => x.n))
  $('#chart').innerHTML = days.map((x) => `
    <div class="bar-col" title="${x.d.toDateString()}: ${x.n}">
      <span class="bar-val">${x.n || ''}</span>
      <div class="bar" style="height:${(x.n / max) * 100}%"></div>
      <span class="bar-lbl">${x.d.getDate()}</span>
    </div>`).join('')

  const by = {}
  ALL.forEach((s) => { const k = (s.email || '').toLowerCase(); (by[k] ||= { name: s.name, n: 0 }).n++ })
  const top = Object.entries(by).sort((a, b) => b[1].n - a[1].n).slice(0, 6)
  $('#top-senders').innerHTML = top.length
    ? top.map(([email, v]) => `<div class="rank"><span class="n">${esc(v.name)} <span class="muted">${esc(email)}</span></span><span class="c">${v.n}</span></div>`).join('')
    : '<p class="muted">No data yet.</p>'

  const last7 = ALL.filter((s) => Date.now() - new Date(s.created_at) < 7 * 86400000).length
  const files = ALL.reduce((a, s) => a + (s.files?.length || 0), 0)
  const rate = ALL.length ? Math.round((ALL.filter((s) => s.read).length / ALL.length) * 100) : 0
  const rows = [
    ['Total messages', ALL.length], ['Last 7 days', last7], ['Read rate', rate + '%'],
    ['Total attachments', files], ['Starred', Object.keys(STARS).length],
    ['Unique senders', Object.keys(by).length],
  ]
  $('#summary').innerHTML = rows.map(([k, v]) => `<div class="rank"><span class="n">${k}</span><span class="c">${v}</span></div>`).join('')
}

/* ── settings ── */
$('#set-interval').value = PREFS.interval
$('#set-notify').checked = PREFS.notify
$('#set-compact').checked = PREFS.compact
const savePrefs = () => ls.set('van_prefs', PREFS)

$('#set-interval').addEventListener('change', (e) => { PREFS.interval = Number(e.target.value); savePrefs(); schedule() })
$('#set-compact').addEventListener('change', (e) => { PREFS.compact = e.target.checked; savePrefs(); render() })
$('#set-notify').addEventListener('change', async (e) => {
  if (e.target.checked) {
    if (!('Notification' in window)) { e.target.checked = false; return toast('Notifications not supported', true) }
    const p = await Notification.requestPermission()
    if (p !== 'granted') { e.target.checked = false; return toast('Permission denied', true) }
  }
  PREFS.notify = e.target.checked
  savePrefs()
})
$('#clear-local').addEventListener('click', () => {
  if (!confirm('Clear all stars and private notes from this browser?')) return
  STARS = {}; NOTES = {}
  ls.set('van_stars', STARS); ls.set('van_notes', NOTES)
  render(); toast('Cleared')
})

let timer
function schedule() {
  clearInterval(timer)
  if (PREFS.interval > 0)
    timer = setInterval(() => { if (!$('#shell').classList.contains('hidden')) load() }, PREFS.interval * 1000)
}

/* ── PWA ── */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' })
}

boot()
