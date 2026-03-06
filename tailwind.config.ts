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
                    DEFAULT: '#fa0050',
                    dark: '#d4003e',
                    light: '#ff3375',
                },
                accent: '#fa0050',
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
