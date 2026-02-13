import { useState } from 'react';
import { User, Mail, Lock, LogIn, Building2 } from 'lucide-react';

export function ProfilePage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Login attempt with: ${email}`);
    };

    return (
        <div className="p-8 max-w-2xl mx-auto min-h-[80vh] flex flex-col justify-center">

            <div className="bg-surface rounded-3xl p-10 border border-border shadow-xl">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <User size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-text-main">Welcome Back</h1>
                    <p className="text-text-muted mt-2">Sign in to access your progress</p>
                </div>

                <div className="space-y-4 mb-8">
                    {/* Google Login Placeholder */}
                    <button className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-border hover:bg-background transition-colors font-medium text-text-main">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Company Login Placeholder */}
                    <button className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-border hover:bg-background transition-colors font-medium text-text-main">
                        <Building2 className="w-5 h-5 text-text-muted" />
                        Login con Azienda
                    </button>
                </div>

                <div className="relative flex items-center justify-center mb-8">
                    <hr className="w-full border-border" />
                    <span className="absolute bg-surface px-4 text-xs text-text-muted uppercase tracking-widest font-semibold">Or with email</span>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted/50"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted/50"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            <LogIn size={20} />
                            Log In
                        </button>
                    </div>
                </form>

                <p className="text-center mt-8 text-sm text-text-muted">
                    Don't have an account? <a href="#" className="text-primary font-bold hover:underline">Sign up</a>
                </p>
            </div>

        </div>
    );
}
