<p align="center">
  <img src="https://raw.githubusercontent.com/asafudurgucu/janus/main/docs/logo.png" alt="Janus" width="320" />
</p>

<h1 align="center">Janus</h1>

<p align="center">
  <b>Profesyonel SSH &amp; sunucu yöneticisi.</b><br/>
  Şifreli tek dosya, çok protokollü sunucu komuta merkezi.
</p>

<p align="center">
  <a href="https://github.com/asafudurgucu/janus/releases/latest"><img src="https://img.shields.io/github/v/release/asafudurgucu/janus?style=flat-square&color=6366f1&label=s%C3%BCr%C3%BCm" alt="release" /></a>
  <a href="https://github.com/asafudurgucu/janus/releases"><img src="https://img.shields.io/github/downloads/asafudurgucu/janus/total?style=flat-square&color=34d399&label=indirme" alt="downloads" /></a>
  <img src="https://img.shields.io/badge/platform-macOS%20%C2%B7%20Windows%20%C2%B7%20Linux-8b93a1?style=flat-square" alt="platforms" />
  <img src="https://img.shields.io/badge/vault-AES--256--GCM-fb5d6b?style=flat-square" alt="security" />
</p>

<p align="center">
  <a href="README.md">English</a> · <b>Türkçe</b> &nbsp;|&nbsp;
  <a href="https://asafudurgucu.github.io/janus/"><b>🌐 Tanıtım sayfası</b></a> ·
  <a href="https://github.com/asafudurgucu/janus/releases/latest"><b>⬇️ İndir</b></a>
</p>

<br/>

<p align="center">
  <img src="https://raw.githubusercontent.com/asafudurgucu/janus/main/docs/shots/dashboard.png" alt="Janus — Filo Paneli" width="900" />
</p>

---

## Janus nedir?

Janus, sunucularını tek bir yerden yönetmen için tasarlanmış profesyonel bir masaüstü uygulamasıdır.
Postman'in koleksiyonları tek dosyada toplaması gibi, Janus da tüm sunucularını, anahtarlarını ve
bağlantılarını **tek bir şifreli dosyada** toplar — ama bununla kalmaz: entegre terminalden uzak
masaüstüne, filo izlemeden çoklu komuta kadar bir **sunucu komuta merkezi** sunar.

> macOS · Windows · Linux — üçü de tek tıkla indirilebilir.

## ✨ Öne çıkanlar

- **🖥️ Entegre SSH terminal** — çoklu sekme, **bölünmüş panel** (4'e kadar), arama, otomatik yeniden bağlanma, jump host.
- **🖱️ VNC uzak masaüstü** — sunucunun ekranına SSH tüneli üzerinden şifreli bağlan, fare/klavye kontrolü.
- **🪟 RDP (Windows uzak masaüstü)** — sistemin RDP istemcisini tek tıkla sunucuya bağlı açar (Mac/Win/Linux).
- **🗄️ Veritabanı yöneticisi** — PostgreSQL / MySQL / Redis'e SSH tüneli üzerinden bağlan, sorgu çalıştır, tablo gez.
- **📊 Filo paneli** — tüm sunucuların CPU/RAM/disk durumu canlı, **geçmiş grafikleriyle**; %90 eşiği aşılınca uyarı (arka planda izleme dahil).
- **📡 Broadcast** — bir komutu onlarca sunucuda aynı anda çalıştır, çıktıları yan yana gör.
- **🐳 Docker & systemd** — konteyner/servis başlat-durdur-restart, süreç yönetimi, canlı log akışı.
- **📁 SFTP & port tünelleri** — dosya transferi, **uzak dosya düzenleme**, yol kopyalama + local/remote/dynamic forwarding.
- **🔁 `~/.ssh/config` içe/dışa aktar** — mevcut sunucularını tek tıkla getir/gönder.
- **🔔 Masaüstü bildirimleri** — komut bitince / sunucu düşünce haber ver.
- **🔑 SSH anahtar yöneticisi** — uygulama içinde anahtar üret, sunucuya tek tıkla kur.
- **📝 Yüzen not defteri** — şifreler/notlar için proje geneli, sürüklenip boyutlandırılabilen, şifreli kayıtlı pano.
- **🪟 Mini panel modu** — pencereyi küçült, üstte sabitle; web/editör yanına koyabileceğin kompakt terminal.
- **🗂️ Gruplama & etiketleme** — sürükle-bırak ile düzenle, anında ara.
- **🎨 9 tema** (Midnight, Slate, Coffee, Claude, Sand…) · **⌘K komut paleti** · **👆 Touch ID kilidi** · **🔄 otomatik güncelleme**.

<p align="center">
  <img src="https://raw.githubusercontent.com/asafudurgucu/janus/main/docs/shots/terminal.png" alt="Janus — Terminal" width="900" />
</p>

## ⬇️ İndir

En güncel sürümü doğrudan indir:

| Platform | |
| --- | --- |
| 🍎 **macOS** | [Apple Silicon (.dmg)](https://github.com/asafudurgucu/janus/releases/latest) · [Intel (.dmg)](https://github.com/asafudurgucu/janus/releases/latest) |
| 🪟 **Windows** | [Installer (.exe)](https://github.com/asafudurgucu/janus/releases/latest) |
| 🐧 **Linux** | [AppImage](https://github.com/asafudurgucu/janus/releases/latest) · [.deb](https://github.com/asafudurgucu/janus/releases/latest) |

Ya da hepsini tek yerden gör: **[asafudurgucu.github.io/janus](https://asafudurgucu.github.io/janus/)**

> İlk açılışta bir **master parola** belirlersin — tüm vault'unu bu şifreler. Uygulamalar şu an
> imzasız dağıtılmaktadır; ilk açılışta macOS'te *sağ tık → Aç*, Windows'ta *Daha fazla bilgi → Yine de çalıştır*.

## 🔐 Güvenlik

Tüm verilerin tek bir **AES-256-GCM** ile şifreli dosyada saklanır ve master parolan
**cihazından asla çıkmaz**. VNC ve diğer bağlantılar SSH tüneli üzerinden geçer, böylece
servisleri internete açmana gerek kalmaz. İstersen Touch ID ile aç, boşta otomatik kilitle,
vault'unu şifreli tek dosya olarak yedekle/taşı.

## 🔄 Güncellemeler

Janus kendini otomatik günceller — yeni bir sürüm çıktığında uygulama içinde bildirim alırsın.
(macOS'te tam otomatik kurulum için kod imzası gerekir; Windows ve Linux'ta imzasız da çalışır.)

---

<p align="center">
  a product of <b>The Asaf Effect</b> · 2026<br/>
  <a href="https://www.linkedin.com/in/asaf-üdürgücü-a55a4a1b8/">LinkedIn</a> ·
  <a href="https://github.com/asafudurgucu/janus">GitHub</a>
</p>
