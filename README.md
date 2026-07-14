<p align="center">
  <img src="https://raw.githubusercontent.com/asafudurgucu/janus/main/docs/logo.png" alt="Janus" width="320" />
</p>

<h1 align="center">Janus</h1>

<p align="center">
  <b>The open-source command center for your servers.</b><br/>
  One encrypted file. SSH, SFTP, remote desktop, tunnels, live monitoring and databases — all in one place.
</p>

<p align="center">
  <a href="https://github.com/asafudurgucu/janus/releases/latest"><img src="https://img.shields.io/github/v/release/asafudurgucu/janus?style=flat-square&color=6366f1&label=release" alt="release" /></a>
  <a href="https://github.com/asafudurgucu/janus/releases"><img src="https://img.shields.io/github/downloads/asafudurgucu/janus/total?style=flat-square&color=34d399&label=downloads" alt="downloads" /></a>
  <a href="https://github.com/asafudurgucu/janus/stargazers"><img src="https://img.shields.io/github/stars/asafudurgucu/janus?style=flat-square&color=fbbf24" alt="stars" /></a>
  <img src="https://img.shields.io/badge/platform-macOS%20%C2%B7%20Windows%20%C2%B7%20Linux-8b93a1?style=flat-square" alt="platforms" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-fb5d6b?style=flat-square" alt="license" /></a>
</p>

<p align="center">
  <b>English</b> · <a href="README.tr.md">Türkçe</a> &nbsp;|&nbsp;
  <a href="https://asafudurgucu.github.io/janus/">🌐 Website</a> ·
  <a href="https://github.com/asafudurgucu/janus/releases/latest">⬇️ Download</a>
</p>

<br/>

<p align="center">
  <img src="https://raw.githubusercontent.com/asafudurgucu/janus/main/docs/shots/dashboard.png" alt="Janus — Fleet Dashboard" width="900" />
</p>

<p align="center"><i>If Janus is useful to you, please ⭐ <b>star the repo</b> — it genuinely helps it reach more people.</i></p>

---

## What is Janus?

Janus is a professional, cross-platform desktop app that manages **all your servers from one place**.
Like Postman keeps your collections in a single file, Janus keeps every server, key and password in
**one AES-256 encrypted vault** — then goes much further: an integrated terminal, remote desktop,
fleet monitoring, multi-server commands and a built-in database client turn it into a real
**infrastructure command center**.

Think Termius — but open source, single-file, and without the paywall.

## ✨ Features

- **🖥️ SSH terminal** — multiple tabs, **split panes** (up to 4), search, auto-reconnect, jump hosts.
- **🖱️ Remote desktop** — in-app **VNC** over an SSH tunnel, plus one-click **RDP** for Windows servers.
- **🗄️ Database client** — PostgreSQL / MySQL / Redis over SSH tunnels; query editor, results grid, table browser.
- **📊 Fleet dashboard** — live CPU/RAM/disk for every server, **history graphs** and **90% threshold alerts**.
- **📡 Broadcast** — run one command across many servers at once, outputs side by side.
- **🐳 Docker & systemd** — start/stop/restart containers and services, manage processes, tail logs live.
- **📁 SFTP & tunnels** — file transfer, **remote file editing**, path copy + local/remote/dynamic port forwarding.
- **🔑 SSH key manager** — generate keys and install them on a server in one click. Import/export `~/.ssh/config`.
- **🔐 Security first** — single encrypted vault, Touch ID unlock, idle auto-lock. The master password never leaves your device.
- **🎨 Polish** — 9 themes, command palette (⌘K), floating encrypted notes, mini panel mode, desktop notifications, auto-update.

<p align="center">
  <img src="https://raw.githubusercontent.com/asafudurgucu/janus/main/docs/shots/database.png" alt="Janus — Database client" width="860" />
  <br/><br/>
  <img src="https://raw.githubusercontent.com/asafudurgucu/janus/main/docs/shots/terminal.png" alt="Janus — Terminal" width="860" />
</p>

## 🆚 How it compares

| | **Janus** | Termius | PuTTY |
| --- | :---: | :---: | :---: |
| SSH terminal | ✅ | ✅ | ✅ |
| SFTP + remote file editing | ✅ | 💰 | ❌ |
| VNC / RDP remote desktop | ✅ | ❌ | ❌ |
| Fleet dashboard + alerts | ✅ | ❌ | ❌ |
| Multi-server broadcast | ✅ | 💰 | ❌ |
| Database client (PG/MySQL/Redis) | ✅ | ❌ | ❌ |
| Port tunnels | ✅ | ✅ | ✅ |
| Encrypted single-file vault | ✅ | ☁️ cloud | ❌ |
| Price | **Free & open source** | Freemium | Free |

## ⬇️ Download

Grab the latest build for your platform:

| Platform | |
| --- | --- |
| 🍎 **macOS** | [Apple Silicon](https://github.com/asafudurgucu/janus/releases/latest) · [Intel](https://github.com/asafudurgucu/janus/releases/latest) |
| 🪟 **Windows** | [Installer (.exe)](https://github.com/asafudurgucu/janus/releases/latest) |
| 🐧 **Linux** | [AppImage](https://github.com/asafudurgucu/janus/releases/latest) · [.deb](https://github.com/asafudurgucu/janus/releases/latest) |

Or see everything at **[asafudurgucu.github.io/janus](https://asafudurgucu.github.io/janus/)**.

> On first launch you set a **master password** that encrypts your vault. Builds are currently
> unsigned — on macOS *right-click → Open*, on Windows *More info → Run anyway*.

## 🔐 Security

Everything lives in a single **AES-256-GCM** encrypted file, and the master password
**never leaves your device**. The renderer has no Node.js access (`contextIsolation`), and remote
desktop / database connections are tunneled over SSH — no need to expose services to the internet.
See [SECURITY.md](SECURITY.md).

## 🛠️ Development

```bash
npm install
npm run dev     # start with hot reload
npm run build   # production build
```

Built with Electron + React + TypeScript. See [CONTRIBUTING.md](CONTRIBUTING.md).

## ⭐ Support

Janus is free and open source. If it saves you time, **star the repo** and share it — that's the
biggest way to help. Ideas and bug reports are welcome in [issues](https://github.com/asafudurgucu/janus/issues).

---

<p align="center">
  a product of <b>The Asaf Effect</b> · 2026<br/>
  <a href="https://www.linkedin.com/in/asaf-üdürgücü-a55a4a1b8/">LinkedIn</a> ·
  <a href="https://github.com/asafudurgucu/janus">GitHub</a> ·
  <a href="LICENSE">MIT</a>
</p>
