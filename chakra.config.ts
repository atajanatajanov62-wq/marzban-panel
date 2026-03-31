import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  shadows: { outline: "0 0 0 2px rgba(var(--px-accent-rgb,99,102,241),0.4)" },
  fonts: {
    body: `Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif`,
  },
  colors: {
    "light-border": "#2d3748",
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    gray: {
      750: "#1a202c",
      800: "#111827",
      900: "#0d1117",
    },
  },
  styles: {
    global: {
      body: {
        bg: "transparent",
        color: "var(--px-text, white)",
      },
      "&::-webkit-scrollbar": { width: "5px" },
      "&::-webkit-scrollbar-track": { bg: "transparent" },
      "&::-webkit-scrollbar-thumb": { bg: "rgba(255,255,255,0.15)", borderRadius: "full" },
    },
  },
  components: {
    Alert: {
      baseStyle: {
        container: {
          borderRadius: "8px",
          fontSize: "sm",
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: "var(--px-modal-bg, #0d1526)",
          color: "white",
          borderColor: "rgba(255,255,255,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        },
        overlay: {
          bg: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          bg: "var(--px-glass-bg, rgba(255,255,255,0.07))",
          borderColor: "var(--px-border, rgba(255,255,255,0.12))",
          borderRadius: "8px",
          color: "var(--px-text, white)",
        },
      },
    },
    FormHelperText: { baseStyle: { fontSize: "xs" } },
    FormLabel: {
      baseStyle: {
        fontSize: "sm",
        fontWeight: "medium",
        mb: "1",
        color: "var(--px-text-muted, rgba(255,255,255,0.55))",
      },
    },
    Input: {
      baseStyle: {
        field: {
          _focusVisible: { boxShadow: "none", borderColor: "primary.500" },
          bg: "var(--px-glass-bg, rgba(255,255,255,0.07))",
          borderColor: "var(--px-border, rgba(255,255,255,0.12))",
          color: "var(--px-text, white)",
          _placeholder: { color: "var(--px-text-muted, rgba(255,255,255,0.4))" },
        },
      },
    },
    Table: {
      baseStyle: {
        table: { borderCollapse: "separate", borderSpacing: 0 },
        th: {
          background: "rgba(var(--px-accent-rgb, 99,102,241),0.06)",
          borderColor: "var(--px-border, rgba(255,255,255,0.1)) !important",
          borderBottomColor: "var(--px-border, rgba(255,255,255,0.1)) !important",
          borderTop: "1px solid",
          borderTopColor: "var(--px-border, rgba(255,255,255,0.1)) !important",
          color: "var(--px-text-muted, rgba(255,255,255,0.55))",
          fontSize: "11px",
          fontWeight: "semibold",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          _first: { borderLeft: "1px solid", borderColor: "var(--px-border, rgba(255,255,255,0.1)) !important" },
          _last: { borderRight: "1px solid", borderColor: "var(--px-border, rgba(255,255,255,0.1)) !important" },
        },
        td: {
          transition: "all .1s ease-out",
          borderColor: "var(--px-border, rgba(255,255,255,0.08))",
          borderBottomColor: "var(--px-border, rgba(255,255,255,0.08)) !important",
          color: "var(--px-text, white)",
          _first: {
            borderLeft: "1px solid",
            borderColor: "var(--px-border, rgba(255,255,255,0.08))",
          },
          _last: {
            borderRight: "1px solid",
            borderColor: "var(--px-border, rgba(255,255,255,0.08))",
          },
        },
        tr: {
          "&.interactive": {
            cursor: "pointer",
            _hover: {
              "& > td": { bg: "var(--px-hover-bg, rgba(255,255,255,0.04))" },
            },
          },
          _last: {
            "& > td": {
              _first: { borderBottomLeftRadius: "8px" },
              _last: { borderBottomRightRadius: "8px" },
            },
          },
        },
      },
    },
  },
});
