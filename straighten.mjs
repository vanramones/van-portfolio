// Straighten a photographed document: detect the 4 paper corners and
// perspective-warp to a flat rectangle.
// Usage: npm i jimp --no-save && node straighten.mjs <input.jpg> <output.jpg>
import { Jimp } from 'jimp'

const [input, output] = process.argv.slice(2)
const src = await Jimp.read(input)
const { width: W, height: H, data } = src.bitmap

const bright = (x, y) => {
  const i = (y * W + x) * 4
  return (data[i] + data[i + 1] + data[i + 2]) / 3 > 115
}

// collect paper-mask pixels with corner scores (sample every 2px)
const pts = []
for (let y = 0; y < H; y += 2)
  for (let x = 0; x < W; x += 2)
    if (bright(x, y)) pts.push({ x, y, sp: x + y, sm: x - y })

const avg = (arr) => ({
  x: arr.reduce((s, p) => s + p.x, 0) / arr.length,
  y: arr.reduce((s, p) => s + p.y, 0) / arr.length,
})
const N = Math.max(50, Math.floor(pts.length * 0.0005))
const bySp = [...pts].sort((a, b) => a.sp - b.sp)
const bySm = [...pts].sort((a, b) => a.sm - b.sm)
const tl = avg(bySp.slice(0, N))            // min x+y
const br = avg(bySp.slice(-N))              // max x+y
const tr = avg(bySm.slice(-N))              // max x-y
const bl = avg(bySm.slice(0, N))            // min x-y

const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const wOut = Math.round((d(tl, tr) + d(bl, br)) / 2)
const hOut = Math.round((d(tl, bl) + d(tr, br)) / 2)

// homography dst->src
const dst = [[0, 0], [wOut, 0], [wOut, hOut], [0, hOut]]
const s = [tl, tr, br, bl]
const A = [], B = []
for (let i = 0; i < 4; i++) {
  const [x, y] = dst[i]
  A.push([x, y, 1, 0, 0, 0, -s[i].x * x, -s[i].x * y]); B.push(s[i].x)
  A.push([0, 0, 0, x, y, 1, -s[i].y * x, -s[i].y * y]); B.push(s[i].y)
}
for (let c = 0; c < 8; c++) { // gaussian elimination
  let p = c
  for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r
  ;[A[c], A[p]] = [A[p], A[c]]; [B[c], B[p]] = [B[p], B[c]]
  for (let r = 0; r < 8; r++) {
    if (r === c) continue
    const f = A[r][c] / A[c][c]
    for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]
    B[r] -= f * B[c]
  }
}
const h = B.map((b, i) => b / A[i][i])

const clamp = (v, m) => (v < 0 ? 0 : v > m ? m : v)
const px = (x, y, c) => data[(clamp(y, H - 1) * W + clamp(x, W - 1)) * 4 + c]

const out = new Jimp({ width: wOut, height: hOut, color: 0xffffffff })
const od = out.bitmap.data
for (let y = 0; y < hOut; y++) {
  for (let x = 0; x < wOut; x++) {
    const den = h[6] * x + h[7] * y + 1
    const sx = (h[0] * x + h[1] * y + h[2]) / den
    const sy = (h[3] * x + h[4] * y + h[5]) / den
    const x0 = Math.floor(sx), y0 = Math.floor(sy)
    const fx = sx - x0, fy = sy - y0
    const o = (y * wOut + x) * 4
    for (let c = 0; c < 3; c++) {
      const top = px(x0, y0, c) * (1 - fx) + px(x0 + 1, y0, c) * fx
      const bot = px(x0, y0 + 1, c) * (1 - fx) + px(x0 + 1, y0 + 1, c) * fx
      od[o + c] = top * (1 - fy) + bot * fy
    }
    od[o + 3] = 255
  }
}

await out.write(output)
console.log(`corners: TL(${tl.x | 0},${tl.y | 0}) TR(${tr.x | 0},${tr.y | 0}) BR(${br.x | 0},${br.y | 0}) BL(${bl.x | 0},${bl.y | 0})`)
console.log(`wrote ${output} ${wOut}x${hOut}`)
