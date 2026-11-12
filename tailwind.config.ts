import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        terminal: {
          background: "hsl(var(--terminal-background) / <alpha-value>)",
          foreground: "hsl(var(--terminal-foreground) / <alpha-value>)",
          accent: "hsl(var(--terminal-accent) / <alpha-value>)",
          green: "hsl(var(--terminal-green) / <alpha-value>)",
          cyan: "hsl(var(--terminal-cyan) / <alpha-value>)",
          yellow: "hsl(var(--terminal-yellow) / <alpha-value>)",
          purple: "hsl(var(--terminal-purple) / <alpha-value>)",
          red: "hsl(var(--terminal-red) / <alpha-value>)",
          comment: "hsl(var(--terminal-comment) / <alpha-value>)",
        },
      },
      fontFamily: {
        mono: [
          '"JetBrains Mono"',
          '"SFMono-Regular"',
          "Consolas",
          '"Liberation Mono"',
          "Menlo",
          "monospace",
        ],
        sans: [
          '"Inter"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        serif: [
          '"Newsreader"',
          '"Iowan Old Style"',
          "Charter",
          "Georgia",
          "Cambria",
          "serif",
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "cursor-blink": "blink 1s step-start infinite",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100%",
            color: "#cdd6f4",
            lineHeight: "1.4",
            fontSize: "0.95rem",
            a: {
              color: "#89dceb",
              "&:hover": {
                color: "#a6e3a1",
              },
            },
            h1: {
              color: "#f5c2e7",
              lineHeight: "1.2",
              marginTop: "1.5em",
              marginBottom: "0.75em",
            },
            h2: {
              color: "#cba6f7",
              lineHeight: "1.2",
              marginTop: "1.5em",
              marginBottom: "0.75em",
            },
            h3: {
              color: "#a6e3a1",
              lineHeight: "1.2",
              marginTop: "1.5em",
              marginBottom: "0.75em",
            },
            p: {
              marginTop: "0.75em",
              marginBottom: "0.75em",
            },
            code: {
              color: "#f9e2af",
              backgroundColor: "#313244",
              padding: "0.25rem",
              borderRadius: "0.25rem",
            },
            blockquote: {
              color: "#6c7086",
              borderLeftColor: "#6c7086",
            },
            hr: {
              borderColor: "#6c7086",
            },
            li: {
              marginTop: "0.25em",
              marginBottom: "0.25em",
            },
          },
        },
        sm: {
          css: {
            fontSize: "0.875rem",
            lineHeight: "1.4",
            h1: {
              fontSize: "1.875rem",
              marginTop: "1.25em",
              marginBottom: "0.625em",
            },
            h2: {
              fontSize: "1.5rem",
              marginTop: "1.25em",
              marginBottom: "0.625em",
            },
            h3: {
              fontSize: "1.25rem",
              marginTop: "1.25em",
              marginBottom: "0.625em",
            },
          },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
} satisfies Config;
