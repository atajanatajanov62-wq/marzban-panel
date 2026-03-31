import { useColorMode } from "@chakra-ui/react";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { defaultTheme, OrbConfig, PanelTheme, themes, ThemeName } from "themes/themes";

interface ThemeContextType {
  currentTheme: PanelTheme;
  setTheme: (name: ThemeName) => void;
  themes: PanelTheme[];
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: defaultTheme,
  setTheme: () => {},
  themes,
});

function applyThemeCSSVars(theme: PanelTheme) {
  const root = document.documentElement;
  root.style.setProperty("--px-bg", theme.bg);
  root.style.setProperty("--px-card-bg", theme.cardBg);
  root.style.setProperty("--px-card-border", theme.cardBorder);
  root.style.setProperty("--px-accent", theme.accent);
  root.style.setProperty("--px-accent-rgb", theme.accentRgb);
  root.style.setProperty("--px-glow", theme.glow);
  root.style.setProperty("--px-shimmer-1", theme.shimmer[0]);
  root.style.setProperty("--px-shimmer-2", theme.shimmer[1]);
  root.style.setProperty("--px-shimmer-3", theme.shimmer[2]);
  root.style.setProperty("--px-modal-bg", theme.modalBg);
  root.style.setProperty("--px-header-bg", theme.headerBg);
  root.style.setProperty("--px-filters-bg", theme.filtersBg);
  root.style.setProperty("--px-header-border", theme.headerBorder);
  root.style.setProperty("--px-text", theme.text);
  root.style.setProperty("--px-text-muted", theme.textMuted);
  root.style.setProperty("--px-text-faint", theme.textFaint);
  root.style.setProperty("--px-glass-bg", theme.glassBg);
  root.style.setProperty("--px-border", theme.border);
  root.style.setProperty("--px-hover-bg", theme.hoverBg);
  root.style.setProperty("--px-popover-bg", theme.popoverBg);
  root.style.setProperty("--px-option-bg", theme.optionBg);
  root.style.setProperty("--px-card-shadow", theme.cardShadow);
  document.body.style.background = theme.bg;

  /* apply theme body class */
  document.body.classList.remove("theme-marvel", "theme-tmnt", "theme-mk");
  document.body.classList.add(`theme-${theme.name}`);

  /* inject pattern overlay style */
  let patternEl = document.getElementById("px-pattern-style") as HTMLStyleElement | null;
  if (!patternEl) {
    patternEl = document.createElement("style");
    patternEl.id = "px-pattern-style";
    document.head.appendChild(patternEl);
  }
  patternEl.textContent = `
    #px-bg-pattern {
      background-image: ${theme.pattern};
      background-size: ${theme.patternSize};
    }
  `;
}

const ThemeBg: FC<{ theme: PanelTheme }> = ({ theme }) => {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!styleRef.current) {
      const existing = document.getElementById("px-orb-keyframes");
      if (existing) {
        styleRef.current = existing as HTMLStyleElement;
        return;
      }
      const el = document.createElement("style");
      el.id = "px-orb-keyframes";
      el.textContent = `
        @keyframes px-float-a {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(var(--ox),var(--oy)) scale(1.07); }
          66%      { transform: translate(calc(var(--ox)*-0.6),calc(var(--oy)*0.4)) scale(0.95); }
        }
        @keyframes px-float-b {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(calc(var(--ox)*-1),calc(var(--oy)*0.8)) scale(1.05); }
          75%      { transform: translate(calc(var(--ox)*0.4),calc(var(--oy)*-0.6)) scale(0.97); }
        }
        @keyframes px-float-c {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(var(--ox),var(--oy)) scale(1.1); }
        }
        @keyframes px-float-d {
          0%,100% { transform: translate(0,0) scale(1); }
          30%      { transform: translate(calc(var(--ox)*0.7),calc(var(--oy)*-0.5)) scale(1.06); }
          70%      { transform: translate(calc(var(--ox)*-0.4),calc(var(--oy)*0.8)) scale(0.94); }
        }
      `;
      document.head.appendChild(el);
      styleRef.current = el;
    }
  }, []);

  const animNames = ["px-float-a", "px-float-b", "px-float-c", "px-float-d"];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
        transition: "background 0.7s ease",
        background: theme.bg,
      }}
    >
      {/* Animated orbs */}
      {theme.orbs.map((orb: OrbConfig, i: number) => (
        <div
          key={`${theme.name}-orb-${i}`}
          style={{
            position: "absolute",
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: orb.color,
            filter: `blur(${orb.blur}px)`,
            left: orb.x,
            top: orb.y,
            "--ox": `${orb.driftX}px`,
            "--oy": `${orb.driftY}px`,
            animation: `${animNames[i % 4]} ${orb.duration}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            willChange: "transform",
          } as React.CSSProperties & { [key: string]: string | number }}
        />
      ))}
      {/* Pattern overlay */}
      <div
        id="px-bg-pattern"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export const ThemeProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { setColorMode } = useColorMode();

  const [currentTheme, setCurrentTheme] = useState<PanelTheme>(() => {
    const saved = localStorage.getItem("px-panel-theme");
    return themes.find((t) => t.name === saved) ?? defaultTheme;
  });

  useEffect(() => {
    applyThemeCSSVars(currentTheme);
    setColorMode("dark");
  }, []);

  const setTheme = (name: ThemeName) => {
    const theme = themes.find((t) => t.name === name) ?? defaultTheme;
    setCurrentTheme(theme);
    applyThemeCSSVars(theme);
    setColorMode("dark");
    localStorage.setItem("px-panel-theme", name);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      <ThemeBg theme={currentTheme} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
