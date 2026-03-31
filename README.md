# Professional X Panel 🎭

  > Marzban VPN Panel için özel tema ve cihaz/konum takip sistemi.

  ![Themes](https://img.shields.io/badge/Themes-3-red) ![Marzban](https://img.shields.io/badge/Marzban-Compatible-green) ![License](https://img.shields.io/badge/License-MIT-blue)

  ## ✨ Özellikler

  - **3 Franchise Teması**: Marvel X • Ninja X (TMNT) • Kombat X (Mortal Kombat)
  - **Animasyonlu Arka Planlar**: Her temaya özel parçacık/orb animasyonları
  - **Cihaz & Konum Takibi**: Bağlanan cihazın markası, modeli ve şehri
  - **Python Backend Entegrasyonu**: Gerçek zamanlı bağlantı geçmişi
  - **Tüm Marzban İşlevleri Korundu**: V2Box, Xray, tüm protokoller çalışıyor

  ## 🚀 Kurulum (Tek Komut)

  Sunucunuzda root olarak çalıştırın:

  ```bash
  bash <(curl -fsSL https://raw.githubusercontent.com/atajanatajanov62-wq/marzban-panel/main/deploy/install.sh)
  ```

  > Script hem **Docker** hem de **bare-metal** Marzban kurulumlarını otomatik algılar.

  ---

  ## 📦 Manuel Kurulum

  ### 1. Kaynak Kodu İndir

  ```bash
  git clone https://github.com/atajanatajanov62-wq/marzban-panel.git
  cd marzban-panel
  ```

  ### 2. Frontend Build Al

  ```bash
  # Node.js 18+ ve pnpm gerekli
  npm install -g pnpm
  pnpm install --frozen-lockfile
  cd artifacts/marzban-dashboard
  NODE_ENV=production BASE_PATH=/ pnpm build
  # Çıktı: artifacts/marzban-dashboard/dist/public/
  ```

  ### 3. Dosyaları Kopyala

  **Docker kurulum:**
  ```bash
  CONTAINER=$(docker ps --format '{{.Names}}' | grep marzban)
  docker exec $CONTAINER find /app -name "index.html" # dashboard dizinini bul
  docker cp artifacts/marzban-dashboard/dist/public/. $CONTAINER:/app/dashboard/
  docker restart $CONTAINER
  ```

  **Bare-metal kurulum:**
  ```bash
  # Marzban dashboard dizinini bul (ör: /opt/marzban/app/dashboard)
  cp -r artifacts/marzban-dashboard/dist/public/. /opt/marzban/app/dashboard/
  systemctl restart marzban
  ```

  ---

  ## 🔌 Backend Entegrasyonu (Cihaz & Konum Takibi)

  Gerçek bağlantı verisi için Python backend'e patch uygulanması gerekir:

  ```bash
  # Bağımlılık kur
  pip3 install httpx

  # Patch uygula (Marzban otomatik algılanır)
  python3 deploy/backend/apply_patch.py

  # Veya manuel yol belirt
  python3 deploy/backend/apply_patch.py --marzban-path /opt/marzban

  # Marzban'ı yeniden başlat
  systemctl restart marzban
  ```

  Patch şunları yapar:
  - `px_connections.py` modülünü Marzban app dizinine kopyalar
  - `/api/user/{username}/connections` endpoint'i ekler
  - Abonelik isteklerini izleyerek cihaz/IP/konum kaydeder
  - Ayrı bir SQLite DB kullanır (Marzban DB'ye dokunmaz)

  ---

  ## 🎨 Tema Seçimi

  Panel içinde sağ üstteki tema ikonuna tıklayarak 3 tema arasında geçiş yapabilirsiniz:

  | Tema | Renk Paleti | Logo |
  |------|-------------|------|
  | Marvel X | Lacivert + Kırmızı | MX |
  | Ninja X | Siyah + Yeşil | 🐢 |
  | Kombat X | Siyah + Altın | ⚔ |

  ---

  ## 🔄 GitHub Actions ile Otomatik Release

  Repo'nun `.github/workflows/` klasörüne `github-actions-release.yml` dosyasını kopyalayın:

  ```bash
  mkdir -p .github/workflows
  cp github-actions-release.yml .github/workflows/release.yml
  git add .github/workflows/release.yml
  git commit -m "ci: add release workflow"
  git push
  ```

  Bundan sonra her `v*` tag'inde otomatik build + release oluşturulur:

  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```

  ---

  ## 📁 Dosya Yapısı

  ```
  ├── artifacts/marzban-dashboard/   # Frontend kaynak kodu
  │   ├── src/
  │   │   ├── themes/themes.ts       # 3 tema tanımları
  │   │   ├── contexts/ThemeContext.tsx
  │   │   ├── components/marzban/
  │   │   │   ├── DeviceInfo.tsx     # Cihaz & konum bileşeni
  │   │   │   ├── Header.tsx         # Tema logosu
  │   │   │   └── UserDialog.tsx     # Franchise banner
  │   │   └── hooks-marzban/
  │   │       └── useUserConnections.ts
  │   └── deploy/
  │       ├── install.sh             # Tek komutlu kurulum scripti
  │       └── backend/
  │           ├── px_connections.py  # Python backend modülü
  │           └── apply_patch.py     # Otomatik patcher
  └── github-actions-release.yml     # CI/CD workflow
  ```

  ---

  ## 🐛 Sorun Giderme

  **Panel yüklenmiyor:**
  ```bash
  # Marzban loglarını kontrol et
  journalctl -u marzban -n 50
  # veya Docker için
  docker logs marzban --tail 50
  ```

  **Eski haline dönmek:**
  ```bash
  # Yedek otomatik alındı, geri yükle
  python3 deploy/backend/apply_patch.py --undo
  # Orijinal dashboard yedekleri: /app/dashboard.backup-YYYYMMDD-HHMMSS/
  ```

  ---

  MIT License — [@atajanatajanov62-wq](https://github.com/atajanatajanov62-wq)
  