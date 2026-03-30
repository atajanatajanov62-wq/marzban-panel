#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════╗
# ║         Marzban Panel v0.8.4-standalone — Kurulum            ║
# ║         https://github.com/YOUR_USERNAME/marzban-panel       ║
# ╚══════════════════════════════════════════════════════════════╝
#
# Tek komutla kurulum:
#   sudo bash -c "$(curl -sL https://raw.githubusercontent.com/YOUR_USERNAME/marzban-panel/main/install.sh)"
#
# Desteklenen: Ubuntu 20.04 / 22.04 / 24.04 / Debian 11+

set -euo pipefail

# ── Renkler ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; MAGENTA='\033[0;35m'
NC='\033[0m'; BOLD='\033[1m'; DIM='\033[2m'

# ── Yardımcı fonksiyonlar ───────────────────────────────────────────────────
log()     { echo -e "${GREEN}[✓]${NC} $*"; }
warn()    { echo -e "${YELLOW}[!]${NC} $*"; }
err()     { echo -e "${RED}[✗]${NC} $*" >&2; exit 1; }
info()    { echo -e "${CYAN}[i]${NC} $*"; }
section() { echo -e "\n${BLUE}${BOLD}▶ $*${NC}\n"; }
ask()     { echo -ne "${YELLOW}[?]${NC} $*"; }

# ── Sabitler ────────────────────────────────────────────────────────────────
REPO="atajanatajanov62-wq/marzban-panel"
BRANCH="main"
INSTALL_DIR="/opt/marzban-panel"
CONFIG_DIR="/etc/marzban"
LOG_DIR="/var/log/marzban"
GITHUB_RAW="https://raw.githubusercontent.com/${REPO}/${BRANCH}"
GITHUB_ARCHIVE="https://github.com/${REPO}/archive/refs/heads/${BRANCH}.tar.gz"
PANEL_PORT=3000
API_PORT=8080
XRAY_API_PORT=62050
MIN_RAM_MB=512

# ── Ön kontroller ───────────────────────────────────────────────────────────
pre_check() {
  [[ "$EUID" -ne 0 ]] && err "Root yetkisi gerekli. 'sudo' ile çalıştırın."

  # OS kontrolü
  if [[ -f /etc/os-release ]]; then
    source /etc/os-release
    case "$ID" in
      ubuntu|debian) ;;
      *) warn "Test edilmemiş OS: $ID. Devam ediliyor..." ;;
    esac
  fi

  # RAM kontrolü
  local ram_mb
  ram_mb=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
  [[ "$ram_mb" -lt "$MIN_RAM_MB" ]] && warn "RAM düşük (${ram_mb}MB). En az 512MB önerilir."

  # Gerekli araçlar
  for cmd in curl wget tar openssl; do
    command -v "$cmd" &>/dev/null || { apt-get install -y -qq "$cmd" 2>/dev/null || true; }
  done
}

# ── Banner ───────────────────────────────────────────────────────────────────
print_banner() {
  echo -e "${BLUE}${BOLD}"
  cat << 'EOF'
  __  __                _                  ____                  _
 |  \/  | __ _ _ __ __| |__   __ _ _ __  |  _ \ __ _ _ __   ___| |
 | |\/| |/ _` | '__/_  _  _ \/ _` | '_ \ | |_) / _` | '_ \ / _ \ |
 | |  | | (_| | | | | | |_) | (_| | | | ||  __/ (_| | | | |  __/ |
 |_|  |_|\__,_|_| |_| |_.__/ \__,_|_| |_||_|   \__,_|_| |_|\___|_|

EOF
  echo -e "${NC}${DIM}  VPN Panel v0.8.4-standalone — Xray-core Powered${NC}"
  echo -e "${DIM}  https://github.com/${REPO}${NC}"
  echo -e ""
}

# ── Kullanıcı girdisi ────────────────────────────────────────────────────────
collect_input() {
  echo -e "${CYAN}${BOLD}Kurulum Yapılandırması${NC}"
  echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  # Domain
  ask "Sunucu domain adresiniz (Enter = IP ile devam): "
  read -r DOMAIN
  DOMAIN="${DOMAIN:-}"

  # SSL
  USE_SSL=false
  if [[ -n "$DOMAIN" ]]; then
    ask "Let's Encrypt SSL kurulsun mu? (E/h): "
    read -r ans
    [[ "${ans,,}" != "h" ]] && USE_SSL=true
  fi

  # Admin şifresi
  ask "Admin şifresi [varsayılan: admin]: "
  read -rs ADMIN_PASS
  echo ""
  ADMIN_PASS="${ADMIN_PASS:-admin}"

  echo ""
  echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "  Domain:   ${BOLD}${DOMAIN:-$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')}${NC}"
  echo -e "  SSL:      ${BOLD}${USE_SSL}${NC}"
  echo -e "  API Port: ${BOLD}${API_PORT}${NC}"
  echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  ask "Devam edilsin mi? (E/h): "
  read -r confirm
  [[ "${confirm,,}" == "h" ]] && { echo "İptal edildi."; exit 0; }
  echo ""
}

# ── Sistem paketleri ─────────────────────────────────────────────────────────
install_system_deps() {
  section "Sistem Paketleri Güncelleniyor"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq \
    curl wget git tar unzip \
    build-essential ca-certificates gnupg \
    nginx postgresql postgresql-contrib \
    openssl certbot python3-certbot-nginx \
    ufw logrotate cron
  log "Sistem paketleri hazır"
}

# ── Node.js ──────────────────────────────────────────────────────────────────
install_node() {
  section "Node.js 22 Kuruluyor"
  if command -v node &>/dev/null; then
    local ver
    ver=$(node -v | cut -d. -f1 | tr -d 'v')
    if [[ "$ver" -ge 20 ]]; then
      log "Node.js $(node -v) zaten kurulu"
      return
    fi
  fi
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs
  npm install -g pnpm@latest --quiet
  log "Node.js $(node -v) + pnpm $(pnpm -v) kuruldu"
}

# ── PostgreSQL ───────────────────────────────────────────────────────────────
setup_postgres() {
  section "PostgreSQL Yapılandırılıyor"
  systemctl start postgresql
  systemctl enable postgresql

  DB_NAME="marzban"
  DB_USER="marzban"
  DB_PASS=$(openssl rand -hex 20)

  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';" 2>/dev/null \
    || sudo -u postgres psql -c "ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null || true
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" 2>/dev/null

  log "PostgreSQL veritabanı '${DB_NAME}' hazır"
}

# ── Xray-core ────────────────────────────────────────────────────────────────
install_xray() {
  section "Xray-core Kuruluyor"

  # Mevcut sürümü kontrol et
  if [[ -f /usr/local/bin/xray ]]; then
    local current_ver
    current_ver=$(/usr/local/bin/xray version 2>/dev/null | grep -oP 'Xray \K[0-9.]+' || echo "")
    if [[ -n "$current_ver" ]]; then
      info "Xray $current_ver zaten kurulu, güncelleniyor..."
    fi
  fi

  # Mimari algıla
  local arch
  case "$(uname -m)" in
    x86_64)  arch="linux-64" ;;
    aarch64) arch="linux-arm64-v8a" ;;
    armv7l)  arch="linux-arm32-v7a" ;;
    *)       arch="linux-64" ;;
  esac

  # Son sürüm URL
  local version
  version=$(curl -s "https://api.github.com/repos/XTLS/Xray-core/releases/latest" \
    | grep -oP '"tag_name":\s*"v\K[^"]+' | head -1 || echo "24.9.30")

  local url="https://github.com/XTLS/Xray-core/releases/download/v${version}/Xray-${arch}.zip"
  info "İndiriliyor: Xray v${version} (${arch})"

  mkdir -p /tmp/xray-dl
  wget -q --show-progress -O /tmp/xray-dl/xray.zip "$url" \
    || wget -q -O /tmp/xray-dl/xray.zip \
       "https://github.com/XTLS/Xray-core/releases/latest/download/Xray-${arch}.zip"

  cd /tmp/xray-dl
  unzip -oq xray.zip xray
  install -m 755 xray /usr/local/bin/xray
  cd /

  # Geoip ve Geosite
  mkdir -p /usr/local/share/xray
  wget -q -O /usr/local/share/xray/geoip.dat \
    "https://github.com/XTLS/Xray-core/releases/latest/download/geoip.dat" || true
  wget -q -O /usr/local/share/xray/geosite.dat \
    "https://github.com/XTLS/Xray-core/releases/latest/download/geosite.dat" || true

  mkdir -p /etc/xray /var/log/xray
  rm -rf /tmp/xray-dl

  local ver
  ver=$(/usr/local/bin/xray version 2>/dev/null | head -1 || echo "Xray kuruldu")
  log "$ver"
}

# ── Proje indir / güncelle ───────────────────────────────────────────────────
download_project() {
  section "Marzban Panel İndiriliyor"

  if [[ -d "$INSTALL_DIR/.git" ]]; then
    info "Mevcut kurulum güncelleniyor..."
    cd "$INSTALL_DIR"
    git fetch origin "$BRANCH" --quiet
    git reset --hard "origin/$BRANCH" --quiet
    log "Kod güncellendi (git pull)"
    return
  fi

  # İlk kurulum
  if [[ -d "$INSTALL_DIR" ]]; then
    mv "$INSTALL_DIR" "${INSTALL_DIR}_bak_$(date +%Y%m%d_%H%M%S)"
    warn "Eski kurulum yedeklendi"
  fi

  info "GitHub'dan indiriliyor: ${REPO}@${BRANCH}"
  mkdir -p "$(dirname "$INSTALL_DIR")"

  # Git clone dene, yoksa tarball
  if command -v git &>/dev/null; then
    git clone --depth 1 --branch "$BRANCH" \
      "https://github.com/${REPO}.git" "$INSTALL_DIR" --quiet \
      || { 
        warn "git clone başarısız, tarball deneniyor..."
        download_tarball
      }
  else
    download_tarball
  fi

  log "Kaynak kod indirildi → ${INSTALL_DIR}"
}

download_tarball() {
  wget -q -O /tmp/marzban-src.tar.gz "$GITHUB_ARCHIVE"
  mkdir -p "$INSTALL_DIR"
  tar -xzf /tmp/marzban-src.tar.gz -C "$INSTALL_DIR" --strip-components=1
  rm -f /tmp/marzban-src.tar.gz
}

# ── Yapılandırma ─────────────────────────────────────────────────────────────
write_config() {
  section "Yapılandırma Dosyaları Oluşturuluyor"
  mkdir -p "$CONFIG_DIR" "$LOG_DIR"

  JWT_SECRET=$(openssl rand -hex 32)
  SS_MASTER_PASS=$(openssl rand -hex 16)

  cat > "${CONFIG_DIR}/.env" << EOF
# ─── Veritabanı ─────────────────────────────────────────────────
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}

# ─── JWT ────────────────────────────────────────────────────────
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=24h

# ─── Sunucu ─────────────────────────────────────────────────────
PORT=${API_PORT}
NODE_ENV=production
PANEL_DOMAIN=${DOMAIN:-}

# ─── Xray-core ──────────────────────────────────────────────────
XRAY_BIN=/usr/local/bin/xray
XRAY_CONFIG=/etc/xray/config.json
XRAY_API_PORT=${XRAY_API_PORT}
XRAY_LOG_LEVEL=warning
XRAY_ACCESS_LOG=/var/log/xray/access.log
XRAY_ERROR_LOG=/var/log/xray/error.log
XRAY_CERT_FILE=/etc/ssl/xray/cert.pem
XRAY_KEY_FILE=/etc/ssl/xray/key.pem
XRAY_WS_PATH=/ws
XRAY_GRPC_SERVICE=grpc
XRAY_SS_MASTER_PASS=${SS_MASTER_PASS}
XRAY_REALITY_DEST=google.com:443
XRAY_REALITY_SNI=google.com
EOF

  # Sembolik bağ
  ln -sf "${CONFIG_DIR}/.env" "${INSTALL_DIR}/.env"
  chmod 600 "${CONFIG_DIR}/.env"
  log "Yapılandırma → ${CONFIG_DIR}/.env"
}

# ── Bağımlılıklar + Build ────────────────────────────────────────────────────
build_project() {
  section "Proje Derleniyor"
  cd "$INSTALL_DIR"

  info "Bağımlılıklar yükleniyor..."
  pnpm install --frozen-lockfile --silent

  info "Veritabanı şeması oluşturuluyor..."
  (cd lib/db && DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}" \
    pnpm run push --force 2>/dev/null \
    || DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}" \
    pnpm run push)

  info "Frontend derleniyor..."
  (cd artifacts/marzban-panel && pnpm run build)

  info "API server derleniyor..."
  (cd artifacts/api-server && pnpm run build)

  log "Derleme tamamlandı"
}

# ── Admin şifresi ayarla ─────────────────────────────────────────────────────
set_admin_password() {
  # API ilk başlatmada seed çalıştırıyor (admin/admin)
  # Özel şifre isteniyorsa override
  if [[ "$ADMIN_PASS" != "admin" ]]; then
    info "Admin şifresi güncelleniyor..."
    # Servis başlatıldıktan sonra API ile güncelle
    PENDING_ADMIN_PASS="$ADMIN_PASS"
  fi
}

# ── SSL ──────────────────────────────────────────────────────────────────────
setup_ssl() {
  mkdir -p /etc/ssl/xray

  if $USE_SSL && [[ -n "$DOMAIN" ]]; then
    section "SSL Sertifikası (Let's Encrypt)"
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
      --email "admin@${DOMAIN}" --redirect --quiet || \
      { warn "Certbot başarısız. Self-signed sertifika kullanılıyor."; setup_self_signed; }

    # Xray için sembolik bağ
    ln -sf "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" /etc/ssl/xray/cert.pem
    ln -sf "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" /etc/ssl/xray/key.pem

    # Otomatik yenileme için hook
    cat > /etc/letsencrypt/renewal-hooks/deploy/xray-reload.sh << 'EOF2'
#!/bin/bash
cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" /etc/ssl/xray/cert.pem
cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" /etc/ssl/xray/key.pem
systemctl reload xray 2>/dev/null || true
EOF2
    chmod +x /etc/letsencrypt/renewal-hooks/deploy/xray-reload.sh
    log "Let's Encrypt SSL hazır (otomatik yenileme aktif)"
  else
    setup_self_signed
  fi
}

setup_self_signed() {
  if [[ ! -f /etc/ssl/xray/cert.pem ]]; then
    local cn="${DOMAIN:-$(hostname)}"
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
      -keyout /etc/ssl/xray/key.pem \
      -out /etc/ssl/xray/cert.pem \
      -subj "/CN=${cn}" \
      -addext "subjectAltName=DNS:${cn}" 2>/dev/null
    log "Self-signed SSL sertifikası oluşturuldu (10 yıl)"
  fi
}

# ── Systemd servisleri ───────────────────────────────────────────────────────
install_services() {
  section "Sistem Servisleri Kuruluyor"

  # Xray servisi
  cat > /etc/systemd/system/xray.service << 'EOF'
[Unit]
Description=Xray VPN Core
Documentation=https://xtls.github.io
After=network.target nss-lookup.target

[Service]
Type=simple
User=root
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
NoNewPrivileges=true
ExecStart=/usr/local/bin/xray run -config /etc/xray/config.json
ExecReload=/bin/kill -USR1 $MAINPID
Restart=on-failure
RestartSec=5
LimitNOFILE=1000000

[Install]
WantedBy=multi-user.target
EOF

  # Marzban API servisi
  cat > /etc/systemd/system/marzban-api.service << EOF
[Unit]
Description=Marzban Panel API
Documentation=https://github.com/${REPO}
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}/artifacts/api-server
ExecStart=/usr/bin/node --enable-source-maps ./dist/index.mjs
Restart=always
RestartSec=5
EnvironmentFile=${CONFIG_DIR}/.env
StandardOutput=append:${LOG_DIR}/api.log
StandardError=append:${LOG_DIR}/api.log
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

  # Marzban Panel (statik frontend servisi)
  cat > /etc/systemd/system/marzban-panel.service << EOF
[Unit]
Description=Marzban Panel Frontend
After=network.target

[Service]
Type=simple
WorkingDirectory=${INSTALL_DIR}/artifacts/marzban-panel
ExecStart=/usr/bin/npx --yes serve@latest dist -l ${PANEL_PORT} --no-clipboard
Restart=always
RestartSec=5
Environment=NODE_ENV=production
StandardOutput=append:${LOG_DIR}/panel.log
StandardError=append:${LOG_DIR}/panel.log

[Install]
WantedBy=multi-user.target
EOF

  # logrotate
  cat > /etc/logrotate.d/marzban << EOF
${LOG_DIR}/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
}
EOF

  systemctl daemon-reload
  systemctl enable xray marzban-api marzban-panel

  # Önce API başlat (Xray config.json oluşturur)
  systemctl start marzban-api
  info "API server başlatıldı, Xray config oluşturuluyor..."
  sleep 4

  # Xray başlat
  systemctl start xray
  sleep 1

  # Panel başlat
  systemctl start marzban-panel

  log "Tüm servisler başlatıldı"
}

# ── Admin şifresini güncelle (API üzerinden) ──────────────────────────────────
update_admin_password() {
  if [[ -z "${PENDING_ADMIN_PASS:-}" ]] || [[ "$PENDING_ADMIN_PASS" == "admin" ]]; then
    return
  fi

  info "Admin şifresi API üzerinden güncelleniyor..."
  local max_wait=15 waited=0
  while [[ $waited -lt $max_wait ]]; do
    if curl -sf "http://127.0.0.1:${API_PORT}/api/health" >/dev/null 2>&1; then
      break
    fi
    sleep 1; ((waited++))
  done

  local token
  token=$(curl -sf -X POST "http://127.0.0.1:${API_PORT}/api/admin/token" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin"}' \
    | grep -oP '"access_token":"\K[^"]+' || echo "")

  if [[ -n "$token" ]]; then
    curl -sf -X PUT "http://127.0.0.1:${API_PORT}/api/admin" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      -d "{\"password\":\"${PENDING_ADMIN_PASS}\"}" >/dev/null || true
    log "Admin şifresi güncellendi"
  fi
}

# ── Nginx proxy ──────────────────────────────────────────────────────────────
setup_nginx() {
  section "Nginx Yapılandırılıyor"

  local server_name="${DOMAIN:-_}"

  cat > /etc/nginx/sites-available/marzban << EOF
# ── Marzban Panel — Nginx Proxy ──────────────────────────────
# Oluşturulma: $(date)
# Panel: http://${server_name}
# API:   http://${server_name}/api

map \$http_upgrade \$connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${server_name};

    # Panel arayüzü
    location / {
        proxy_pass         http://127.0.0.1:${PANEL_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }

    # API backend
    location /api/ {
        proxy_pass         http://127.0.0.1:${API_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }

    # VPN Subscription endpoint
    location /sub/ {
        proxy_pass         http://127.0.0.1:${API_PORT}/sub/;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        add_header         Cache-Control "no-store, no-cache";
    }
}
EOF

  ln -sf /etc/nginx/sites-available/marzban /etc/nginx/sites-enabled/marzban
  rm -f /etc/nginx/sites-enabled/default

  nginx -t && systemctl reload nginx
  log "Nginx proxy yapılandırıldı"
}

# ── Güvenlik duvarı ──────────────────────────────────────────────────────────
setup_firewall() {
  section "Güvenlik Duvarı Yapılandırılıyor"
  if command -v ufw &>/dev/null; then
    ufw --force enable >/dev/null
    ufw allow 22/tcp   comment "SSH"  >/dev/null
    ufw allow 80/tcp   comment "HTTP" >/dev/null
    ufw allow 443/tcp  comment "HTTPS" >/dev/null
    ufw reload >/dev/null
    log "UFW güvenlik duvarı aktif (22, 80, 443)"
  fi
}

# ── `marzban` CLI aracı ──────────────────────────────────────────────────────
install_cli() {
  section "Marzban CLI Kuruluyor"

  cat > /usr/local/bin/marzban << CLISCRIPT
#!/usr/bin/env bash
# Marzban Panel — Yönetim CLI
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR}"
CONFIG_DIR="${CONFIG_DIR}"
LOG_DIR="${LOG_DIR}"
SERVICES=(xray marzban-api marzban-panel)
API_PORT="${API_PORT}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'

log()  { echo -e "\${GREEN}[✓]\${NC} \$*"; }
warn() { echo -e "\${YELLOW}[!]\${NC} \$*"; }
err()  { echo -e "\${RED}[✗]\${NC} \$*" >&2; exit 1; }

need_root() { [[ "\$EUID" -eq 0 ]] || err "Root yetkisi gerekli: sudo marzban \$*"; }

cmd_status() {
  echo -e "\n\${BOLD}Servis Durumları\${NC}"
  echo -e "\${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\${NC}"
  for svc in "\${SERVICES[@]}"; do
    if systemctl is-active --quiet "\$svc"; then
      local pid uptime_info
      pid=\$(systemctl show "\$svc" -p MainPID --value 2>/dev/null || echo "")
      uptime_info=\$(systemctl show "\$svc" -p ActiveEnterTimestamp --value 2>/dev/null | sed 's/ [A-Z]*\$//' || echo "")
      echo -e "  \${GREEN}● çalışıyor\${NC}  \${BOLD}\${svc}\${NC} \${pid:+(pid: \$pid)}"
    else
      echo -e "  \${RED}● durdu\${NC}      \${BOLD}\${svc}\${NC}"
    fi
  done
  echo -e "\${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\${NC}\n"

  # Xray versiyonu
  if [[ -f /usr/local/bin/xray ]]; then
    echo -e "  Xray:  \$(/usr/local/bin/xray version 2>/dev/null | head -1 || echo 'bilinmiyor')"
  fi
  echo -e "  Panel: \$(cat \${INSTALL_DIR}/artifacts/marzban-panel/package.json 2>/dev/null | grep -oP '\"version\":\s*\"\K[^\"]+' || echo 'bilinmiyor')\n"
}

cmd_start()   { need_root; for s in "\${SERVICES[@]}"; do systemctl start  "\$s"; log "\$s başlatıldı"; done; }
cmd_stop()    { need_root; for s in "\${SERVICES[@]}"; do systemctl stop   "\$s"; warn "\$s durduruldu"; done; }
cmd_restart() { need_root; for s in "\${SERVICES[@]}"; do systemctl restart "\$s"; log "\$s yeniden başlatıldı"; done; }

cmd_logs() {
  local svc="\${2:-marzban-api}"
  case "\$svc" in
    api|marzban-api)    tail -f "\${LOG_DIR}/api.log" ;;
    panel|marzban-panel) tail -f "\${LOG_DIR}/panel.log" ;;
    xray)               journalctl -u xray -f --no-pager ;;
    *)                  journalctl -u "\$svc" -f --no-pager ;;
  esac
}

cmd_update() {
  need_root
  echo -e "\${BOLD}Güncelleme başlıyor...\${NC}"
  cd "\$INSTALL_DIR"

  # Kodu güncelle
  if [[ -d .git ]]; then
    git fetch origin --quiet
    git reset --hard "origin/\$(git branch --show-current)" --quiet
    log "Kod güncellendi"
  else
    warn "Git repo bulunamadı, manuel güncelleme gerekiyor"
    exit 1
  fi

  # Xray güncelle
  local latest_ver
  latest_ver=\$(curl -s "https://api.github.com/repos/XTLS/Xray-core/releases/latest" \
    | grep -oP '"tag_name":\s*"v\K[^"]+' | head -1 || echo "")
  if [[ -n "\$latest_ver" ]]; then
    local arch
    case "\$(uname -m)" in
      x86_64)  arch="linux-64" ;;
      aarch64) arch="linux-arm64-v8a" ;;
      *)       arch="linux-64" ;;
    esac
    wget -q -O /tmp/xray-update.zip \
      "https://github.com/XTLS/Xray-core/releases/download/v\${latest_ver}/Xray-\${arch}.zip"
    cd /tmp && unzip -oq xray-update.zip xray
    install -m 755 xray /usr/local/bin/xray
    rm -f xray-update.zip xray
    cd "\$INSTALL_DIR"
    log "Xray v\${latest_ver} güncellendi"
  fi

  # Bağımlılıklar + build
  pnpm install --frozen-lockfile --silent
  (cd lib/db && npx tsc -p tsconfig.json --quiet 2>/dev/null || true)
  (cd artifacts/marzban-panel && pnpm run build)
  (cd artifacts/api-server && pnpm run build)

  # Servisleri yeniden başlat
  for s in "\${SERVICES[@]}"; do systemctl restart "\$s"; done
  log "Güncelleme tamamlandı. Tüm servisler yeniden başlatıldı."
}

cmd_backup() {
  need_root
  local backup_file="/tmp/marzban_backup_\$(date +%Y%m%d_%H%M%S).sql"
  source "\${CONFIG_DIR}/.env"
  pg_dump "\$DATABASE_URL" > "\$backup_file"
  gzip "\$backup_file"
  log "Yedek alındı: \${backup_file}.gz"
}

cmd_restore() {
  need_root
  local file="\${2:-}"
  [[ -z "\$file" ]] && err "Kullanım: marzban restore <backup.sql.gz>"
  [[ -f "\$file" ]] || err "Dosya bulunamadı: \$file"
  source "\${CONFIG_DIR}/.env"
  warn "Veritabanı geri yüklenecek. Mevcut veriler silinecek!"
  read -p "Devam? (evet/hayır): " c
  [[ "\$c" != "evet" ]] && exit 0
  zcat "\$file" | psql "\$DATABASE_URL"
  log "Geri yükleme tamamlandı"
}

cmd_cli() {
  # Panel CLI terminali (Marzban gibi)
  echo -e "\${BOLD}Marzban CLI Terminal\${NC}"
  echo -e "API: http://127.0.0.1:\${API_PORT}"
  echo ""

  # Token al
  read -p "Admin kullanıcı adı [admin]: " uname; uname="\${uname:-admin}"
  read -sp "Şifre: " pass; echo ""

  local token
  token=\$(curl -sf -X POST "http://127.0.0.1:\${API_PORT}/api/admin/token" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"\$uname\",\"password\":\"\$pass\"}" \
    | grep -oP '"access_token":"\K[^"]+' || echo "")
  [[ -z "\$token" ]] && err "Giriş başarısız"
  log "Giriş başarılı"

  # Komutlar
  while true; do
    echo -ne "\n\${CYAN}marzban>\${NC} "
    read -r cmd args
    case "\$cmd" in
      list-admins)
        curl -sf "http://127.0.0.1:\${API_PORT}/api/admins" \
          -H "Authorization: Bearer \$token" | python3 -m json.tool 2>/dev/null || echo "Hata"
        ;;
      create-admin)
        read -p "  Kullanıcı adı: " u
        read -sp "  Şifre: " p; echo ""
        read -p "  Sudo? (e/H): " s
        [[ "\${s,,}" == "e" ]] && sudo_flag=true || sudo_flag=false
        curl -sf -X POST "http://127.0.0.1:\${API_PORT}/api/admin" \
          -H "Authorization: Bearer \$token" \
          -H "Content-Type: application/json" \
          -d "{\"username\":\"\$u\",\"password\":\"\$p\",\"is_sudo\":\$sudo_flag}" | python3 -m json.tool
        ;;
      change-password)
        read -p "  Kullanıcı adı: " u
        read -sp "  Yeni şifre: " p; echo ""
        curl -sf -X PUT "http://127.0.0.1:\${API_PORT}/api/admin" \
          -H "Authorization: Bearer \$token" \
          -H "Content-Type: application/json" \
          -d "{\"username\":\"\$u\",\"password\":\"\$p\"}" | python3 -m json.tool
        ;;
      delete-admin)
        read -p "  Kullanıcı adı: " u
        curl -sf -X DELETE "http://127.0.0.1:\${API_PORT}/api/admin/\$u" \
          -H "Authorization: Bearer \$token" | python3 -m json.tool
        ;;
      xray-reload)
        curl -sf -X POST "http://127.0.0.1:\${API_PORT}/api/xray/reload" \
          -H "Authorization: Bearer \$token" | python3 -m json.tool
        ;;
      xray-status)
        curl -sf "http://127.0.0.1:\${API_PORT}/api/xray/status" \
          -H "Authorization: Bearer \$token" | python3 -m json.tool
        ;;
      help|"")
        echo "  list-admins    — Admin listesi"
        echo "  create-admin   — Yeni admin"
        echo "  change-password — Şifre değiştir"
        echo "  delete-admin   — Admin sil"
        echo "  xray-reload    — Xray yeniden yükle"
        echo "  xray-status    — Xray durumu"
        echo "  exit           — Çık"
        ;;
      exit|quit|q) break ;;
      *) warn "Bilinmeyen komut. 'help' yazın." ;;
    esac
  done
}

cmd_uninstall() {
  need_root
  warn "MARZBAN PANEL TAMAMEN KALDIRILACAK!"
  read -p "Onaylamak için 'KALDIR' yazın: " c
  [[ "\$c" != "KALDIR" ]] && { echo "İptal"; exit 0; }
  for s in "\${SERVICES[@]}"; do
    systemctl stop "\$s" 2>/dev/null || true
    systemctl disable "\$s" 2>/dev/null || true
    rm -f "/etc/systemd/system/\${s}.service"
  done
  systemctl daemon-reload
  rm -f /etc/nginx/sites-{enabled,available}/marzban
  nginx -t && systemctl reload nginx 2>/dev/null || true
  rm -rf "\$INSTALL_DIR" "\$CONFIG_DIR" "\$LOG_DIR"
  rm -f /usr/local/bin/marzban
  log "Marzban kaldırıldı. Veritabanı manuel silinmeli:"
  echo "  sudo -u postgres psql -c \"DROP DATABASE marzban; DROP USER marzban;\""
}

# ── Komut yönlendirici ────────────────────────────────────────────────────────
CMD="\${1:-help}"
case "\$CMD" in
  status)     cmd_status ;;
  start)      cmd_start ;;
  stop)       cmd_stop ;;
  restart)    cmd_restart ;;
  logs)       cmd_logs "\$@" ;;
  update)     cmd_update ;;
  backup)     cmd_backup ;;
  restore)    cmd_restore "\$@" ;;
  cli)        cmd_cli ;;
  uninstall)  cmd_uninstall ;;
  help|--help|-h)
    echo ""
    echo -e "  \${BOLD}marzban\${NC} — Panel Yönetim Aracı"
    echo ""
    echo "  Kullanım: marzban <komut>"
    echo ""
    echo "  Komutlar:"
    echo "    status      Servis durumlarını göster"
    echo "    start       Tüm servisleri başlat"
    echo "    stop        Tüm servisleri durdur"
    echo "    restart     Tüm servisleri yeniden başlat"
    echo "    logs [svc]  Canlı log (api|panel|xray)"
    echo "    update      GitHub'dan güncelle + rebuild"
    echo "    backup      Veritabanı yedeği al"
    echo "    restore     Yedeği geri yükle <dosya.sql.gz>"
    echo "    cli         Etkileşimli yönetim terminali"
    echo "    uninstall   Paneli tamamen kaldır"
    echo ""
    ;;
  *) err "Bilinmeyen komut: \$CMD. 'marzban help' yazın." ;;
esac
CLISCRIPT

  chmod +x /usr/local/bin/marzban
  log "marzban CLI kuruldu → 'marzban help'"
}

# ── Özet ─────────────────────────────────────────────────────────────────────
print_summary() {
  local server_ip
  server_ip=$(curl -s --max-time 3 ifconfig.me 2>/dev/null \
    || curl -s --max-time 3 api.ipify.org 2>/dev/null \
    || hostname -I | awk '{print $1}')
  local access_url
  if $USE_SSL && [[ -n "$DOMAIN" ]]; then
    access_url="https://${DOMAIN}"
  elif [[ -n "$DOMAIN" ]]; then
    access_url="http://${DOMAIN}"
  else
    access_url="http://${server_ip}"
  fi

  # Kurulum bilgileri kaydet
  mkdir -p "$CONFIG_DIR"
  cat > "${CONFIG_DIR}/install-info.txt" << EOF
Marzban Panel Kurulum Bilgileri
================================
Kurulum tarihi: $(date)
Panel URL: ${access_url}
SSL: ${USE_SSL}
DB Adı: ${DB_NAME}
DB Kullanıcı: ${DB_USER}
DB Şifre: ${DB_PASS}
JWT Secret: ${JWT_SECRET}
API Port: ${API_PORT}
Panel Port: ${PANEL_PORT}
Xray API Port: ${XRAY_API_PORT}
Kurulum dizini: ${INSTALL_DIR}
Yapılandırma: ${CONFIG_DIR}
Loglar: ${LOG_DIR}
EOF
  chmod 600 "${CONFIG_DIR}/install-info.txt"

  echo ""
  echo -e "${GREEN}${BOLD}"
  echo "  ╔════════════════════════════════════════════════════════╗"
  echo "  ║         KURULUM BAŞARIYLA TAMAMLANDI! 🎉              ║"
  echo "  ╚════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  echo -e "  ${CYAN}Panel URL:${NC}      ${BOLD}${access_url}${NC}"
  echo -e "  ${CYAN}Kullanıcı Adı:${NC}  ${BOLD}admin${NC}"
  echo -e "  ${CYAN}Şifre:${NC}          ${BOLD}${ADMIN_PASS}${NC}"
  echo ""
  echo -e "  ${YELLOW}${BOLD}Kurulum bilgileri:${NC} ${CONFIG_DIR}/install-info.txt"
  echo ""
  echo -e "  ${CYAN}${BOLD}Hızlı Komutlar:${NC}"
  echo -e "    marzban status      → Servis durumu"
  echo -e "    marzban logs api    → API logları"
  echo -e "    marzban logs xray   → Xray logları"
  echo -e "    marzban cli         → Yönetim terminali"
  echo -e "    marzban update      → Güncelle"
  echo -e "    marzban restart     → Yeniden başlat"
  echo ""
  echo -e "  ${DIM}Panel ilk açılışta inbound eklemeniz gerekiyor.${NC}"
  echo -e "  ${DIM}Sonra kullanıcı oluşturun ve subscription URL'yi VPN uygulamanıza yapıştırın.${NC}"
  echo ""
}

# ── Ana akış ─────────────────────────────────────────────────────────────────
main() {
  print_banner
  pre_check
  collect_input
  install_system_deps
  install_node
  setup_postgres
  install_xray
  download_project
  write_config
  build_project
  set_admin_password
  setup_nginx
  $USE_SSL && [[ -n "$DOMAIN" ]] && setup_ssl || setup_self_signed
  install_services
  update_admin_password
  setup_firewall
  install_cli
  print_summary
}

main "$@"
