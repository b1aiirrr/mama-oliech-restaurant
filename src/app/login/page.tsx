'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMsg('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/');
                router.refresh(); // Refresh server components to pick up new cookie
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                setMsg('Success! Check your email to confirm your account.');
            }
        } catch (err: any) {
            let message = err.message;
            if (message.includes('already registered')) {
                message = 'An account with this email already exists. Please sign in instead.';
            } else if (message.includes('SMTP') || message.includes('confirmation email')) {
                message = 'Email delivery failed. Please check your SMTP settings in Supabase (Host: smtp.gmail.com, Port: 587) and ensure your App Password is correct.';
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-cream flex flex-col justify-center py-12 pt-32 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/" className="inline-block mb-6">
                    <span className="font-display text-4xl font-bold tracking-tight text-charcoal">
                        Mama Oliech Restaurant
                    </span>
                </Link>
                <h2 className="text-center text-3xl font-display font-bold tracking-tight text-charcoal">
                    {isLogin ? 'Sign in to your account' : 'Create a new account'}
                </h2>
                <p className="mt-2 text-center text-sm text-charcoal/60">
                    Or{' '}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); setMsg(''); }} className="font-medium text-terracotta-600 hover:text-terracotta-500 underline">
                        {isLogin ? 'sign up for a new account' : 'login to an existing account'}
                    </button>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl border-2 border-gray-100 sm:rounded-[2rem] sm:px-10">
                    <form className="space-y-6" onSubmit={handleEmailAuth}>
                        <div>
                            <label className="block text-sm font-bold text-charcoal">Email address</label>
                            <div className="mt-2">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-xl border-gray-300 py-3 px-4 text-charcoal shadow-sm focus:border-terracotta-500 focus:ring-terracotta-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-charcoal">Password</label>
                            <div className="mt-2">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-xl border-gray-300 py-3 px-4 text-charcoal shadow-sm focus:border-terracotta-500 focus:ring-terracotta-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {error && <div className="text-red-600 text-sm font-semibold">{error}</div>}
                        {msg && <div className="text-green-600 text-sm font-semibold">{msg}</div>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-terracotta-600 hover:bg-terracotta-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-500 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={handleGoogleAuth}
                                className="w-full flex items-center justify-center gap-3 py-4 px-4 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-charcoal hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                <span>Sign in with Google</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
