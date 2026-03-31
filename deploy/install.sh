#!/usr/bin/env bash
# ================================================================
#  Professional X Panel — Installer
#  Marzban için özel tema + cihaz/konum takip sistemi
#
#  Kullanım (curl):
#    bash <(curl -fsSL https://raw.githubusercontent.com/atajanatajanov62-wq/marzban-panel/main/deploy/install.sh)
#
#  Kullanım (wget — curl yoksa):
#    bash <(wget -qO- https://raw.githubusercontent.com/atajanatajanov62-wq/marzban-panel/main/deploy/install.sh)
#
#  Veya repo klonlandıysa:
#    bash deploy/install.sh
# ================================================================
set -euo pipefail

GITHUB_USER="atajanatajanov62-wq"
GITHUB_REPO="marzban-panel"
GITHUB_BRANCH="main"
REPO_URL="https://github.com/${GITHUB_USER}/${GITHUB_REPO}.git"

INSTALL_DIR="/opt/professional-x-panel"
LOG_FILE="/var/log/px-panel-install.log"
touch "$LOG_FILE" 2>/dev/null || LOG_FILE="/tmp/px-panel-install.log"

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
clear 2>/dev/null || true
echo -e "${R}"
cat << 'EOF'
  ██████╗ ██╗  ██╗
  ██╔══██╗╚██╗██╔╝
  ██████╔╝ ╚███╔╝
  ██╔═══╝  ██╔██╗
  ██║     ██╔╝ ██╗
  ╚═╝     ╚═╝  ╚═╝  PANEL
EOF
echo -e "${NC}${BOLD}  Professional X Panel — Marzban Installer${NC}"
echo -e "  Marvel X  •  Ninja X  •  Kombat X"
echo ""
echo "  Başlangıç: $(date)" | tee -a "$LOG_FILE"
echo ""

# ── Root kontrolü ─────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  error "Bu script root olarak çalıştırılmalıdır.\n  Önce: sudo -i\n  Sonra tekrar çalıştır."
fi

# ── 1. Sistem bağımlılıkları ──────────────────────────────
step "1/8 — Sistem bağımlılıkları"

# Paket yöneticisini tespit et
if has apt-get; then
  PKG="apt-get"
  apt-get update -qq 2>/dev/null | tail -1
  INSTALL_CMD="apt-get install -y -qq"
elif has yum; then
  PKG="yum"
  INSTALL_CMD="yum install -y -q"
elif has dnf; then
  PKG="dnf"
  INSTALL_CMD="dnf install -y -q"
else
  warn "Paket yöneticisi bulunamadı. Bağımlılıkları manuel kontrol edin."
  INSTALL_CMD=""
fi

# curl yoksa kur (wget ile script çalıştırıldıysa)
if ! has curl && [[ -n "$INSTALL_CMD" ]]; then
  info "curl kuruluyor..."
  $INSTALL_CMD curl 2>/dev/null && ok "curl kuruldu" || warn "curl kurulamadı, wget ile devam edilecek"
fi

# wget yoksa kur
if ! has wget && [[ -n "$INSTALL_CMD" ]]; then
  info "wget kuruluyor..."
  $INSTALL_CMD wget 2>/dev/null && ok "wget kuruldu" || true
fi

# Temel araçlar
for PKG_NAME in git python3 python3-pip tar; do
  if ! has "$PKG_NAME" && [[ -n "$INSTALL_CMD" ]]; then
    info "$PKG_NAME kuruluyor..."
    $INSTALL_CMD "$PKG_NAME" 2>/dev/null && ok "$PKG_NAME kuruldu" || warn "$PKG_NAME kurulamadı"
  fi
done

ok "Sistem bağımlılıkları hazır"

# ── 1b. Swap (RAM yetersizse) ──────────────────────────────
TOTAL_MEM=$(free -m 2>/dev/null | awk '/^Mem:/{print $2}' || echo "2048")
SWAP_NOW=$(free -m 2>/dev/null | awk '/^Swap:/{print $2}' || echo "0")
if [[ "$TOTAL_MEM" -lt 1500 && "$SWAP_NOW" -lt 512 ]]; then
  step "1b/8 — Swap alanı oluşturuluyor (RAM: ${TOTAL_MEM}MB)"
  SWAP_FILE="/swapfile-px"
  if [[ ! -f "$SWAP_FILE" ]]; then
    info "2GB swap dosyası oluşturuluyor..."
    dd if=/dev/zero of="$SWAP_FILE" bs=1M count=2048 status=none && \
      chmod 600 "$SWAP_FILE" && mkswap "$SWAP_FILE" -q && swapon "$SWAP_FILE" && \
      ok "Swap etkinleştirildi: 2GB" || warn "Swap oluşturulamadı (devam ediliyor)"
  else
    swapon "$SWAP_FILE" 2>/dev/null && ok "Mevcut swap etkinleştirildi" || true
  fi
fi

# ── 2. Node.js ────────────────────────────────────────────
step "2/8 — Node.js & pnpm"

install_nodejs() {
  info "Node.js 22 kuruluyor..."
  # Yöntem 1: NodeSource (Debian/Ubuntu)
  if has apt-get; then
    curl -fsSL https://deb.nodesource.com/setup_22.x 2>/dev/null | bash - || \
    wget -qO- https://deb.nodesource.com/setup_22.x 2>/dev/null | bash - || true
    apt-get install -y nodejs 2>/dev/null && return 0
  fi
  # Yöntem 2: NVM (evrensel)
  export NVM_DIR="/root/.nvm"
  if has curl; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash 2>/dev/null || true
  else
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash 2>/dev/null || true
  fi
  [[ -s "$NVM_DIR/nvm.sh" ]] && source "$NVM_DIR/nvm.sh" && nvm install 22 && nvm use 22 && return 0
  return 1
}

NODE_OK=0
if has node; then
  VER=$(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v' || echo "0")
  if [[ "$VER" -ge 18 ]]; then
    NODE_OK=1
    ok "Node.js zaten kurulu: $(node -v)"
  fi
fi

if [[ $NODE_OK -eq 0 ]]; then
  install_nodejs && NODE_OK=1 || true
  # NVM source
  [[ -s "/root/.nvm/nvm.sh" ]] && source "/root/.nvm/nvm.sh" || true
  has node && ok "Node.js kuruldu: $(node -v)" || error "Node.js kurulamadı. Lütfen manuel kurun: https://nodejs.org"
fi

if ! has pnpm; then
  info "pnpm kuruluyor..."
  npm install -g pnpm --silent && ok "pnpm: $(pnpm -v)"
else
  ok "pnpm: $(pnpm -v)"
fi

# ── 3. Kaynak kodu ────────────────────────────────────────
step "3/8 — Kaynak kodu indiriliyor"

if [[ -d "$INSTALL_DIR/.git" ]]; then
  info "Mevcut kurulum güncelleniyor: $INSTALL_DIR"
  cd "$INSTALL_DIR"
  git pull origin "$GITHUB_BRANCH" 2>&1 | tail -3 | tee -a "$LOG_FILE"
else
  info "Repo klonlanıyor..."
  git clone --depth=1 --branch "$GITHUB_BRANCH" "$REPO_URL" "$INSTALL_DIR" 2>&1 | tail -3 | tee -a "$LOG_FILE"
fi

ok "Kaynak kodu: $INSTALL_DIR"

# ── 4. Frontend dosyaları (hazır build — build gerekmez) ──
step "4/8 — Frontend dosyaları indiriliyor (Node.js build gerekmez)"

DASH_SRC="$INSTALL_DIR/artifacts/marzban-dashboard"
DIST="$DASH_SRC/dist/public"
BASE_RAW="https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/deploy/dist"

mkdir -p "$DIST"

_dl() {
  local url="$1" dest="$2"
  if has curl; then
    curl -fsSL "$url" -o "$dest" || error "İndirme başarısız: $url"
  elif has wget; then
    wget -qO "$dest" "$url" || error "İndirme başarısız: $url"
  else
    python3 -c "import urllib.request; urllib.request.urlretrieve('$url','$dest')" || error "İndirme başarısız: $url"
  fi
}

info "Hazır build parçaları indiriliyor..."
_dl "${BASE_RAW}/part1.b64" /tmp/px_p1.b64
_dl "${BASE_RAW}/part2.b64" /tmp/px_p2.b64
_dl "${BASE_RAW}/part3.b64" /tmp/px_p3.b64
ok "Parçalar indirildi"

info "Birleştiriliyor ve çıkartılıyor..."
cat /tmp/px_p1.b64 /tmp/px_p2.b64 /tmp/px_p3.b64 | base64 -d > /tmp/px_dist.tar.gz
tar -xzf /tmp/px_dist.tar.gz -C "$DIST"
rm -f /tmp/px_p*.b64 /tmp/px_dist.tar.gz

[[ -f "$DIST/index.html" ]] || error "Çıkartma başarısız! Log: $LOG_FILE"
ok "Frontend hazır → $DIST"
cd "$INSTALL_DIR"

# ── 5. Marzban kurulumunu bul ─────────────────────────────
step "5/8 — Marzban kurulumu tespit ediliyor"

MARZBAN_TYPE=""
MARZBAN_DASH=""
MARZBAN_APP_DIR=""

# Docker
if has docker; then
  CONTAINER=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -i marzban | head -1 || true)
  if [[ -n "$CONTAINER" ]]; then
    MARZBAN_TYPE="docker"
    _IDX=$(docker exec "$CONTAINER" find /app -name "index.html" 2>/dev/null | grep -v node_modules | head -1 || true)
    MARZBAN_DASH=$(docker exec "$CONTAINER" dirname "$_IDX" 2>/dev/null || true)
    _MAIN=$(docker exec "$CONTAINER" find /app -name "main.py" 2>/dev/null | grep -v __pycache__ | head -1 || true)
    MARZBAN_APP_DIR=$(docker exec "$CONTAINER" dirname "$_MAIN" 2>/dev/null || true)
    ok "Docker container: $CONTAINER | Dashboard: $MARZBAN_DASH"
  fi
fi

# Bare-metal
if [[ -z "$MARZBAN_TYPE" ]]; then
  _IDX=$(find / -path "*/app/dashboard/index.html" -not -path "*/node_modules/*" -not -path "*px-panel*" 2>/dev/null | head -1 || true)
  if [[ -n "$_IDX" ]]; then
    MARZBAN_TYPE="bare"
    MARZBAN_DASH=$(dirname "$_IDX")
    _MAIN=$(find / -path "*/app/main.py" -not -path "*/node_modules/*" -not -path "*px-panel*" 2>/dev/null | head -1 || true)
    MARZBAN_APP_DIR=$(dirname "$_MAIN" 2>/dev/null || true)
    ok "Bare-metal: $MARZBAN_DASH"
  fi
fi

# Manuel giriş
if [[ -z "$MARZBAN_TYPE" ]]; then
  warn "Marzban otomatik bulunamadı."
  echo ""
  echo -e "  ${Y}Marzban dashboard dizini nerede?${NC}"
  echo    "  (ör: /opt/marzban/app/dashboard veya /usr/local/lib/python3.11/dist-packages/app/dashboard)"
  echo -n "  > "
  read -r MARZBAN_DASH
  echo -e "\n  ${Y}app/main.py dizini nerede?${NC}"
  echo    "  (ör: /opt/marzban/app veya /usr/local/lib/python3.11/dist-packages/app)"
  echo -n "  > "
  read -r MARZBAN_APP_DIR
  MARZBAN_TYPE="bare"
fi

# ── 6. Frontend yükle ─────────────────────────────────────
step "6/8 — Frontend kurulumu"

TS=$(date +%Y%m%d-%H%M%S)

if [[ "$MARZBAN_TYPE" == "docker" ]]; then
  info "Yedek alınıyor..."
  docker exec "$CONTAINER" tar -czf "/tmp/dashboard-backup-${TS}.tar.gz" \
    -C "$(dirname "$MARZBAN_DASH")" "$(basename "$MARZBAN_DASH")" 2>/dev/null \
    && docker cp "$CONTAINER:/tmp/dashboard-backup-${TS}.tar.gz" "/tmp/dashboard-backup-${TS}.tar.gz" \
    && ok "Yedek: /tmp/dashboard-backup-${TS}.tar.gz" || warn "Yedekleme atlandı"

  info "Eski dosyalar temizleniyor..."
  docker exec "$CONTAINER" sh -c "find '${MARZBAN_DASH}' -mindepth 1 -delete" 2>/dev/null || true

  info "Yeni dosyalar kopyalanıyor..."
  docker cp "${DIST}/." "${CONTAINER}:${MARZBAN_DASH}/"
  ok "Frontend Docker'a kopyalandı ✓"

else
  [[ -d "$MARZBAN_DASH" ]] || error "Dizin bulunamadı: $MARZBAN_DASH"

  info "Yedek alınıyor → ${MARZBAN_DASH}.backup-${TS}"
  cp -r "$MARZBAN_DASH" "${MARZBAN_DASH}.backup-${TS}"
  ok "Yedek: ${MARZBAN_DASH}.backup-${TS}"

  info "Eski dosyalar temizleniyor..."
  find "$MARZBAN_DASH" -mindepth 1 -delete

  info "Yeni dosyalar kopyalanıyor..."
  cp -r "${DIST}/." "${MARZBAN_DASH}/"
  ok "Frontend kopyalandı ✓"
fi

# ── 7. Python backend patch ───────────────────────────────
step "7/8 — Backend patch (Cihaz & Konum takibi)"

PATCH_SRC="$INSTALL_DIR/artifacts/marzban-dashboard/deploy/backend"

_apply_bare_patch() {
  local app_dir="$1"
  [[ -f "${app_dir}/main.py" ]] || { warn "main.py bulunamadı: ${app_dir}"; return 1; }
  info "Python bağımlılığı httpx kuruluyor..."
  pip3 install httpx --quiet 2>&1 | tail -2 | tee -a "$LOG_FILE"
  cp "${PATCH_SRC}/px_connections.py" "${app_dir}/px_connections.py"
  ok "px_connections.py → ${app_dir}"
  python3 "${PATCH_SRC}/apply_patch.py" --marzban-path "$(dirname "$app_dir")" 2>&1 | tee -a "$LOG_FILE"
}

if [[ "$MARZBAN_TYPE" == "docker" ]] && [[ -n "$MARZBAN_APP_DIR" ]]; then
  info "Docker: Python bağımlılığı kuruluyor..."
  docker exec "$CONTAINER" pip install httpx --quiet 2>/dev/null | tail -1 || warn "httpx container içinde kurulamadı"

  info "px_connections.py container'a kopyalanıyor..."
  docker cp "${PATCH_SRC}/px_connections.py" "${CONTAINER}:${MARZBAN_APP_DIR}/px_connections.py"
  docker cp "${PATCH_SRC}/apply_patch.py"    "${CONTAINER}:/tmp/apply_patch.py"

  MARZBAN_ROOT=$(docker exec "$CONTAINER" dirname "$MARZBAN_APP_DIR" 2>/dev/null || echo "/app")
  docker exec "$CONTAINER" python3 /tmp/apply_patch.py --marzban-path "$MARZBAN_ROOT" 2>&1 | tee -a "$LOG_FILE"
  ok "Backend patch uygulandı ✓"

elif [[ "$MARZBAN_TYPE" == "bare" ]] && [[ -n "$MARZBAN_APP_DIR" ]]; then
  _apply_bare_patch "$MARZBAN_APP_DIR" && ok "Backend patch uygulandı ✓" || warn "Backend patch atlandı"
else
  warn "Backend patch atlandı (app dizini bulunamadı)"
  echo "  Manuel uygulama için:"
  echo "  python3 ${PATCH_SRC}/apply_patch.py"
fi

# ── 8. Yeniden başlat ────────────────────────────────────
step "8/8 — Marzban yeniden başlatılıyor"

if [[ "$MARZBAN_TYPE" == "docker" ]]; then
  docker restart "$CONTAINER" 2>&1 | tee -a "$LOG_FILE"
  sleep 4
  STATUS=$(docker inspect --format='{{.State.Status}}' "$CONTAINER" 2>/dev/null || echo "unknown")
  [[ "$STATUS" == "running" ]] && ok "Container çalışıyor ✓" || warn "Container durumu: $STATUS"

elif has systemctl; then
  systemctl restart marzban 2>/dev/null \
    && ok "marzban servisi yeniden başlatıldı ✓" \
    || warn "systemctl restart başarısız — lütfen manuel olarak yeniden başlatın"
else
  warn "Lütfen Marzban'ı manuel olarak yeniden başlatın."
fi

# ── Özet ──────────────────────────────────────────────────
echo ""
echo -e "${G}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${G}${BOLD}║   ✓  Kurulum başarıyla tamamlandı!               ║${NC}"
echo -e "${G}${BOLD}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${G}║                                                  ║${NC}"
echo -e "${G}║  ► Panel adresinizi tarayıcıdan açın.            ║${NC}"
echo -e "${G}║  ► Sağ üstten tema seçin:                        ║${NC}"
echo -e "${G}║    ★ Marvel X  |  🐢 Ninja X  |  ⚔ Kombat X    ║${NC}"
echo -e "${G}║  ► Kullanıcı satırında cihaz/konum görünür.      ║${NC}"
echo -e "${G}║                                                  ║${NC}"
echo -e "${G}║  Log dosyası: ${LOG_FILE}${NC}"
echo -e "${G}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo ""
