import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useTranslation } from 'react-i18next';

export function DashboardLayout() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-background text-main flex font-sans transition-colors duration-300">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-semibold text-primary">{t('welcome_back')}</h2>
                </header>
                <Outlet />
            </main>
        </div>
    );
}
