// Renders the SVG product shots to PNG using Electron's Chromium (reliable,
// unlike qlmanage). Run: env -u ELECTRON_RUN_AS_NODE npx electron build/capture-shots.cjs
const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')

app.disableHardwareAcceleration()

const shots = [
  ['dashboard', 1280, 800],
  ['terminal', 1280, 800]
]

app.whenReady().then(async () => {
  // Reuse a single window — creating a second offscreen window fails on macOS.
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    backgroundColor: '#06070a',
    webPreferences: { offscreen: true }
  })
  for (const [name] of shots) {
    await win.loadFile(path.join(__dirname, '..', 'docs', 'shots', `${name}.svg`))
    await new Promise((r) => setTimeout(r, 700))
    const img = await win.webContents.capturePage()
    fs.writeFileSync(path.join(__dirname, '..', 'docs', 'shots', `${name}.png`), img.toPNG())
    console.log(`wrote ${name}.png`)
  }
  win.destroy()
  app.quit()
})
