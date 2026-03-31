"""
Professional X Panel — Connection Tracker v1.0
===============================================
Marzban backend extension:
  - Hooks into /sub/{token} subscription fetches
  - Captures IP + User-Agent for each user
  - Parses device brand/model from User-Agent
  - Does IP geolocation via ip-api.com (free, no key)
  - Exposes GET /api/user/{username}/connections endpoint
  - Uses a SEPARATE SQLite DB (does not touch Marzban's DB)

Install: see deploy/apply_patch.py
"""

import sqlite3
import re
import os
import threading
from typing import Optional

import httpx
from fastapi import APIRouter

# ── Config ────────────────────────────────────────────────
DB_PATH       = os.environ.get("PX_DB_PATH", "/var/lib/marzban/px_connections.db")
MARZBAN_DB    = os.environ.get("SQLALCHEMY_DATABASE_URL", "sqlite:////var/lib/marzban/db.sqlite3")
MAX_GEO_CACHE = 5000
MAX_ROWS_PER_USER = 100   # Keep last N connections per user

# ── Database Setup ────────────────────────────────────────
def _get_conn():
    c = sqlite3.connect(DB_PATH, check_same_thread=False)
    c.row_factory = sqlite3.Row
    return c

def _init_db():
    with _get_conn() as c:
        c.executescript("""
            CREATE TABLE IF NOT EXISTS user_connections (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                username         TEXT NOT NULL,
                ip_address       TEXT DEFAULT '',
                user_agent       TEXT DEFAULT '',
                device_brand     TEXT DEFAULT '',
                device_model     TEXT DEFAULT '',
                device_family    TEXT DEFAULT '',
                os_family        TEXT DEFAULT '',
                os_version       TEXT DEFAULT '',
                client_name      TEXT DEFAULT '',
                client_version   TEXT DEFAULT '',
                country          TEXT DEFAULT '',
                country_code     TEXT DEFAULT '',
                city             TEXT DEFAULT '',
                connection_type  TEXT DEFAULT 'subscription',
                connected_at     TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now'))
            );
            CREATE INDEX IF NOT EXISTS idx_uc_username ON user_connections(username);
            CREATE INDEX IF NOT EXISTS idx_uc_ts      ON user_connections(connected_at DESC);
        """)

_init_db()

# ── Geo Cache ─────────────────────────────────────────────
_geo_cache: dict = {}
_geo_lock = threading.Lock()
_LOCAL_IPS = {"127.0.0.1", "::1", "localhost"}

def _get_geo(ip: str) -> dict:
    if ip in _LOCAL_IPS or ip.startswith("192.168.") or ip.startswith("10."):
        return {"country": "Local", "country_code": "LO", "city": "Local"}
    with _geo_lock:
        if ip in _geo_cache:
            return _geo_cache[ip]
    try:
        r = httpx.get(
            f"http://ip-api.com/json/{ip}",
            params={"fields": "country,countryCode,city,status"},
            timeout=4.0,
        )
        d = r.json()
        geo = (
            {"country": d["country"], "country_code": d["countryCode"], "city": d["city"]}
            if d.get("status") == "success"
            else {"country": "", "country_code": "", "city": ""}
        )
    except Exception:
        geo = {"country": "", "country_code": "", "city": ""}
    with _geo_lock:
        if len(_geo_cache) >= MAX_GEO_CACHE:
            _geo_cache.clear()
        _geo_cache[ip] = geo
    return geo

# ── User-Agent Parser (zero external deps) ───────────────
_VPN_CLIENTS = [
    ("clash meta",  "Clash Meta"),
    ("clashx",      "ClashX"),
    ("clash",       "Clash"),
    ("v2rayng",     "v2rayNG"),
    ("v2rayn",      "v2rayN"),
    ("nekoray",     "Nekoray"),
    ("nekobox",     "Nekobox"),
    ("sing-box",    "Sing-Box"),
    ("singbox",     "Sing-Box"),
    ("hiddify",     "Hiddify"),
    ("streisand",   "Streisand"),
    ("shadowrocket","Shadowrocket"),
    ("quantumultx", "Quantumult X"),
    ("quantumult",  "Quantumult"),
    ("surfboard",   "Surfboard"),
    ("stash",       "Stash"),
    ("loon",        "Loon"),
    ("surge",       "Surge"),
    ("foxray",      "FoXray"),
    ("matsuri",     "Matsuri"),
    ("neko",        "Neko"),
]

_ANDROID_BRANDS = [
    ("samsung",  "Samsung"), ("galaxy",   "Samsung"),
    ("xiaomi",   "Xiaomi"),  ("redmi",    "Xiaomi"),  ("poco",  "Xiaomi"),
    ("huawei",   "Huawei"),  ("honor",    "Honor"),
    ("oppo",     "OPPO"),    ("realme",   "Realme"),  ("vivo",  "Vivo"),
    ("oneplus",  "OnePlus"), ("pixel",    "Google"),
    ("lg ",      "LG"),      ("motorola", "Motorola"),("moto ", "Motorola"),
    ("nokia",    "Nokia"),   ("sony",     "Sony"),    ("asus",  "ASUS"),
    ("lenovo",   "Lenovo"),  ("tcl ",     "TCL"),     ("htc ",  "HTC"),
    ("infinix",  "Infinix"), ("tecno",    "Tecno"),   ("itel ", "iTel"),
]

_WIN_NT = {"10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7", "6.0": "Vista"}

def _parse_ua(ua: str) -> dict:
    ual = ua.lower()

    # ── VPN client ───────────────────────────────────────
    client_name = ""
    client_version = ""
    for pattern, name in _VPN_CLIENTS:
        if pattern in ual:
            client_name = name
            m = re.search(re.escape(pattern) + r"[/\s]+([\d.]+)", ual)
            if m:
                client_version = m.group(1)
            break

    # ── OS / Device ──────────────────────────────────────
    os_family = os_version = device_brand = device_model = device_family = ""

    if "android" in ual:
        os_family = "Android"
        m = re.search(r"android\s*([\d.]+)", ual)
        os_version = m.group(1) if m else ""
        for kw, brand in _ANDROID_BRANDS:
            if kw in ual:
                device_brand = brand
                break
        device_brand = device_brand or "Android"
        device_family = "Phone"
        # Model extraction: "Samsung Galaxy S24" style
        m = re.search(r";\s*([^;)]{3,40})\s+build", ua, re.IGNORECASE)
        if m:
            raw = m.group(1).strip()
            if not raw.lower().startswith("android") and len(raw) < 35:
                device_model = raw

    elif "iphone" in ual:
        os_family = "iOS"
        device_brand = "Apple"
        device_family = "iPhone"
        device_model = "iPhone"
        m = re.search(r"cpu iphone os ([\d_]+)", ual)
        os_version = m.group(1).replace("_", ".") if m else ""

    elif "ipad" in ual:
        os_family = "iPadOS"
        device_brand = "Apple"
        device_family = "iPad"
        device_model = "iPad"

    elif "macintosh" in ual or "mac os x" in ual:
        os_family = "macOS"
        device_brand = "Apple"
        device_family = "Desktop"
        device_model = "Mac"
        m = re.search(r"mac os x ([\d_]+)", ual)
        os_version = m.group(1).replace("_", ".") if m else ""

    elif "windows" in ual:
        os_family = "Windows"
        device_brand = "PC"
        device_family = "Desktop"
        device_model = "PC"
        m = re.search(r"windows nt ([\d.]+)", ual)
        os_version = _WIN_NT.get(m.group(1), m.group(1)) if m else ""

    elif "linux" in ual:
        os_family = "Linux"
        device_brand = "PC"
        device_family = "Desktop"
        device_model = "PC"

    device_model = device_model or device_family or "Unknown"

    return {
        "device_brand":   device_brand,
        "device_model":   device_model,
        "device_family":  device_family,
        "os_family":      os_family,
        "os_version":     os_version,
        "client_name":    client_name,
        "client_version": client_version,
    }

# ── Log Helper ────────────────────────────────────────────
def _log_connection(username: str, ip: str, ua: str, ctype: str = "subscription"):
    """Non-blocking: parses UA + fetches geo, then writes to DB."""
    def _work():
        info = _parse_ua(ua)
        geo  = _get_geo(ip)
        try:
            with _get_conn() as c:
                c.execute("""
                    INSERT INTO user_connections
                        (username, ip_address, user_agent,
                         device_brand, device_model, device_family,
                         os_family, os_version, client_name, client_version,
                         country, country_code, city, connection_type)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """, (
                    username, ip, ua,
                    info["device_brand"], info["device_model"], info["device_family"],
                    info["os_family"],    info["os_version"],
                    info["client_name"],  info["client_version"],
                    geo["country"], geo["country_code"], geo["city"],
                    ctype,
                ))
                # Prune old rows for this user
                c.execute("""
                    DELETE FROM user_connections
                    WHERE username = ?
                      AND id NOT IN (
                        SELECT id FROM user_connections
                        WHERE username = ?
                        ORDER BY id DESC
                        LIMIT ?
                      )
                """, (username, username, MAX_ROWS_PER_USER))
        except Exception:
            pass

    threading.Thread(target=_work, daemon=True).start()

# ── Subscription Token → Username ────────────────────────
def _resolve_token(token: str) -> Optional[str]:
    """Look up a Marzban subscription token in Marzban's own DB."""
    db_path = MARZBAN_DB.replace("sqlite:///", "")
    if not os.path.exists(db_path):
        return None
    try:
        with sqlite3.connect(db_path) as c:
            row = c.execute(
                "SELECT username FROM users WHERE subscription_url_prefix = ?",
                (token,)
            ).fetchone()
            return row[0] if row else None
    except Exception:
        return None

# ── Starlette Middleware ──────────────────────────────────
class PXConnectionMiddleware:
    """
    Intercepts GET /sub/{token} requests and logs connection events.
    Add to Marzban's FastAPI app as:
        app.add_middleware(PXConnectionMiddleware)
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            path: str = scope.get("path", "")
            if "/sub/" in path:
                headers = dict(scope.get("headers", []))
                ip = (
                    headers.get(b"x-forwarded-for", b"").decode().split(",")[0].strip()
                    or headers.get(b"x-real-ip", b"").decode().strip()
                    or (scope.get("client") or ("", 0))[0]
                    or ""
                )
                ua    = headers.get(b"user-agent", b"").decode()
                token = path.split("/sub/")[-1].rstrip("/").split("?")[0]
                if token and ip and ua:
                    def _bg(t=token, i=ip, u=ua):
                        username = _resolve_token(t)
                        if username:
                            _log_connection(username, i, u)
                    threading.Thread(target=_bg, daemon=True).start()

        await self.app(scope, receive, send)

# ── FastAPI Router ────────────────────────────────────────
router = APIRouter(tags=["px-connections"])

_FLAG = {
    "TR":"🇹🇷","US":"🇺🇸","DE":"🇩🇪","GB":"🇬🇧","FR":"🇫🇷","NL":"🇳🇱",
    "JP":"🇯🇵","KR":"🇰🇷","RU":"🇷🇺","CN":"🇨🇳","AE":"🇦🇪","CA":"🇨🇦",
    "AU":"🇦🇺","SG":"🇸🇬","PL":"🇵🇱","AT":"🇦🇹","CH":"🇨🇭","FI":"🇫🇮",
    "SE":"🇸🇪","NO":"🇳🇴","IR":"🇮🇷","IQ":"🇮🇶","SA":"🇸🇦","IT":"🇮🇹",
    "ES":"🇪🇸","BR":"🇧🇷","MX":"🇲🇽","UA":"🇺🇦","PK":"🇵🇰","IN":"🇮🇳",
    "LO":"🏠",
}
_EMOJI = {
    "Apple":"🍎","Samsung":"📱","Xiaomi":"📱","Huawei":"📱","Honor":"📱",
    "OPPO":"📱","Realme":"📱","Vivo":"📱","OnePlus":"📱","Google":"📱",
    "LG":"📱","Motorola":"📱","Nokia":"📱","Sony":"📱","ASUS":"📱",
    "PC":"💻","Android":"📱",
}

@router.get("/api/user/{username}/connections")
async def get_user_connections(username: str, limit: int = 20):
    """Return the most recent connections for a Marzban user."""
    with _get_conn() as c:
        rows = c.execute("""
            SELECT * FROM user_connections
            WHERE username = ?
            ORDER BY id DESC
            LIMIT ?
        """, (username, min(limit, 100))).fetchall()

    result = []
    for row in rows:
        r = dict(row)
        cc = r.get("country_code", "")
        brand = r.get("device_brand", "")
        result.append({
            "id":              r["id"],
            "ip_address":      r.get("ip_address", ""),
            "device_brand":    brand,
            "device_model":    r.get("device_model", ""),
            "device_family":   r.get("device_family", ""),
            "os_family":       r.get("os_family", ""),
            "os_version":      r.get("os_version", ""),
            "client_name":     r.get("client_name", ""),
            "client_version":  r.get("client_version", ""),
            "country":         r.get("country", ""),
            "country_code":    cc,
            "city":            r.get("city", ""),
            "flag":            _FLAG.get(cc, "🌍"),
            "device_emoji":    _EMOJI.get(brand, "📱"),
            "connected_at":    r.get("connected_at", ""),
            "connection_type": r.get("connection_type", "subscription"),
            "is_active":       False,
        })

    return {"connections": result, "total": len(result)}
