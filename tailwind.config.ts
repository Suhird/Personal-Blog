import type { Config } from "tailwindcss";

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
          background: "#282a36",
          foreground: "#f8f8f2",
          accent: "#ff79c6",
          green: "#50fa7b",
          cyan: "#8be9fd",
          yellow: "#f1fa8c",
          purple: "#bd93f9",
          red: "#ff5555",
          comment: "#6272a4",
        },
      },
      fontFamily: {
        mono: [
          '"Fira Code"',
          '"Source Code Pro"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
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
            color: "#f8f8f2",
            lineHeight: "1.4",
            fontSize: "0.95rem",
            a: {
              color: "#8be9fd",
              "&:hover": {
                color: "#50fa7b",
              },
            },
            h1: {
              color: "#ff79c6",
              lineHeight: "1.2",
              marginTop: "1.5em",
              marginBottom: "0.75em",
            },
            h2: {
              color: "#bd93f9",
              lineHeight: "1.2",
              marginTop: "1.5em",
              marginBottom: "0.75em",
            },
            h3: {
              color: "#50fa7b",
              lineHeight: "1.2",
              marginTop: "1.5em",
              marginBottom: "0.75em",
            },
            p: {
              marginTop: "0.75em",
              marginBottom: "0.75em",
            },
            code: {
              color: "#f1fa8c",
              backgroundColor: "#44475a",
              padding: "0.25rem",
              borderRadius: "0.25rem",
            },
            blockquote: {
              color: "#6272a4",
              borderLeftColor: "#6272a4",
            },
            hr: {
              borderColor: "#6272a4",
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
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
