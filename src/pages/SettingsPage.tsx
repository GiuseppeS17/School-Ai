import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Palette, Globe, Check } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useState } from 'react';

export function SettingsPage() {
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const themes = [
        { id: 'warm', name: t('theme_warm'), bg: 'bg-[#FDFBF7]', primary: 'bg-[#8D7B68]' },
        { id: 'velvet', name: t('theme_velvet'), bg: 'bg-[#FFFDD0]', primary: 'bg-[#800020]' },
        { id: 'ocean', name: t('theme_ocean'), bg: 'bg-[#F0F8FF]', primary: 'bg-[#0077BE]' },
        { id: 'dark', name: t('theme_dark'), bg: 'bg-[#0F172A]', primary: 'bg-[#1E293B]' },
    ] as const;

    return (
        <div className="max-w-4xl mx-auto pt-4 space-y-12">
            <header>
                <h1 className="text-4xl font-bold text-text-main mb-4 tracking-tight">{t('settings_title')}</h1>
                <p className="text-xl text-text-muted">{t('settings_subtitle')}</p>
            </header>

            {/* Appearance Section */}
            <section className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                    <Palette className="text-primary" size={24} />
                    <h2 className="text-2xl font-semibold text-text-main">{t('settings_appearance')}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all duration-200 ${theme === t.id
                                ? 'border-primary shadow-md scale-[1.02]'
                                : 'border-transparent hover:border-primary/30 hover:scale-[1.01]'
                                }`}
                        >
                            <div className={`h-24 w-full ${t.bg} relative`}>
                                <div className={`absolute top-3 left-3 w-8 h-8 rounded-full ${t.primary} shadow-sm`}></div>
                                {theme === t.id && (
                                    <div className="absolute top-3 right-3 bg-primary text-white p-1 rounded-full">
                                        <Check size={14} />
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-surface w-full text-left">
                                <span className={`font-medium ${theme === t.id ? 'text-primary' : 'text-text-main group-hover:text-primary transition-colors'}`}>
                                    {t.name}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            <hr className="border-gray-200/50" />

            {/* Language Section */}
            <section className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                    <Globe className="text-primary" size={24} />
                    <h2 className="text-2xl font-semibold text-text-main">{t('settings_language')}</h2>
                </div>

                <div className="flex flex-wrap gap-4">
                    {['en', 'it', 'es'].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => changeLanguage(lang)}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border ${i18n.language === lang
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-surface text-text-main border-gray-200 hover:border-primary/50'
                                }`}
                        >
                            {lang === 'en' && 'English'}
                            {lang === 'it' && 'Italiano'}
                            {lang === 'es' && 'Español'}
                        </button>
                    ))}
                </div>
            </section>

            <hr className="border-gray-200/50" />

            {/* Voice Section */}
            <section className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                    <span className="p-2 bg-primary/10 text-primary rounded-xl">🗣️</span>
                    <h2 className="text-2xl font-semibold text-text-main">Voice Settings</h2>
                </div>
                <div className="bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-text-muted mb-4">Select the AI's voice (Microsoft Natural Recommended)</p>
                    <VoiceSelector />
                </div>
            </section>
        </div>
    );
}

function VoiceSelector() {
    const { voices } = useTextToSpeech();
    const [selected, setSelected] = useState(localStorage.getItem('app-voice-pref') || '');

    // Sort: Natural first, then Google, then others
    const sortedVoices = [...voices].sort((a, b) => {
        const isANatural = a.name.includes('Natural');
        const isBNatural = b.name.includes('Natural');
        if (isANatural && !isBNatural) return -1;
        if (!isANatural && isBNatural) return 1;
        return a.lang.localeCompare(b.lang);
    });

    // Filter mainly Italian/English voices to avoid clutter, or show all if list is small
    // Showing all "IT" voices plus the selected one to ensure it's visible
    const relevantVoices = sortedVoices.filter(v => v.lang.includes('it') || v.name.includes('Natural') || v.name === selected);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelected(val);
        localStorage.setItem('app-voice-pref', val);

        // Test speeach
        const utterance = new SpeechSynthesisUtterance("Prova audio. 1, 2, 3.");
        const voice = voices.find(v => v.name === val);
        if (voice) {
            utterance.voice = voice;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <select
            value={selected}
            onChange={handleChange}
            className="w-full max-w-md p-3 rounded-xl bg-background border border-gray-200 text-text-main focus:ring-2 focus:ring-primary/20 outline-none"
        >
            <option value="">Auto-Detect Best Voice</option>
            {relevantVoices.map(v => (
                <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                </option>
            ))}
        </select>
    );
}
