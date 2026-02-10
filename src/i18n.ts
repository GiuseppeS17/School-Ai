import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Placeholder translations - we will move these to separate JSON files later
const resources = {
    en: {
        translation: {
            "welcome": "What are we learning today?",
            "welcome_back": "Welcome back, Student",
            "dashboard_subtitle": "Your personal AI companion for education. Select a module below to get started.",
            "card_academy_title": "Academy",
            "card_academy_desc": "Access a suite of educational resources and AI tools designed to enhance your learning.",
            "card_tutor_title": "Tutor",
            "card_tutor_desc": "Interact with your personal AI tutor aimed at helping you study and review lessons.",
            "card_training_title": "Training",
            "card_training_desc": "Test your knowledge and learn about digital safety and cybersecurity.",
            "nav_dashboard": "Dashboard",
            "nav_academy": "Academy",
            "nav_tutor": "Tutor",
            "nav_training": "Training",
            "nav_user_profile": "User Profile",
            "nav_student_role": "Student",
            "nav_settings": "Settings",
            "settings_title": "Settings",
            "settings_subtitle": "Customize your learning experience.",
            "settings_appearance": "Appearance",
            "settings_language": "Language",
            "theme_warm": "Warm Professional",
            "theme_velvet": "Velvet Elegance",
            "theme_ocean": "Ocean Breeze",
            "theme_dark": "Dark Mode",
            "explore": "Explore"
        }
    },
    it: {
        translation: {
            "welcome": "Cosa impariamo oggi?",
            "welcome_back": "Bentornato, Studente",
            "dashboard_subtitle": "Il tuo compagno AI personale per l'educazione. Seleziona un modulo qui sotto per iniziare.",
            "card_academy_title": "Accademia",
            "card_academy_desc": "Accedi a una suite di risorse educative e strumenti AI progettati per migliorare il tuo apprendimento.",
            "card_tutor_title": "Tutor",
            "card_tutor_desc": "Interagisci con il tuo tutor AI personale per studiare e ripassare le lezioni.",
            "card_training_title": "Formazione",
            "card_training_desc": "Metti alla prova le tue conoscenze e impara la sicurezza digitale.",
            "nav_dashboard": "Dashboard",
            "nav_academy": "Accademia",
            "nav_tutor": "Tutor",
            "nav_training": "Formazione",
            "nav_user_profile": "Profilo Utente",
            "nav_student_role": "Studente",
            "nav_settings": "Impostazioni",
            "settings_title": "Impostazioni",
            "settings_subtitle": "Personalizza la tua esperienza di apprendimento.",
            "settings_appearance": "Aspetto",
            "settings_language": "Lingua",
            "theme_warm": "Professionale Caldo",
            "theme_velvet": "Eleganza Velluto",
            "theme_ocean": "Brezza Oceanica",
            "theme_dark": "Modalità Scura",
            "explore": "Esplora"
        }
    },
    es: {
        translation: {
            "welcome": "¿Qué aprendemos hoy?",
            "welcome_back": "Bienvenido de nuevo, Estudiante",
            "dashboard_subtitle": "Tu compañero de IA personal para la educación. Selecciona un módulo a continuación para comenzar.",
            "card_academy_title": "Academia",
            "card_academy_desc": "Accede a un conjunto de recursos educativos y herramientas de IA para mejorar tu aprendizaje.",
            "card_tutor_title": "Tutor",
            "card_tutor_desc": "Interactúa con tu tutor de IA personal para estudiar y repasar lecciones.",
            "card_training_title": "Entrenamiento",
            "card_training_desc": "Pon a prueba tus conocimientos y aprende sobre seguridad digital.",
            "nav_dashboard": "Panel",
            "nav_academy": "Academia",
            "nav_tutor": "Tutor",
            "nav_training": "Entrenamiento",
            "nav_user_profile": "Perfil de Usuario",
            "nav_student_role": "Estudiante",
            "nav_settings": "Ajustes",
            "settings_title": "Ajustes",
            "settings_subtitle": "Personaliza tu experiencia de aprendizaje.",
            "settings_appearance": "Apariencia",
            "settings_language": "Idioma",
            "theme_warm": "Profesional Cálido",
            "theme_velvet": "Elegancia Terciopelo",
            "theme_ocean": "Brisa Oceánica",
            "theme_dark": "Modo Oscuro",
            "explore": "Explorar"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "it", // default language
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
