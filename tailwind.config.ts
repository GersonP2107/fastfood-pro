import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'hsl(220, 90%, 56%)',
                    dark: 'hsl(220, 90%, 46%)',
                    light: 'hsl(220, 90%, 66%)',
                },
                accent: 'hsl(340, 82%, 52%)',
                success: 'hsl(142, 71%, 45%)',
                warning: 'hsl(38, 92%, 50%)',
                error: 'hsl(0, 84%, 60%)',
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'monospace'],
            },
        },
    },
    plugins: [],
} satisfies Config;
