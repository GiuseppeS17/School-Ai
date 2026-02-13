import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'warm' | 'velvet' | 'ocean' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes: Record<Theme, Record<string, string>> = {
    warm: {
        '--theme-primary': '#8D7B68',
        '--theme-primary-foreground': '#FAF9F6',
        '--theme-background': '#FDFBF7',
        '--theme-surface': '#FAF9F6',
        '--theme-border': '#D6D3D1', // Stone 300 - Visible warm gray
        '--theme-highlight-bg': '#F5F5F0',
        '--theme-text-main': '#2C2621',
        '--theme-text-muted': '#5C554E',
        '--theme-accent-security': '#8CA388',
        '--theme-accent-tools': '#6B8CA3',
        '--theme-accent-avatar': '#C88D7D',
    },
    velvet: {
        '--theme-primary': '#800020',
        '--theme-primary-foreground': '#FAF9F6',
        '--theme-background': '#FFFDD0',
        '--theme-surface': '#FAF9F6',
        '--theme-border': '#CBD5E1', // Slate 300 - Crisp contrast
        '--theme-highlight-bg': '#F5F5F0',
        '--theme-text-main': '#2A0A10',
        '--theme-text-muted': '#592E36',
        '--theme-accent-security': '#5D737E',
        '--theme-accent-tools': '#A64654',
        '--theme-accent-avatar': '#800020',
    },
    ocean: {
        '--theme-primary': '#0077BE',
        '--theme-primary-foreground': '#FAF9F6',
        '--theme-background': '#F0F8FF',
        '--theme-surface': '#FAF9F6',
        '--theme-border': '#93C5FD', // Blue 300 - Themed border
        '--theme-highlight-bg': '#F0F8FF',
        '--theme-text-main': '#002147',
        '--theme-text-muted': '#465E7D',
        '--theme-accent-security': '#48A9A6',
        '--theme-accent-tools': '#0077BE',
        '--theme-accent-avatar': '#4267B2',
    },
    dark: {
        '--theme-primary': '#C0A080',
        '--theme-primary-foreground': '#242526',
        '--theme-background': '#18191a',
        '--theme-surface': '#242526',
        '--theme-border': '#3E4042', // Dark Reader Border
        '--theme-highlight-bg': '#3A3B3C', // Slightly lighter than surface
        '--theme-text-main': '#e4e6eb',
        '--theme-text-muted': '#b0b3b8',
        '--theme-accent-security': '#34D399',
        '--theme-accent-tools': '#60A5FA',
        '--theme-accent-avatar': '#F472B6',
    },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('app-theme');
        return (saved as Theme) || 'warm';
    });

    useEffect(() => {
        const root = document.documentElement;
        const themeColors = themes[theme];

        Object.entries(themeColors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        localStorage.setItem('app-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
