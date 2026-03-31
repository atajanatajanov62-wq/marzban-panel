import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "http";

const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token";

const now = () => Math.floor(Date.now() / 1000);
const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

const MOCK_USERS = [
  {
    username: "ali_veli",
    proxies: { vmess: { id: "uuid-1" }, vless: { id: "uuid-2" } },
    inbounds: { vmess: ["VMESS TCP"], vless: ["VLESS WS TLS"] },
    expire: now() + 60 * 60 * 24 * 30,
    data_limit: 10737418240,
    data_limit_reset_strategy: "no_reset",
    status: "active",
    used_traffic: 3221225472,
    lifetime_used_traffic: 5368709120,
    created_at: "2026-01-15T10:00:00",
    online_at: minutesAgo(3),
    links: [],
    subscription_url: "/sub/ali_veli/fake-sub-token",
    excluded_inbounds: {},
    note: "Test kullanıcısı",
    on_hold_timeout: null,
    on_hold_expire_duration: null,
    last_connection: {
      ip: "195.175.39.45",
      country: "Türkiye",
      city: "İstanbul",
      flag: "🇹🇷",
      device_brand: "Apple",
      device_model: "iPhone 14 Pro",
      device_os: "iOS",
      device_os_version: "17.2",
      client_name: "Happ",
      client_version: "1.2.0",
      connected_at: minutesAgo(3),
    },
  },
  {
    username: "mehmet_demir",
    proxies: { trojan: { password: "pass-123" } },
    inbounds: { trojan: ["Trojan TCP"] },
    expire: now() + 60 * 60 * 24 * 7,
    data_limit: 5368709120,
    data_limit_reset_strategy: "month",
    status: "active",
    used_traffic: 1073741824,
    lifetime_used_traffic: 2147483648,
    created_at: "2026-02-01T08:30:00",
    online_at: minutesAgo(25),
    links: [],
    subscription_url: "/sub/mehmet_demir/fake-sub-token",
    excluded_inbounds: {},
    note: "",
    on_hold_timeout: null,
    on_hold_expire_duration: null,
    last_connection: {
      ip: "37.246.96.200",
      country: "Türkiye",
      city: "Ankara",
      flag: "🇹🇷",
      device_brand: "Samsung",
      device_model: "Galaxy S24",
      device_os: "Android",
      device_os_version: "14",
      client_name: "V2RayNG",
      client_version: "1.8.15",
      connected_at: minutesAgo(25),
    },
  },
  {
    username: "fatma_kaya",
    proxies: { shadowsocks: { password: "ss-pass", method: "chacha20-ietf-poly1305" } },
    inbounds: { shadowsocks: ["Shadowsocks"] },
    expire: now() - 60 * 60 * 24 * 2,
    data_limit: 0,
    data_limit_reset_strategy: "no_reset",
    status: "expired",
    used_traffic: 2684354560,
    lifetime_used_traffic: 2684354560,
    created_at: "2025-12-01T12:00:00",
    online_at: minutesAgo(60 * 48),
    links: [],
    subscription_url: "/sub/fatma_kaya/fake-sub-token",
    excluded_inbounds: {},
    note: "Süresi doldu",
    on_hold_timeout: null,
    on_hold_expire_duration: null,
    last_connection: {
      ip: "94.55.210.133",
      country: "Türkiye",
      city: "İzmir",
      flag: "🇹🇷",
      device_brand: "Huawei",
      device_model: "P30 Pro",
      device_os: "Android",
      device_os_version: "10",
      client_name: "V2RayNG",
      client_version: "1.7.1",
      connected_at: minutesAgo(60 * 48),
    },
  },
  {
    username: "ahmet_yilmaz",
    proxies: { vmess: { id: "uuid-4" } },
    inbounds: { vmess: ["VMESS WS"] },
    expire: null,
    data_limit: 21474836480,
    data_limit_reset_strategy: "year",
    status: "active",
    used_traffic: 8589934592,
    lifetime_used_traffic: 15032385536,
    created_at: "2025-10-10T09:00:00",
    online_at: minutesAgo(8),
    links: [],
    subscription_url: "/sub/ahmet_yilmaz/fake-sub-token",
    excluded_inbounds: {},
    note: "Premium kullanıcı",
    on_hold_timeout: null,
    on_hold_expire_duration: null,
    last_connection: {
      ip: "185.86.151.22",
      country: "İngiltere",
      city: "Londra",
      flag: "🇬🇧",
      device_brand: "Apple",
      device_model: "iPhone 15 Pro Max",
      device_os: "iOS",
      device_os_version: "17.3",
      client_name: "Shadowrocket",
      client_version: "2.2.35",
      connected_at: minutesAgo(8),
    },
  },
  {
    username: "zeynep_arslan",
    proxies: { vless: { id: "uuid-5" } },
    inbounds: { vless: ["VLESS REALITY"] },
    expire: now() + 60 * 60 * 24 * 90,
    data_limit: 53687091200,
    data_limit_reset_strategy: "no_reset",
    status: "disabled",
    used_traffic: 0,
    lifetime_used_traffic: 0,
    created_at: "2026-03-20T15:00:00",
    online_at: null,
    links: [],
    subscription_url: "/sub/zeynep_arslan/fake-sub-token",
    excluded_inbounds: {},
    note: "Devre dışı",
    on_hold_timeout: null,
    on_hold_expire_duration: null,
    last_connection: null,
  },
];

type Connection = {
  id: string;
  ip: string;
  country: string;
  city: string;
  flag: string;
  device_brand: string;
  device_model: string;
  device_os: string;
  device_os_version: string;
  client_name: string;
  client_version: string;
  connected_at: string;
  is_current: boolean;
};

const MOCK_CONNECTIONS: Record<string, Connection[]> = {
  ali_veli: [
    {
      id: "c1",
      ip: "195.175.39.45",
      country: "Türkiye",
      city: "İstanbul",
      flag: "🇹🇷",
      device_brand: "Apple",
      device_model: "iPhone 14 Pro",
      device_os: "iOS",
      device_os_version: "17.2",
      client_name: "Happ",
      client_version: "1.2.0",
      connected_at: minutesAgo(3),
      is_current: true,
    },
    {
      id: "c2",
      ip: "195.175.40.18",
      country: "Türkiye",
      city: "İstanbul",
      flag: "🇹🇷",
      device_brand: "Apple",
      device_model: "MacBook Pro",
      device_os: "macOS",
      device_os_version: "14.2",
      client_name: "Clash",
      client_version: "1.18.0",
      connected_at: minutesAgo(60 * 2),
      is_current: false,
    },
    {
      id: "c3",
      ip: "195.175.42.100",
      country: "Türkiye",
      city: "İstanbul",
      flag: "🇹🇷",
      device_brand: "Apple",
      device_model: "iPad Pro",
      device_os: "iPadOS",
      device_os_version: "17.1",
      client_name: "Shadowrocket",
      client_version: "2.2.30",
      connected_at: minutesAgo(60 * 24),
      is_current: false,
    },
  ],
  mehmet_demir: [
    {
      id: "c4",
      ip: "37.246.96.200",
      country: "Türkiye",
      city: "Ankara",
      flag: "🇹🇷",
      device_brand: "Samsung",
      device_model: "Galaxy S24",
      device_os: "Android",
      device_os_version: "14",
      client_name: "V2RayNG",
      client_version: "1.8.15",
      connected_at: minutesAgo(25),
      is_current: true,
    },
    {
      id: "c5",
      ip: "37.246.97.45",
      country: "Türkiye",
      city: "Ankara",
      flag: "🇹🇷",
      device_brand: "Windows",
      device_model: "Desktop PC",
      device_os: "Windows",
      device_os_version: "11",
      client_name: "Clash",
      client_version: "1.17.0",
      connected_at: minutesAgo(60 * 5),
      is_current: false,
    },
  ],
  fatma_kaya: [
    {
      id: "c6",
      ip: "94.55.210.133",
      country: "Türkiye",
      city: "İzmir",
      flag: "🇹🇷",
      device_brand: "Huawei",
      device_model: "P30 Pro",
      device_os: "Android",
      device_os_version: "10",
      client_name: "V2RayNG",
      client_version: "1.7.1",
      connected_at: minutesAgo(60 * 48),
      is_current: false,
    },
  ],
  ahmet_yilmaz: [
    {
      id: "c7",
      ip: "185.86.151.22",
      country: "İngiltere",
      city: "Londra",
      flag: "🇬🇧",
      device_brand: "Apple",
      device_model: "iPhone 15 Pro Max",
      device_os: "iOS",
      device_os_version: "17.3",
      client_name: "Shadowrocket",
      client_version: "2.2.35",
      connected_at: minutesAgo(8),
      is_current: true,
    },
    {
      id: "c8",
      ip: "185.213.44.90",
      country: "Almanya",
      city: "Frankfurt",
      flag: "🇩🇪",
      device_brand: "Apple",
      device_model: "MacBook Air",
      device_os: "macOS",
      device_os_version: "14.3",
      client_name: "Clash",
      client_version: "1.18.1",
      connected_at: minutesAgo(60 * 26),
      is_current: false,
    },
    {
      id: "c9",
      ip: "212.58.100.14",
      country: "BAE",
      city: "Dubai",
      flag: "🇦🇪",
      device_brand: "Apple",
      device_model: "iPhone 15 Pro Max",
      device_os: "iOS",
      device_os_version: "17.3",
      client_name: "Shadowrocket",
      client_version: "2.2.35",
      connected_at: minutesAgo(60 * 72),
      is_current: false,
    },
  ],
  zeynep_arslan: [],
};

const MOCK_SYSTEM = {
  version: "0.7.0-custom",
  mem_total: 8589934592,
  mem_used: 3221225472,
  cpu_cores: 4,
  cpu_usage: 16,
  total_user: 5,
  users_active: 3,
  users_online: 2,
  traffic_today: 303682830336, // ~283 GB
  incoming_bandwidth: 15032385536,
  outgoing_bandwidth: 58982400000,
  incoming_bandwidth_speed: 1048576,
  outgoing_bandwidth_speed: 2097152,
};

const MOCK_INBOUNDS = {
  vmess: [{ tag: "VMESS TCP", protocol: "vmess", network: "tcp", tls: false, port: 443 }],
  vless: [
    { tag: "VLESS WS TLS", protocol: "vless", network: "ws", tls: true, port: 443 },
    { tag: "VLESS REALITY", protocol: "vless", network: "tcp", tls: "reality", port: 443 },
  ],
  trojan: [{ tag: "Trojan TCP", protocol: "trojan", network: "tcp", tls: true, port: 443 }],
  shadowsocks: [{ tag: "Shadowsocks", protocol: "shadowsocks", network: "tcp", tls: false, port: 1234 }],
  v2box: [{ tag: "V2Box Device", protocol: "v2box", network: "tcp", tls: true, port: 443 }],
};

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

export function marzbanMockApi(): Plugin {
  return {
    name: "marzban-mock-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";

        if (req.method === "POST" && url === "/admin/token") {
          const body = await readBody(req);
          const contentType = (req.headers["content-type"] as string) || "";

          let username: string | null = null;
          let password: string | null = null;

          // Try urlencoded first
          if (contentType.includes("application/x-www-form-urlencoded")) {
            const params = new URLSearchParams(body);
            username = params.get("username");
            password = params.get("password");
          } else {
            // multipart/form-data or other — extract via regex
            const uMatch = body.match(/name="username"(?:\s*\r?\n){1,3}([^\r\n\-]+)/);
            const pMatch = body.match(/name="password"(?:\s*\r?\n){1,3}([^\r\n\-]+)/);
            username = uMatch ? uMatch[1].trim() : null;
            password = pMatch ? pMatch[1].trim() : null;
            // Also try plain urlencoded inside body (fallback)
            if (!username) {
              try {
                const params = new URLSearchParams(body);
                username = params.get("username");
                password = params.get("password");
              } catch {}
            }
          }

          // Dev mock: accept any non-empty credentials
          if (username && password) {
            return sendJson(res, 200, {
              access_token: FAKE_TOKEN,
              token_type: "bearer",
            });
          }
          // Last resort: if body has content at all, accept (dev only)
          if (body && body.length > 10) {
            return sendJson(res, 200, {
              access_token: FAKE_TOKEN,
              token_type: "bearer",
            });
          }
          return sendJson(res, 422, { detail: "Username and password required" });
        }

        if (req.method === "GET" && url === "/admin") {
          return sendJson(res, 200, {
            username: "admin",
            is_sudo: true,
            telegram_id: null,
            discord_webhook: null,
          });
        }

        if (req.method === "GET" && url === "/users") {
          const qs = new URLSearchParams(req.url?.split("?")[1] ?? "");
          const search = qs.get("search") || "";
          const status = qs.get("status") || "";
          let filtered = MOCK_USERS;
          if (search) filtered = filtered.filter((u) => u.username.includes(search));
          if (status) filtered = filtered.filter((u) => u.status === status);
          return sendJson(res, 200, { users: filtered, total: filtered.length });
        }

        if (req.method === "GET" && url.match(/^\/user\/[^/]+\/usage/)) {
          const now = Date.now();
          const days = 7;
          const usages = Array.from({ length: days }, (_, i) => ({
            date: new Date(now - (days - 1 - i) * 86400000).toISOString().slice(0, 10),
            downlink: Math.round((2 + Math.random() * 3) * 1073741824),
            uplink: Math.round((0.5 + Math.random()) * 1073741824),
          }));
          return sendJson(res, 200, { usages });
        }

        if (req.method === "DELETE" && url.startsWith("/user/")) {
          const username = url.split("/user/")[1];
          const idx = MOCK_USERS.findIndex((u) => u.username === username);
          if (idx !== -1) MOCK_USERS.splice(idx, 1);
          return sendJson(res, 200, {});
        }

        if (req.method === "PUT" && url.startsWith("/user/")) {
          const username = url.split("/user/")[1];
          const body = await readBody(req);
          try {
            const updates = JSON.parse(body);
            const idx = MOCK_USERS.findIndex((u) => u.username === username);
            if (idx !== -1) Object.assign(MOCK_USERS[idx], updates);
            return sendJson(res, 200, MOCK_USERS[idx] || {});
          } catch {
            return sendJson(res, 422, { detail: "Invalid body" });
          }
        }

        if (req.method === "POST" && url.startsWith("/user/") && url.endsWith("/reset")) {
          const username = url.split("/user/")[1].replace("/reset", "");
          const idx = MOCK_USERS.findIndex((u) => u.username === username);
          if (idx !== -1) MOCK_USERS[idx].used_traffic = 0;
          return sendJson(res, 200, {});
        }

        if (req.method === "POST" && url === "/user") {
          const body = await readBody(req);
          try {
            const newUser = JSON.parse(body);
            if (!newUser.username) return sendJson(res, 422, { detail: "username required" });
            const existing = MOCK_USERS.find((u) => u.username === newUser.username);
            if (existing) return sendJson(res, 409, { detail: "Username already exists" });
            const user = {
              username: newUser.username,
              proxies: newUser.proxies || {},
              inbounds: newUser.inbounds || {},
              expire: newUser.expire || null,
              data_limit: newUser.data_limit || 0,
              data_limit_reset_strategy: newUser.data_limit_reset_strategy || "no_reset",
              status: "active",
              used_traffic: 0,
              lifetime_used_traffic: 0,
              created_at: new Date().toISOString(),
              links: [],
              subscription_url: `/sub/${newUser.username}/token`,
              excluded_inbounds: {},
              note: newUser.note || null,
              on_hold_timeout: null,
              on_hold_expire_duration: null,
            };
            MOCK_USERS.push(user);
            return sendJson(res, 200, user);
          } catch {
            return sendJson(res, 422, { detail: "Invalid body" });
          }
        }

        if (req.method === "GET" && url.match(/^\/user\/[^/]+\/connections$/)) {
          const username = url.replace(/^\/user\//, "").replace(/\/connections$/, "");
          return sendJson(res, 200, MOCK_CONNECTIONS[username] || []);
        }

        if (req.method === "GET" && url.startsWith("/user/")) {
          const username = url.split("/user/")[1];
          const user = MOCK_USERS.find((u) => u.username === username);
          if (user) return sendJson(res, 200, user);
          return sendJson(res, 404, { detail: "User not found" });
        }

        if (req.method === "GET" && url === "/system") {
          return sendJson(res, 200, MOCK_SYSTEM);
        }

        if (req.method === "GET" && url === "/inbounds") {
          return sendJson(res, 200, MOCK_INBOUNDS);
        }

        if (req.method === "GET" && url === "/nodes") {
          return sendJson(res, 200, [
            { id: 1, name: "TR-Istanbul-01", address: "tr1.example.com", port: 62050, api_port: 62051, status: "connected", message: null, usage_coefficient: 1.0 },
            { id: 2, name: "DE-Frankfurt-01", address: "de1.example.com", port: 62050, api_port: 62051, status: "connected", message: null, usage_coefficient: 1.0 },
            { id: 3, name: "NL-Amsterdam-01", address: "nl1.example.com", port: 62050, api_port: 62051, status: "disabled", message: "Connection refused", usage_coefficient: 0.5 },
          ]);
        }

        if (req.method === "GET" && url === "/nodes/usage") {
          return sendJson(res, 200, {
            usages: [
              { node_id: null, node_name: "Master", uplink: 30064771072, downlink: 107374182400 },
              { node_id: 1, node_name: "TR-Istanbul-01", uplink: 10737418240, downlink: 32212254720 },
              { node_id: 2, node_name: "DE-Frankfurt-01", uplink: 5368709120, downlink: 21474836480 },
            ],
          });
        }

        if (req.method === "GET" && url === "/hosts") {
          return sendJson(res, 200, {
            "VMESS TCP": [],
            "VLESS WS TLS": [],
            "VLESS REALITY": [],
            "Trojan TCP": [],
            Shadowsocks: [],
          });
        }

        if (req.method === "GET" && url === "/core") {
          return sendJson(res, 200, {
            version: "24.9.30",
            started: true,
            logs_websocket: "/core/logs",
          });
        }

        if (req.method === "GET" && url === "/system/bandwidth") {
          const now = Date.now();
          const days = 14;
          const history = Array.from({ length: days }, (_, i) => {
            const d = new Date(now - (days - 1 - i) * 86400000);
            const label = `${d.getMonth() + 1}/${d.getDate()}`;
            const base = 3 + Math.random() * 4;
            return {
              date: label,
              incoming: Math.round(base * 1073741824),
              outgoing: Math.round(base * 2.5 * 1073741824),
            };
          });
          return sendJson(res, 200, { history });
        }

        if (req.method === "POST" && url.startsWith("/user/") && url.endsWith("/reset-usage")) {
          return sendJson(res, 200, {});
        }

        if (req.method === "POST" && url.startsWith("/user/") && url.endsWith("/revoke-sub")) {
          return sendJson(res, 200, {});
        }

        if (req.method === "POST" && url === "/users/reset") {
          return sendJson(res, 200, {});
        }

        next();
      });
    },
  };
}
