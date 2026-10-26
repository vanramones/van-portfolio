const $ = (s) => document.querySelector(s)
const $$ = (s) => [...document.querySelectorAll(s)]

const api = (p, opts) =>
  fetch(p, { headers: { 'Content-Type': 'application/json' }, ...opts })

/* ── clock ── */
function tick() {
  const t = new Date()
  const s = t.toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
  const el = $('#tb-time')
  if (el) el.textContent = s
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
  if (r.ok) { showApp() }
  else { $('#login-err').textContent = 'Incorrect password. Try again.' }
})

$('#logout').addEventListener('click', async () => {
  await api('/api/admin/logout', { method: 'POST' })
  location.reload()
})

function showApp() {
  $('#login').classList.add('hidden')
  $('#shell').classList.remove('hidden')
  load()
}

/* ── data & filter ── */
let ALL = []
let filter = 'all'

$$('.filter-pill').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.filter-pill').forEach((b) => b.classList.remove('on'))
    btn.classList.add('on')
    filter = btn.dataset.filter
    render()
  })
})

$('#refresh').addEventListener('click', load)

/* ── helpers ── */
const fmtDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })

const esc = (s) =>
  String(s || '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

const initials = (name) =>
  String(name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

const fileExt = (name) => String(name).split('.').pop().toLowerCase()
const fileIconMap = { pdf: '📄', doc: '📝', docx: '📝', ppt: '📊', pptx: '📊',
                      xls: '📗', xlsx: '📗', txt: '🗒', png: '🖼', jpg: '🖼',
                      jpeg: '🖼', webp: '🖼', fig: '🎨' }
const fileIcon = (name) => fileIconMap[fileExt(name)] || '📎'

/* ── load ── */
async function load() {
  $('#st-unread').textContent = '…'
  const r = await fetch('/api/submissions')
  if (!r.ok) {
    $('#list').innerHTML = '<div class="empty-state"><div class="empty-icon">⚠</div><h3>Could not load</h3><p>Check your Supabase connection.</p></div>'
    return
  }
  ALL = await r.json()
  updateStats()
  render()
}

function updateStats() {
  const unread = ALL.filter((s) => !s.read).length
  const today  = ALL.filter((s) => {
    const d = new Date(s.created_at)
    const n = new Date()
    return d.getFullYear()===n.getFullYear() && d.getMonth()===n.getMonth() && d.getDate()===n.getDate()
  }).length
  const withFiles = ALL.filter((s) => s.files?.length).length

  $('#st-unread').textContent = unread
  $('#st-total').textContent  = ALL.length
  $('#st-today').textContent  = today
  $('#st-files').textContent  = withFiles

  const badge = $('#sb-unread')
  if (unread > 0) { badge.textContent = unread; badge.style.display = '' }
  else badge.style.display = 'none'
}

/* ── render ── */
function render() {
  const list = $('#list')
  let subs = ALL
  if (filter === 'unread') subs = ALL.filter((s) => !s.read)
  if (filter === 'files')  subs = ALL.filter((s) => s.files?.length)

  if (!subs.length) {
    const msg = filter === 'all'
      ? 'No messages yet — share your portfolio link!'
      : filter === 'unread' ? 'No unread messages.' : 'No messages with attachments.'
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${filter === 'files' ? '📎' : '✉'}</div>
        <h3>${filter === 'all' ? 'Inbox is empty' : 'Nothing here'}</h3>
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

    const long = (s.message || '').length > 240
    return `
    <article class="msg-card ${s.read ? '' : 'unread'}" data-id="${s.id}" data-read="${s.read}">
      <div class="msg-head">
        <div class="msg-avatar">${esc(initials(s.name))}</div>
        <div class="msg-meta">
          <div class="msg-name">
            ${!s.read ? '<span class="unread-dot"></span>' : ''}
            ${esc(s.name)}
          </div>
          <div class="msg-email">${esc(s.email)}${s.social ? ` · <span style="color:#a5b4fc">${esc(s.social)}</span>` : ''}</div>
        </div>
        <div class="msg-time">${fmtDate(s.created_at)}</div>
      </div>
      <div class="msg-subject">${esc(s.subject)}</div>
      <div class="msg-body${long ? ' collapsed' : ''}">${esc(s.message)}</div>
      ${long ? `<button class="expand-btn" data-expand="${s.id}">Show more ▾</button>` : ''}
      ${files}
      <div class="msg-actions">
        <a class="act-btn reply" href="mailto:${esc(s.email)}?subject=Re: ${esc(s.subject)}">✉ Reply</a>
        <button type="button" class="act-btn read-btn">${s.read ? '○ Mark unread' : '✓ Mark read'}</button>
        <button type="button" class="act-btn del">✕ Delete</button>
      </div>
    </article>`
  }).join('')
}

/* ── interactions ── */
$('#list').addEventListener('click', async (e) => {
  const card = e.target.closest('.msg-card')

  /* expand/collapse */
  if (e.target.closest('.expand-btn')) {
    const btn  = e.target.closest('.expand-btn')
    const body = card.querySelector('.msg-body')
    const collapsed = body.classList.toggle('collapsed')
    btn.textContent = collapsed ? 'Show more ▾' : 'Show less ▴'
    return
  }

  /* mark read/unread */
  if (e.target.closest('.read-btn')) {
    const isUnread = card.classList.contains('unread')
    await api(`/api/submissions?id=${card.dataset.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: isUnread }),
    })
    load()
    return
  }

  /* delete */
  if (e.target.closest('.del')) {
    if (!confirm('Delete this message? This cannot be undone.')) return
    await api(`/api/submissions?id=${card.dataset.id}`, { method: 'DELETE' })
    card.style.opacity = '0'
    card.style.transform = 'scale(.97)'
    card.style.transition = 'all .25s'
    setTimeout(() => load(), 300)
    return
  }

  /* file open */
  if (e.target.closest('.file-chip')) {
    const chip = e.target.closest('.file-chip')
    const orig = chip.innerHTML
    chip.textContent = 'Opening…'
    const r = await fetch(`/api/files/sign?path=${encodeURIComponent(chip.dataset.path)}`)
    const j = await r.json()
    if (j.url) window.open(j.url, '_blank')
    else { chip.innerHTML = orig; alert('Could not open file.') }
  }
})

/* ── PWA ── */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' })
}

/* ── init ── */
boot()
setInterval(() => {
  if (!$('#shell').classList.contains('hidden')) load()
}, 30000)
