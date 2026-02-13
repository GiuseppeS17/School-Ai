/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--theme-primary)', // Warm Taupe / Muted Bronze
                'primary-foreground': 'var(--theme-primary-foreground)',
                background: 'var(--theme-background)', // Off-White / Cream
                surface: 'var(--theme-surface)', // White for cards
                border: 'var(--theme-border)', // Dynamic Border
                highlight: 'var(--theme-highlight-bg)', // Dynamic Highlight (hover states)
                'text-main': 'var(--theme-text-main)', // Deep Coffee
                'text-muted': 'var(--theme-text-muted)', // Lighter Coffee
                'accent-avatar': 'var(--theme-accent-avatar)', // Terra Cotta
                'accent-tools': 'var(--theme-accent-tools)', // Dusty Blue
                'accent-security': 'var(--theme-accent-security)', // Muted Sage
            }
        },
    },
    plugins: [],
}
