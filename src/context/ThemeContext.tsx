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
        '--theme-primary-foreground': '#FFFFFF',
        '--theme-background': '#FDFBF7',
        '--theme-surface': '#FFFFFF',
        '--theme-text-main': '#2C2621',
        '--theme-text-muted': '#5C554E',
        '--theme-accent-security': '#8CA388',
        '--theme-accent-tools': '#6B8CA3',
        '--theme-accent-avatar': '#C88D7D',
    },
    velvet: {
        '--theme-primary': '#800020', // Bordeaux
        '--theme-primary-foreground': '#FFFFFF',
        '--theme-background': '#FFFDD0', // Cream
        '--theme-surface': '#FFFFFF',
        '--theme-text-main': '#2A0A10', // Darker Red/Black
        '--theme-text-muted': '#592E36',
        '--theme-accent-security': '#5D737E',
        '--theme-accent-tools': '#A64654',
        '--theme-accent-avatar': '#800020',
    },
    ocean: {
        '--theme-primary': '#0077BE', // Ocean Blue
        '--theme-primary-foreground': '#FFFFFF',
        '--theme-background': '#F0F8FF', // Alice Blue
        '--theme-surface': '#FFFFFF',
        '--theme-text-main': '#002147', // Oxford Blue
        '--theme-text-muted': '#465E7D',
        '--theme-accent-security': '#48A9A6',
        '--theme-accent-tools': '#0077BE',
        '--theme-accent-avatar': '#4267B2',
    },
    dark: {
        '--theme-primary': '#A3B18A', // Sage Green (nice contrast on dark) or Blue
        '--theme-primary-foreground': '#0F172A',
        '--theme-background': '#0F172A', // Slate 900
        '--theme-surface': '#1E293B', // Slate 800
        '--theme-text-main': '#F1F5F9', // Slate 100
        '--theme-text-muted': '#94A3B8', // Slate 400
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
