import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--surface)",
        "card-foreground": "var(--foreground)",
        surface: "var(--surface)",
        "surface-secondary": "var(--surface-secondary)",
        "surface-tertiary": "var(--surface-tertiary)",
        "surface-hover": "var(--surface-hover)",
        "surface-active": "var(--surface-active)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        "primary-active": "var(--primary-active)",
        "primary-soft": "var(--primary-soft)",
        "primary-soft-hover": "var(--primary-soft-hover)",
        "primary-border": "var(--primary-border)",
        "primary-foreground": "var(--primary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        "foreground-secondary": "var(--foreground-secondary)",
        "foreground-disabled": "var(--foreground-disabled)",
        border: "var(--border)",
        "border-subtle": "var(--border-subtle)",
        input: "var(--input)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        focus: "var(--focus)",
        whatsapp: "var(--whatsapp)",
        "whatsapp-read": "var(--whatsapp-read)",
        "whatsapp-delivered": "var(--whatsapp-delivered)",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        subtle: "var(--shadow-subtle)",
        floating: "var(--shadow-floating)",
        modal: "var(--shadow-modal)",
      },
    },
  },
  plugins: [],
};

export default config;

