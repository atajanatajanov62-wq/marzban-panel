# 🦸 Professional X Panel

  Marzban VPN panelini 3 franchise temalı, animasyonlu ve cihaz/konum takipli bir panele dönüştürür.

  ## Temalar
  | Tema | İkon | Özellik |
  |------|------|---------|
  | **Marvel X** | 🔴 | Kırmızı-altın enerji orbs |
  | **Ninja X** | 🟣 | Yeşil-mor füturistik |
  | **Kombat X** | ⚫ | Sarı-siyah savaşçı |

  ## Tek Komutla Kurulum

  > **Not:** Sunucuda Node.js yoksa otomatik kurulur (v22). Sadece git ve python3 gereklidir.

  ```bash
  # curl ile:
  bash <(curl -fsSL https://raw.githubusercontent.com/atajanatajanov62-wq/marzban-panel/main/deploy/install.sh)

  # wget ile (curl yoksa):
  bash <(wget -qO- https://raw.githubusercontent.com/atajanatajanov62-wq/marzban-panel/main/deploy/install.sh)
  ```

  ## Kurulum Adımları (otomatik)
  1. Sistem bağımlılıkları kurulur (curl/wget/git/python3)
  2. Node.js 22 kurulur (yoksa)
  3. Repo klonlanır → `/opt/professional-x-panel`
  4. `npm install` + `vite build` çalışır (doğrudan dashboard dizininde)
  5. Marzban kurulumu tespit edilir (Docker/bare-metal)
  6. Eski dashboard yedeklenir
  7. Yeni panel kopyalanır
  8. Backend (cihaz/konum API) kurulur

  ## Gereksinimler
  - Marzban kurulu sunucu (Docker veya bare-metal)
  - Root erişimi
  - İnternet bağlantısı
  - Python 3.8+ (Marzban ile birlikte gelir)

  ## Özellikler
  - 🎨 3 franchise teması (tek tıkla değiştirme)
  - 📱 Bağlı cihaz marka/model takibi (UA parser)
  - 🌍 Gerçek zamanlı coğrafi konum (ip-api.com)
  - ✨ Animasyonlu arka planlar
  - 🔄 Otomatik yedekleme

  ## Güncelleme
  ```bash
  bash <(curl -fsSL https://raw.githubusercontent.com/atajanatajanov62-wq/marzban-panel/main/deploy/install.sh)
  ```
  Script mevcut kurulumu algılayıp `git pull` ile günceller.

  ## Lisans
  Bu proje eğitim amaçlı geliştirilmiştir.
  