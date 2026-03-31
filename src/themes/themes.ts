export type ThemeName = "marvel" | "tmnt" | "mk";

export interface OrbConfig {
  color: string;
  size: string;
  x: string;
  y: string;
  blur: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

export interface PanelTheme {
  name: ThemeName;
  label: string;
  emoji: string;
  brandName: string;
  logoText: string;
  panelName: string;
  modalBanner: string;
  modalBannerEdit: string;
  modalBannerBg: string;
  modalBannerTextColor: string;
  bg: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  accent: string;
  accentRgb: string;
  glow: string;
  shimmer: [string, string, string];
  modalBg: string;
  headerBg: string;
  filtersBg: string;
  headerBorder: string;
  text: string;
  textMuted: string;
  textFaint: string;
  glassBg: string;
  border: string;
  hoverBg: string;
  popoverBg: string;
  optionBg: string;
  previewGradient: string;
  pattern: string;
  patternSize: string;
  orbs: OrbConfig[];
}

export const themes: PanelTheme[] = [
  /* ─────────────────────── MARVEL ─────────────────────── */
  {
    name: "marvel",
    label: "MARVEL",
    emoji: "🦸",
    brandName: "MARVEL X",
    logoText: "MX",
    panelName: "Universe",
    modalBanner: "★  NEW AGENT RECRUITMENT  ★",
    modalBannerEdit: "★  AGENT STATUS UPDATE  ★",
    modalBannerBg: "linear-gradient(135deg, #e62429 0%, #8b0d10 50%, #1b2d5c 100%)",
    modalBannerTextColor: "#f0c040",
    bg: "#08091e",
    cardBg: "rgba(27,45,92,0.55)",
    cardBorder: "rgba(230,36,41,0.28)",
    cardShadow: "0 4px 28px rgba(230,36,41,0.15), 0 1px 0 rgba(255,255,255,0.05) inset",
    accent: "#e62429",
    accentRgb: "230,36,41",
    glow: "rgba(230,36,41,0.45)",
    shimmer: ["#e62429", "#f0c040", "#ffffff"],
    modalBg: "#0d1226",
    headerBg: "rgba(8,9,30,0.92)",
    filtersBg: "rgba(8,9,30,0.96)",
    headerBorder: "rgba(230,36,41,0.4)",
    text: "white",
    textMuted: "rgba(255,255,255,0.55)",
    textFaint: "rgba(255,255,255,0.28)",
    glassBg: "rgba(255,255,255,0.07)",
    border: "rgba(230,36,41,0.22)",
    hoverBg: "rgba(230,36,41,0.1)",
    popoverBg: "rgba(10,12,32,0.98)",
    optionBg: "#0d1226",
    previewGradient: "linear-gradient(135deg, #e62429 0%, #08091e 40%, #1b2d5c 100%)",
    pattern: "radial-gradient(circle, rgba(230,36,41,0.16) 1px, transparent 1px)",
    patternSize: "24px 24px",
    orbs: [
      { color: "rgba(230,36,41,0.4)", size: "720px", x: "62%", y: "-220px", blur: 100, duration: 20, delay: 0, driftX: 55, driftY: 40 },
      { color: "rgba(27,45,92,0.8)", size: "620px", x: "-110px", y: "28%", blur: 80, duration: 26, delay: -8, driftX: -45, driftY: 55 },
      { color: "rgba(240,192,64,0.1)", size: "450px", x: "38%", y: "62%", blur: 70, duration: 32, delay: -15, driftX: 35, driftY: -45 },
    ],
  },

  /* ─────────────────────── TMNT ─────────────────────── */
  {
    name: "tmnt",
    label: "TMNT",
    emoji: "🐢",
    brandName: "NINJA X",
    logoText: "🐢",
    panelName: "Sewers",
    modalBanner: "🍕  COWABUNGA! — ADDING NEW NINJA",
    modalBannerEdit: "🍕  DUDE! — UPDATING NINJA",
    modalBannerBg: "linear-gradient(135deg, #0d2e0d 0%, #143d14 50%, #1e5c1e 100%)",
    modalBannerTextColor: "#7fff00",
    bg: "#030a03",
    cardBg: "rgba(8,28,8,0.72)",
    cardBorder: "rgba(57,181,74,0.28)",
    cardShadow: "0 4px 28px rgba(57,181,74,0.15), 0 1px 0 rgba(57,181,74,0.08) inset",
    accent: "#39b54a",
    accentRgb: "57,181,74",
    glow: "rgba(57,181,74,0.45)",
    shimmer: ["#39b54a", "#7fff00", "#b8ff9f"],
    modalBg: "#051005",
    headerBg: "rgba(3,10,3,0.92)",
    filtersBg: "rgba(3,10,3,0.96)",
    headerBorder: "rgba(57,181,74,0.4)",
    text: "white",
    textMuted: "rgba(255,255,255,0.55)",
    textFaint: "rgba(255,255,255,0.28)",
    glassBg: "rgba(255,255,255,0.06)",
    border: "rgba(57,181,74,0.22)",
    hoverBg: "rgba(57,181,74,0.08)",
    popoverBg: "rgba(5,16,5,0.98)",
    optionBg: "#051005",
    previewGradient: "linear-gradient(135deg, #39b54a 0%, #030a03 40%, #143d14 100%)",
    pattern: [
      "repeating-linear-gradient(60deg, rgba(57,181,74,0.07) 0px, rgba(57,181,74,0.07) 1px, transparent 1px, transparent 38px)",
      "repeating-linear-gradient(-60deg, rgba(57,181,74,0.07) 0px, rgba(57,181,74,0.07) 1px, transparent 1px, transparent 38px)",
      "repeating-linear-gradient(0deg, rgba(57,181,74,0.04) 0px, rgba(57,181,74,0.04) 1px, transparent 1px, transparent 76px)",
    ].join(", "),
    patternSize: "44px 76px",
    orbs: [
      { color: "rgba(57,181,74,0.35)", size: "680px", x: "55%", y: "-190px", blur: 100, duration: 22, delay: 0, driftX: 60, driftY: 40 },
      { color: "rgba(57,181,74,0.18)", size: "520px", x: "-90px", y: "35%", blur: 90, duration: 28, delay: -10, driftX: -50, driftY: 65 },
      { color: "rgba(0,200,80,0.1)", size: "420px", x: "32%", y: "60%", blur: 80, duration: 18, delay: -5, driftX: 40, driftY: -50 },
    ],
  },

  /* ─────────────────────── MORTAL KOMBAT ─────────────────────── */
  {
    name: "mk",
    label: "MK",
    emoji: "⚔️",
    brandName: "KOMBAT X",
    logoText: "⚔",
    panelName: "Outworld",
    modalBanner: "⚔  TEST YOUR MIGHT — ENTER KOMBATANT",
    modalBannerEdit: "⚔  MERCY — UPDATE KOMBATANT",
    modalBannerBg: "linear-gradient(135deg, #1a0000 0%, #050000 50%, #1a0e00 100%)",
    modalBannerTextColor: "#d4a017",
    bg: "#010001",
    cardBg: "rgba(18,2,2,0.82)",
    cardBorder: "rgba(204,0,0,0.32)",
    cardShadow: "0 4px 28px rgba(204,0,0,0.18), 0 1px 0 rgba(212,160,23,0.06) inset",
    accent: "#cc0000",
    accentRgb: "204,0,0",
    glow: "rgba(204,0,0,0.5)",
    shimmer: ["#cc0000", "#d4a017", "#ff4444"],
    modalBg: "#0a0000",
    headerBg: "rgba(1,0,1,0.96)",
    filtersBg: "rgba(1,0,1,0.98)",
    headerBorder: "rgba(212,160,23,0.38)",
    text: "white",
    textMuted: "rgba(255,255,255,0.55)",
    textFaint: "rgba(255,255,255,0.28)",
    glassBg: "rgba(255,255,255,0.05)",
    border: "rgba(204,0,0,0.28)",
    hoverBg: "rgba(204,0,0,0.1)",
    popoverBg: "rgba(10,0,0,0.98)",
    optionBg: "#0a0000",
    previewGradient: "linear-gradient(135deg, #cc0000 0%, #010001 40%, #d4a017 100%)",
    pattern: [
      "repeating-linear-gradient(0deg, rgba(204,0,0,0.05) 0px, rgba(204,0,0,0.05) 1px, transparent 1px, transparent 20px)",
      "repeating-linear-gradient(90deg, rgba(212,160,23,0.04) 0px, rgba(212,160,23,0.04) 1px, transparent 1px, transparent 20px)",
    ].join(", "),
    patternSize: "20px 20px",
    orbs: [
      { color: "rgba(204,0,0,0.45)", size: "650px", x: "52%", y: "-200px", blur: 110, duration: 18, delay: 0, driftX: 45, driftY: 35 },
      { color: "rgba(180,0,0,0.25)", size: "540px", x: "-60px", y: "38%", blur: 95, duration: 24, delay: -7, driftX: -38, driftY: 52 },
      { color: "rgba(212,160,23,0.18)", size: "460px", x: "60%", y: "58%", blur: 80, duration: 30, delay: -14, driftX: 32, driftY: -42 },
    ],
  },
];

export const defaultTheme = themes[0];
