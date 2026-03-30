# Marzban Panel — Standalone VPN Management

<p align="center">
  <img src="https://img.shields.io/badge/version-0.8.4--standalone-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/xray--core-powered-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/lang-TR%20%7C%20EN%20%7C%20RU%20%7C%20TK-green?style=flat-square" />
  <img src="https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square" />
</p>

Marzban'a uyumlu, bağımsız çalışan VPN yönetim paneli. PostgreSQL + Express backend, React frontend, Xray-core entegrasyonu.

## ✨ Özellikler

| Özellik | Durum |
|---------|-------|
| Kullanıcı yönetimi (VLESS/VMess/Trojan/SS) | ✅ |
| Xray-core entegrasyonu + otomatik reload | ✅ |
| Otomatik trafik istatistiği senkronizasyonu | ✅ |
| Subscription endpoint (`/sub/:user/:token`) | ✅ |
| HWID cihaz kilitleme | ✅ |
| Admin yönetimi (sudo/normal) | ✅ |
| 4 dil desteği (🇹🇷 TR / 🇬🇧 EN / 🇷🇺 RU / 🇹🇲 TK) | ✅ |
| Trafik grafikleri (Recharts) | ✅ |
| Inbound & Host yönetimi | ✅ |
| Node yönetimi | ✅ |
| Subscription şablonları | ✅ |
| Toplu kullanıcı işlemleri | ✅ |
| QR kod paylaşımı | ✅ |
| CLI terminal (macOS tarzı) | ✅ |
| Docker desteği | ✅ |
| Let's Encrypt / Self-signed SSL | ✅ |

## 🚀 Hızlı Kurulum (Ubuntu / Debian)

```bash
sudo bash -c "$(curl -sL https://raw.githubusercontent.com/atajanatajanov62-wq/marzban-panel/main/install.sh)"
```

Kurulum yaklaşık 5-10 dakika sürer. Script:
- Node.js 22, PostgreSQL, Nginx, Xray-core kurar
- Veritabanını ve servisleri yapılandırır
- `marzban` CLI komutunu kurar
- (İsteğe bağlı) Let's Encrypt SSL kurar

## 🐳 Docker ile Kurulum

```bash
git clone https://github.com/atajanatajanov62-wq/marzban-panel.git
cd marzban-panel

# .env dosyasını düzenle
cp .env.example .env
nano .env

# Başlat
docker compose up -d
```

## 🖥️ `marzban` CLI Komutları

```bash
marzban status      # Servis durumları
marzban start       # Başlat
marzban stop        # Durdur
marzban restart     # Yeniden başlat
marzban logs api    # API logları
marzban logs xray   # Xray logları
marzban update      # GitHub'dan güncelle
marzban backup      # Veritabanı yedeği
marzban restore     # Yedekten geri yükle
marzban cli         # Etkileşimli terminal
marzban uninstall   # Kaldır
```

## ⚙️ Yapılandırma

Tüm ayarlar `/etc/marzban/.env` dosyasındadır:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
XRAY_BIN=/usr/local/bin/xray
XRAY_CERT_FILE=/etc/ssl/xray/cert.pem
XRAY_KEY_FILE=/etc/ssl/xray/key.pem
```

Tam örnek için [`.env.example`](.env.example) dosyasına bakın.

## 📡 API Endpoint'leri

| Method | Endpoint | Açıklama |
|--------|---------|---------|
| POST | `/api/admin/token` | JWT token al |
| GET/POST/PUT/DELETE | `/api/user/:username` | Kullanıcı CRUD |
| GET | `/api/users` | Kullanıcı listesi |
| GET/POST/DELETE | `/api/inbound` | Inbound yönetimi |
| GET/PUT | `/api/hosts` | Host/DNS ayarları |
| GET/POST/DELETE | `/api/admin` | Admin yönetimi |
| GET | `/sub/:user/:token` | Subscription (VPN istemcileri) |
| GET | `/api/xray/status` | Xray durumu |
| POST | `/api/xray/reload` | Xray config yenile |
| GET | `/api/xray/config` | Xray config görüntüle |

## 🏗️ Proje Yapısı

```
marzban-panel/
├── install.sh                  # Ana kurulum scripti
├── docker-compose.yml          # Docker kurulumu
├── Dockerfile.api              # API container
├── Dockerfile.panel            # Panel container
├── .env.example                # Örnek yapılandırma
├── artifacts/
│   ├── api-server/             # Express + TypeScript backend
│   │   └── src/
│   │       ├── routes/         # API route handlers
│   │       └── lib/
│   │           ├── xray.ts     # Xray config generator
│   │           ├── xrayManager.ts # Xray process manager
│   │           └── statsSync.ts   # Trafik istatistiği sync
│   └── marzban-panel/          # React + Vite frontend
│       └── src/
│           ├── components/     # UI bileşenleri
│           ├── pages/          # Sayfalar
│           └── store/          # Zustand store
├── lib/
│   └── db/                     # Drizzle ORM + PostgreSQL schema
└── deploy/
    ├── install.sh              # (Eski) kurulum scripti
    ├── manage.sh               # Yönetim yardımcısı
    └── nginx.conf              # Docker Nginx config
```

## 🔧 Geliştirme

```bash
git clone https://github.com/atajanatajanov62-wq/marzban-panel.git
cd marzban-panel
pnpm install

# PostgreSQL bağlantısını ayarla
cp .env.example .env
# .env içinde DATABASE_URL'i düzenle

# DB şemasını oluştur
cd lib/db && pnpm run push

# Geliştirme modunda başlat
cd ../..
pnpm --filter @workspace/api-server run dev   # API: :8080
pnpm --filter @workspace/marzban-panel run dev # Panel: :21491
```

**Varsayılan giriş:** `admin` / `admin`

## 🔄 Güncelleme

```bash
marzban update
```

Veya Docker ile:
```bash
cd /opt/marzban-panel
git pull
docker compose up -d --build
```

## 📝 Lisans

MIT License — Bkz. [LICENSE](LICENSE)

## 🙏 Teşekkürler

- [Marzban](https://github.com/Gozargah/Marzban) — İlham kaynağı
- [Xray-core](https://github.com/XTLS/Xray-core) — VPN altyapısı
- [Drizzle ORM](https://orm.drizzle.team) — Veritabanı
