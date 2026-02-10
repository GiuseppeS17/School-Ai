/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#A9927D', // Warm Taupe / Muted Bronze
                background: '#F9F7F2', // Off-White / Cream
                surface: '#FFFFFF', // White for cards
                'text-main': '#2A2422', // Deep Coffee
                'text-muted': '#5E5049', // Lighter Coffee
                'accent-avatar': '#E07A5F', // Terra Cotta
                'accent-tools': '#607D8B', // Dusty Blue
                'accent-security': '#7C9082', // Muted Sage
            }
        },
    },
    plugins: [],
}
