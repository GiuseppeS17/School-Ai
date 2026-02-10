import { Bot, Shield, BookOpen, Database } from 'lucide-react';
import { FeatureCard } from '../components/FeatureCard';
import { useTranslation } from 'react-i18next';

export function Dashboard() {
    const { t } = useTranslation();

    return (
        <div className="max-w-6xl mx-auto pt-4">
            {/* Hero Section */}
            <header className="mb-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-4 tracking-tight">
                    {t('welcome')}
                </h1>
                <p className="text-xl text-text-muted max-w-2xl mx-auto">
                    {t('dashboard_subtitle')}
                </p>
            </header>

            {/* Central Hub Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                <FeatureCard
                    title={t('card_academy_title')}
                    description={t('card_academy_desc')}
                    icon={BookOpen}
                    to="/academy"
                    colorClass="text-accent-tools bg-accent-tools/15"
                />

                <FeatureCard
                    title={t('card_tutor_title')}
                    description={t('card_tutor_desc')}
                    icon={Bot}
                    to="/tutor"
                    colorClass="text-accent-avatar bg-accent-avatar/15"
                />

                <FeatureCard
                    title={t('card_training_title')}
                    description={t('card_training_desc')}
                    icon={Shield}
                    to="/training"
                    colorClass="text-accent-security bg-accent-security/15"
                />

                <FeatureCard
                    title="Knowledge Base"
                    description="Carica documenti e lezioni per istruire l'avatar."
                    icon={Database}
                    to="/knowledge"
                    colorClass="text-purple-600 bg-purple-100"
                />
            </div>
        </div>
    );
}
