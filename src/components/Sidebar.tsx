import { LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Sidebar() {
    const { t } = useTranslation();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (

        <aside className="w-64 bg-surface p-6 border-r border-gray-200 hidden md:block h-screen sticky top-0 shadow-sm z-10">
            <h1 className="text-2xl font-bold text-primary mb-10 tracking-tight">
                School AI
            </h1>
            <nav className="space-y-4">
                <Link to="/">
                    <div className={`group flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${isActive('/') ? 'bg-white shadow-md border-gray-100' : 'hover:bg-white/60 hover:shadow-sm'}`}>
                        <div className={`p-2 rounded-lg transition-colors ${isActive('/') ? 'bg-primary/10' : 'bg-gray-100 group-hover:bg-primary/5'}`}>
                            <LayoutDashboard size={20} className={isActive('/') ? 'text-primary' : 'text-text-muted group-hover:text-primary'} />
                        </div>
                        <span className={`font-medium ${isActive('/') ? 'text-primary' : 'text-text-muted group-hover:text-text-main'}`}>{t('nav_dashboard')}</span>
                    </div>
                </Link>

                {/* Knowledge Base Link Removed */}
            </nav>

            <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-gray-100">
                <div className="space-y-2">
                    <Link to="/profile" className="flex items-center space-x-3 p-3 rounded-xl cursor-pointer hover:bg-white/60 hover:shadow-sm transition-all duration-200">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">U</div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-text-main">{t('nav_user_profile')}</p>
                            <p className="text-xs text-text-muted">{t('nav_student_role')}</p>
                        </div>
                    </Link>

                    <Link to="/settings" className="flex items-center space-x-3 p-3 rounded-xl cursor-pointer hover:bg-white/60 hover:shadow-sm transition-all duration-200">
                        <div className="p-2 rounded-lg bg-gray-100 text-text-muted">
                            {/* Using a generic icon for settings if not imported, or just text for now to be safe, but imported Icons are available */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </div>
                        <span className="font-medium text-text-muted">{t('nav_settings')}</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
}
