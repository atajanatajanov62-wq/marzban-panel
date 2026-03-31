#!/usr/bin/env bash
# ================================================================
#  Professional X Panel — GitHub Installer
#  Marzban için özel tema + cihaz/konum takip sistemi
#
#  Kullanım:
#    bash <(curl -fsSL https://raw.githubusercontent.com/GITHUB_USER/GITHUB_REPO/main/deploy/install.sh)
#
#  Veya repo klonlandıysa:
#    bash deploy/install.sh
# ================================================================
set -euo pipefail

GITHUB_USER="GITHUB_USER"       # <── kendi GitHub kullanıcı adın
GITHUB_REPO="GITHUB_REPO"       # <── repo adı
GITHUB_BRANCH="main"

INSTALL_DIR="/opt/professional-x-panel"
LOG_FILE="/var/log/px-panel-install.log"

# ── Renkler ───────────────────────────────────────────────
R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'
C='\033[0;36m'; B='\033[1;34m'; NC='\033[0m'
BOLD='\033[1m'

info()    { echo -e "${C}[•]${NC} $*" | tee -a "$LOG_FILE"; }
ok()      { echo -e "${G}[✓]${NC} $*" | tee -a "$LOG_FILE"; }
warn()    { echo -e "${Y}[!]${NC} $*" | tee -a "$LOG_FILE"; }
error()   { echo -e "${R}[✗]${NC} $*" | tee -a "$LOG_FILE"; exit 1; }
step()    { echo -e "\n${B}${BOLD}── $* ──${NC}" | tee -a "$LOG_FILE"; }
has()     { command -v "$1" &>/dev/null; }

# ── Banner ────────────────────────────────────────────────
clear
echo -e "${R}"
cat << 'EOF'
  ██████╗ ██████╗  ██████╗ 
  ██╔══██╗╚════██╗ ╚════██╗
  ██████╔╝ █████╔╝  █████╔╝
  ██╔═══╝  ╚═══██╗ ██╔═══╝ 
  ██║     ██████╔╝ ███████╗
  ╚═╝     ╚═════╝  ╚══════╝
EOF
echo -e "${NC}${BOLD}  Professional X Panel — Marzban Installer${NC}"
echo -e "  Marvel X  •  Ninja X  •  Kombat X\n"
echo "  $(date)" | tee -a "$LOG_FILE"
echo ""

# ── Root kontrolü ─────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  error "Bu script root olarak çalıştırılmalıdır: sudo bash install.sh"
fi

# ── 1. Sistem bağımlılıkları ──────────────────────────────
step "Sistem bağımlılıkları"

if has apt-get; then
  apt-get update -qq && apt-get install -y -qq git curl python3 python3-pip 2>/dev/null
  ok "apt paketleri hazır"
elif has yum; then
  yum install -y -q git curl python3 python3-pip 2>/dev/null
  ok "yum paketleri hazır"
fi

# ── 2. Node.js ────────────────────────────────────────────
step "Node.js & pnpm"

if ! has node || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 18 ]]; then
  info "Node.js 22 kuruluyor..."
  curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir /usr/local/bin --skip-shell 2>/dev/null || true
  export PATH="/usr/local/bin:$PATH"
  if ! has fnm; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - 2>/dev/null
    apt-get install -y nodejs 2>/dev/null || yum install -y nodejs 2>/dev/null
  else
    fnm install 22 && fnm use 22
  fi
fi
ok "Node.js: $(node -v)"

if ! has pnpm; then
  npm install -g pnpm --silent
fi
ok "pnpm: $(pnpm -v)"

# ── 3. Kaynak kodu ────────────────────────────────────────
step "Kaynak kodu"

REPO_URL="https://github.com/${GITHUB_USER}/${GITHUB_REPO}.git"

if [[ -d "$INSTALL_DIR/.git" ]]; then
  info "Mevcut kurulum güncelleniyor..."
  cd "$INSTALL_DIR"
  git pull origin "$GITHUB_BRANCH" | tee -a "$LOG_FILE"
else
  info "Repo klonlanıyor: $REPO_URL"
  git clone --depth=1 --branch "$GITHUB_BRANCH" "$REPO_URL" "$INSTALL_DIR" | tee -a "$LOG_FILE"
  cd "$INSTALL_DIR"
fi
ok "Kaynak kodu hazır: $INSTALL_DIR"

# ── 4. Frontend build ─────────────────────────────────────
step "Frontend build (Professional X Panel)"

cd "$INSTALL_DIR"
info "Bağımlılıklar yükleniyor..."
pnpm install --frozen-lockfile 2>&1 | tail -5 | tee -a "$LOG_FILE"

info "Production build alınıyor..."
cd artifacts/marzban-dashboard
NODE_ENV=production BASE_PATH=/ pnpm build 2>&1 | tee -a "$LOG_FILE"

DIST="$INSTALL_DIR/artifacts/marzban-dashboard/dist/public"
[[ -f "$DIST/index.html" ]] || error "Build başarısız — dist/public/index.html bulunamadı"
ok "Build tamamlandı: $DIST"
cd "$INSTALL_DIR"

# ── 5. Marzban kurulumunu bul ─────────────────────────────
step "Marzban kurulumu"

MARZBAN_TYPE=""
MARZBAN_DASH=""
MARZBAN_APP_DIR=""

# Docker kontrolü
if has docker; then
  CONTAINER=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -i marzban | head -1 || true)
  if [[ -n "$CONTAINER" ]]; then
    MARZBAN_TYPE="docker"
    MARZBAN_DASH=$(docker exec "$CONTAINER" find /app -name "index.html" 2>/dev/null | grep -v node_modules | head -1 || true)
    MARZBAN_DASH=$(dirname "$MARZBAN_DASH")
    MARZBAN_APP_DIR=$(docker exec "$CONTAINER" find /app -name "main.py" 2>/dev/null | head -1 || true)
    MARZBAN_APP_DIR=$(dirname "$MARZBAN_APP_DIR")
    info "Docker container bulundu: $CONTAINER"
  fi
fi

# Bare-metal kontrolü
if [[ -z "$MARZBAN_TYPE" ]]; then
  DASH_IDX=$(find / -path "*/app/dashboard/index.html" -not -path "*/node_modules/*" 2>/dev/null | head -1 || true)
  if [[ -n "$DASH_IDX" ]]; then
    MARZBAN_TYPE="bare"
    MARZBAN_DASH=$(dirname "$DASH_IDX")
    MARZBAN_APP_DIR=$(find / -path "*/app/main.py" -not -path "*/node_modules/*" -not -path "*px-panel*" 2>/dev/null | head -1 | xargs -I{} dirname {} 2>/dev/null || true)
    info "Bare-metal Marzban bulundu: $MARZBAN_DASH"
  fi
fi

# Manuel giriş
if [[ -z "$MARZBAN_TYPE" ]]; then
  warn "Marzban otomatik bulunamadı."
  echo -n "  Dashboard dizini (ör: /opt/marzban/app/dashboard): "
  read -r MARZBAN_DASH
  echo -n "  app/main.py dizini (ör: /opt/marzban/app): "
  read -r MARZBAN_APP_DIR
  MARZBAN_TYPE="bare"
fi

ok "Marzban tipi: ${MARZBAN_TYPE} | Dashboard: ${MARZBAN_DASH}"

# ── 6. Frontend kur ───────────────────────────────────────
step "Frontend kurulumu"

TS=$(date +%Y%m%d-%H%M%S)

if [[ "$MARZBAN_TYPE" == "docker" ]]; then
  info "Docker: yedek alınıyor..."
  docker exec "$CONTAINER" tar -czf "/tmp/dashboard-backup-${TS}.tar.gz" -C "$(dirname "$MARZBAN_DASH")" "$(basename "$MARZBAN_DASH")" 2>/dev/null || warn "Yedekleme atlandı"
  docker cp "$CONTAINER:/tmp/dashboard-backup-${TS}.tar.gz" "/tmp/dashboard-backup-${TS}.tar.gz" 2>/dev/null && ok "Yedek: /tmp/dashboard-backup-${TS}.tar.gz" || true

  info "Eski dosyalar siliniyor..."
  docker exec "$CONTAINER" find "$MARZBAN_DASH" -mindepth 1 -delete 2>/dev/null || true

  info "Yeni dosyalar kopyalanıyor..."
  docker cp "${DIST}/." "${CONTAINER}:${MARZBAN_DASH}/"
  ok "Frontend Docker'a kopyalandı"

elif [[ "$MARZBAN_TYPE" == "bare" ]]; then
  info "Yedek alınıyor → ${MARZBAN_DASH}.backup-${TS}"
  cp -r "$MARZBAN_DASH" "${MARZBAN_DASH}.backup-${TS}"
  ok "Yedek: ${MARZBAN_DASH}.backup-${TS}"

  info "Eski dosyalar siliniyor..."
  find "$MARZBAN_DASH" -mindepth 1 -delete

  info "Yeni dosyalar kopyalanıyor..."
  cp -r "${DIST}/." "${MARZBAN_DASH}/"
  ok "Frontend kopyalandı"
fi

# ── 7. Python backend patch ───────────────────────────────
step "Backend patch (Cihaz & Konum takibi)"

if [[ -n "$MARZBAN_APP_DIR" ]] && [[ -f "${MARZBAN_APP_DIR}/main.py" ]]; then
  info "Python bağımlılıkları kuruluyor..."
  pip3 install httpx --quiet 2>&1 | tail -2 | tee -a "$LOG_FILE"

  PATCH_SRC="$INSTALL_DIR/artifacts/marzban-dashboard/deploy/backend"

  if [[ "$MARZBAN_TYPE" == "docker" ]]; then
    info "px_connections.py → Docker container"
    docker cp "${PATCH_SRC}/px_connections.py" "${CONTAINER}:${MARZBAN_APP_DIR}/px_connections.py"
    # Install httpx inside container
    docker exec "$CONTAINER" pip install httpx --quiet 2>/dev/null || warn "pip httpx container içinde başarısız"
    # Apply patch
    docker cp "${PATCH_SRC}/apply_patch.py" "${CONTAINER}:/tmp/apply_patch.py"
    docker exec "$CONTAINER" python3 /tmp/apply_patch.py --marzban-path "$(dirname "$MARZBAN_APP_DIR")"
  else
    cp "${PATCH_SRC}/px_connections.py" "${MARZBAN_APP_DIR}/px_connections.py"
    ok "px_connections.py → ${MARZBAN_APP_DIR}"
    python3 "${PATCH_SRC}/apply_patch.py" --marzban-path "$(dirname "$MARZBAN_APP_DIR")"
  fi
  ok "Backend patch uygulandı"
else
  warn "app/main.py bulunamadı — backend patch atlandı."
  warn "Manuel olarak apply_patch.py'yi çalıştırabilirsiniz:"
  echo "  python3 ${INSTALL_DIR}/artifacts/marzban-dashboard/deploy/backend/apply_patch.py"
fi

# ── 8. Marzban'ı yeniden başlat ───────────────────────────
step "Marzban yeniden başlatılıyor"

if [[ "$MARZBAN_TYPE" == "docker" ]]; then
  docker restart "$CONTAINER"
  sleep 3
  STATUS=$(docker inspect --format='{{.State.Status}}' "$CONTAINER" 2>/dev/null)
  [[ "$STATUS" == "running" ]] && ok "Container çalışıyor: $CONTAINER" || warn "Container durumu: $STATUS"

elif has systemctl; then
  systemctl restart marzban 2>/dev/null && ok "systemctl restart marzban — OK" || warn "systemctl başarısız"
else
  warn "Marzban'ı manuel yeniden başlatın."
fi

# ── Özet ─────────────────────────────────────────────────
echo ""
echo -e "${G}${BOLD}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${G}${BOLD}║   ✓  Kurulum tamamlandı!                      ║${NC}"
echo -e "${G}${BOLD}╠═══════════════════════════════════════════════╣${NC}"
echo -e "${G}║  Panel adresinizi tarayıcıdan açın.           ║${NC}"
echo -e "${G}║  3 tema: Marvel X • Ninja X • Kombat X        ║${NC}"
echo -e "${G}║  Cihaz & konum takibi: aktif                   ║${NC}"
echo -e "${G}║                                                ║${NC}"
echo -e "${G}║  Log: ${LOG_FILE}${NC}${G}     ║${NC}"
echo -e "${G}${BOLD}╚═══════════════════════════════════════════════╝${NC}"
echo ""
