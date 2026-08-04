import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        surface: "hsl(var(--card))",
        "surface-secondary": "hsl(var(--surface-secondary))",
        "surface-tertiary": "hsl(var(--surface-tertiary))",
        primary: "hsl(var(--primary))",
        "primary-hover": "hsl(var(--primary-hover))",
        "primary-soft": "hsl(var(--primary-soft))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        "foreground-secondary": "hsl(var(--foreground-secondary))",
        border: "hsl(var(--border))",
        "border-subtle": "hsl(var(--border-subtle))",
        input: "hsl(var(--input))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
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

