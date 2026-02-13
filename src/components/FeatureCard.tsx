import { type LucideIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    to: string;
    colorClass: string; // e.g., "text-accent-avatar bg-accent-avatar/10"
}

import { useTranslation } from 'react-i18next';

export function FeatureCard({ title, description, icon: Icon, to, colorClass }: FeatureCardProps) {
    const { t } = useTranslation();
    return (
        <Link to={to} className="group relative block h-full">
            <div className="absolute inset-0 bg-surface rounded-2xl border border-border shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1"></div>
            <div className="relative p-8 flex flex-col h-full bg-surface rounded-2xl overflow-hidden border border-transparent group-hover:border-primary/10 transition-colors">

                {/* Icon Background Blob */}
                <div className={`absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20 ${colorClass.split(' ')[0].replace('text-', 'bg-')}`}></div>

                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 ${colorClass}`}>
                    <Icon size={28} strokeWidth={1.5} />
                </div>

                <h3 className="text-2xl font-semibold text-text-main mb-3 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-text-muted text-base leading-relaxed mb-8 flex-1">{description}</p>

                <div className="flex items-center text-primary font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <span>{t('explore')}</span>
                    <ArrowRight size={16} className="ml-2" />
                </div>
            </div>
        </Link>
    );
}
