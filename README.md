# Janus 🚪

**Profesyonel SSH & sunucu yönetim uygulaması** — Termius mantığında ama tüm verilerin tek bir şifreli dosyada (Postman koleksiyonu gibi). Masaüstü uygulaması (Electron + React + TypeScript).

## ✨ Özellikler

- 🔐 **Master parola ile şifreli tek dosya** — tüm sunucular, gruplar, tag'ler, snippet'ler ve tüneller AES-256-GCM ile şifrelenir. Parola cihazından asla çıkmaz.
- 🖥️ **Entegre SSH terminal** — xterm.js tabanlı, çoklu sekme, gerçek interaktif shell.
- 🗂️ **Gruplandırma & etiketleme** — iç içe gruplar, renkli tag'ler, anlık arama.
- 📁 **SFTP dosya gezgini** — yükle / indir / yeniden adlandır / sil / klasör oluştur.
- 🔌 **Port forwarding** — local, remote ve dynamic (SOCKS5) SSH tünelleri.
- 📜 **Snippet kütüphanesi** — sık kullanılan komutları kaydet, tek tıkla bir sunucuda çalıştır.
- 🦘 **Jump host (bastion)** desteği — bir sunucuya başka bir sunucu üzerinden bağlan.
- 💾 **Export / Import** — şifreli vault'u taşınabilir tek dosya olarak dışa/içe aktar.
- ⌘ **Komut paleti (Cmd/Ctrl+K)** — anında sunucu ara, bağlan, panel değiştir.
- 🔎 **Terminal içi arama (Cmd/Ctrl+F)** — çıktıda metin ara.
- 🔄 **Otomatik güncelleme** — GitHub Releases üzerinden, uygulama içi bildirim.

## ⌨️ Klavye kısayolları

| Kısayol | İşlev |
| --- | --- |
| `Cmd/Ctrl + K` | Komut paleti |
| `Cmd/Ctrl + N` | Yeni sunucu |
| `Cmd/Ctrl + W` | Aktif sekmeyi kapat |
| `Cmd/Ctrl + F` | Terminalde ara (terminal odaktayken) |

## 🚀 Çalıştırma

```bash
npm install          # bağımlılıkları yükle (ilk sefer)
npm run dev          # geliştirme modu (hot reload)
```

Üretim derlemesi ve paketleme:

```bash
npm run build        # sadece derle
npm run build:mac    # macOS .dmg + .zip
npm run build:win    # Windows installer
npm run build:linux  # Linux AppImage + .deb
```

İlk açılışta bir **master parola** belirlersin — bu parola tüm vault'unu şifreler. Unutursan kayıtlarına erişemezsin.

## 📦 İndirilebilir paket oluşturma

```bash
npm run build:mac    # macOS → release/Janus-<sürüm>-<arch>.dmg + .zip
npm run build:win    # Windows → release/Janus-Setup-<sürüm>.exe
npm run build:linux  # Linux → release/Janus-<sürüm>.AppImage + .deb
```

Çıktılar `release/` klasörüne yazılır. Paketler **imzasızdır**; ilk açılışta:
- **macOS:** Gatekeeper uyarısı → sağ tık → "Aç", ya da Sistem Ayarları → Gizlilik & Güvenlik → "Yine de aç".
- **Windows:** SmartScreen → "Daha fazla bilgi" → "Yine de çalıştır".

> **macOS'te `.dmg` için not:** electron-builder dmg sarmalayıcısı `python` gerektirir. Eğer
> `Command failed: which python` hatası alırsan, Xcode komut satırı araçlarının lisansını kabul et:
> `sudo xcodebuild -license accept`. `.zip` çıktısı bu adıma ihtiyaç duymaz ve doğrudan kuruludur
> (aç → `Janus.app`'i `Applications`'a sürükle).

> **Çapraz platform:** macOS'te Windows/Linux paketi üretmek ek araçlar ister. Önerilen yol aşağıdaki
> **GitHub Actions** ile üç platformu birden derlemektir.

## 🔄 Sürüm çıkarma & otomatik güncelleme

Janus, **electron-updater** ile **GitHub Releases**'ten otomatik güncellenir. Akış:

1. **Bir kez kurulum:** Bu projeyi `janus` adıyla bir GitHub reposuna push'la.
   ```bash
   git remote add origin https://github.com/<KULLANICI_ADIN>/janus.git
   git push -u origin main
   ```
2. **Yeni sürüm yayınla:** `package.json`'daki `version`'ı artır (örn. `1.0.1`), commit'le, sonra etiketle ve push'la:
   ```bash
   npm version patch          # version'ı artırır + commit + tag oluşturur
   git push --follow-tags
   ```
3. `v*` etiketi push'lanınca [GitHub Actions workflow'u](.github/workflows/release.yml) otomatik tetiklenir:
   üç platformda (mac/win/linux) derler ve sonuçları **taslak bir GitHub Release**'e yükler.
4. GitHub'da Release'i **Publish** et.
5. Kullanıcıların uygulaması açıkken yeni sürümü **otomatik algılar** → sağ altta "Güncelleme mevcut"
   bildirimi çıkar → **İndir** → **Yeniden başlat & kur**.

CI'da repo bilgisi otomatik algılanır; ekstra ayar gerekmez. (Sadece `GH_TOKEN` gerekir, o da
GitHub Actions tarafından otomatik sağlanır.)

> **Önemli — macOS imzalama:** macOS'te otomatik güncellemenin sorunsuz çalışması için uygulamanın
> **kod imzalı + notarize** edilmiş olması gerekir (Squirrel.Mac şartı). İmzasız mac sürümleri elle
> indirilip kurulabilir ama otomatik güncelleme mac'te imza ister. Windows ve Linux'ta imzasız
> otomatik güncelleme çalışır. İmzalamak için Apple Developer sertifikanı CI secret'ı olarak ekleyip
> `electron-builder.yml`'de `mac.identity` ayarını yapman yeterli.

## 🏗️ Mimari

```
src/
├─ shared/            # main + renderer ortak tipler & IPC kanal adları
│  ├─ types.ts
│  └─ ipc.ts
├─ main/              # Electron ana süreç (Node.js)
│  ├─ index.ts        # uygulama yaşam döngüsü, pencere
│  ├─ crypto.ts       # AES-256-GCM + scrypt anahtar türetme
│  ├─ store.ts        # tek dosya vault yönetimi (kilitle/aç)
│  ├─ ssh-manager.ts  # ssh2 ile SSH shell / SFTP / tünel motoru
│  └─ ipc.ts          # tüm IPC handler'ları
├─ preload/           # güvenli contextBridge köprüsü
│  └─ index.ts        # window.janus API'si
└─ renderer/          # React arayüzü (TypeScript + Tailwind)
   └─ src/
      ├─ store.ts     # zustand merkezi durum
      ├─ App.tsx
      └─ components/  # LockScreen, Sidebar, Terminal, SftpPanel, ...
```

### Güvenlik modeli

- Parola yalnızca **scrypt** ile anahtar türetmek için kullanılır; diske yazılmaz.
- Vault dosyası **AES-256-GCM** ile şifrelenir (kimlik doğrulamalı şifreleme — kurcalanırsa açılmaz).
- Renderer'ın Node.js erişimi yok (`contextIsolation: true`, `nodeIntegration: false`). Tüm ayrıcalıklı işlemler ana süreçte, IPC üzerinden yapılır.
- Vault dosyası varsayılan konumu: `~/Library/Application Support/janus/janus.vault.json` (macOS).

## ⌨️ İpuçları

- Sunucuya **çift tıkla** → terminal açılır.
- Sunucuya **sağ tıkla** → bağlam menüsü (terminal, SFTP, düzenle, çoğalt, sil).
- Üst bardaki **Kilitle** butonu vault'u bellekten temizler.
