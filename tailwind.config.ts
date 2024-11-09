import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      container: {
        center: true,
        padding: "1rem",
      },
      typography: {
        invert: {
          css: {
            "--tw-prose-body": "rgb(209 213 219)",
            "--tw-prose-headings": "rgb(255 255 255)",
            "--tw-prose-links": "rgb(255 255 255)",
            "--tw-prose-bold": "rgb(255 255 255)",
            "--tw-prose-counters": "rgb(209 213 219)",
            "--tw-prose-bullets": "rgb(209 213 219)",
            "--tw-prose-hr": "rgb(45 45 45)",
            "--tw-prose-quotes": "rgb(209 213 219)",
            "--tw-prose-quote-borders": "rgb(45 45 45)",
            "--tw-prose-captions": "rgb(209 213 219)",
            "--tw-prose-code": "rgb(255 255 255)",
            "--tw-prose-pre-code": "rgb(209 213 219)",
            "--tw-prose-pre-bg": "rgb(45 45 45)",
            "--tw-prose-th-borders": "rgb(45 45 45)",
            "--tw-prose-td-borders": "rgb(45 45 45)",
            code: {
              backgroundColor: "rgb(45 45 45)",
              borderRadius: "0.375rem",
              paddingLeft: "0.375rem",
              paddingRight: "0.375rem",
              paddingTop: "0.125rem",
              paddingBottom: "0.125rem",
              fontSize: "0.875em",
              fontFamily: "var(--font-ibm-plex-mono), monospace",
            },
            pre: {
              backgroundColor: "rgb(45 45 45)",
              borderRadius: "0.5rem",
              padding: "1rem",
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              code: {
                backgroundColor: "transparent",
                borderRadius: "0",
                padding: "0",
                fontSize: "0.875em",
                fontWeight: "400",
                fontFamily: "inherit",
              },
            },
          },
        },
      },
      backgroundSize: {
        "300%": "300%",
      },
      animation: {
        gradient: "gradient 8s linear infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
