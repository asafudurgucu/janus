// Crops logo.png down to just the white "Janus" wordmark (excludes the red
// subtitle and surrounding black), making the background transparent. Output
// is a wide, crisp wordmark for use in the title bar.
const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const src = path.join(__dirname, 'logo.png')
const out = path.join(__dirname, '..', 'src', 'renderer', 'src', 'assets', 'logo-mark.png')

const png = PNG.sync.read(fs.readFileSync(src))
const { width, height, data } = png

// Find bounding box of "white" pixels (the wordmark). Red subtitle has low G/B
// so it's naturally excluded.
let minX = width, minY = height, maxX = 0, maxY = 0
const isWhite = (r, g, b) => r > 180 && g > 180 && b > 180
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4
    if (isWhite(data[i], data[i + 1], data[i + 2])) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
}

const pad = 24
minX = Math.max(0, minX - pad)
minY = Math.max(0, minY - pad)
maxX = Math.min(width - 1, maxX + pad)
maxY = Math.min(height - 1, maxY + pad)
const w = maxX - minX + 1
const h = maxY - minY + 1

const cropped = new PNG({ width: w, height: h })
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const si = ((y + minY) * width + (x + minX)) * 4
    const di = (y * w + x) * 4
    const r = data[si], g = data[si + 1], b = data[si + 2]
    cropped.data[di] = r
    cropped.data[di + 1] = g
    cropped.data[di + 2] = b
    // Alpha from luminance so black background becomes transparent, leaving
    // crisp white glyphs that work on any background.
    cropped.data[di + 3] = Math.max(r, g, b)
  }
}

fs.writeFileSync(out, PNG.sync.write(cropped))
console.log(`wordmark: ${w}x${h} (kaynak bbox x[${minX}-${maxX}] y[${minY}-${maxY}]) -> ${out}`)
