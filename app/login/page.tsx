'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useUser } from '@/app/providers/UserProvider';
import { getApiErrorMessage } from '@/lib/api-client';

const DEFAULT_REDIRECT = '/contacts';
const isDemoAvailable = process.env.NEXT_PUBLIC_FF_DEMO_MODE === 'true';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || DEFAULT_REDIRECT;
  const registered = searchParams.get('registered') === '1';
  const { login, loginWithDemo, isLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);

  const hasAutoDemo = useRef(false);
  // Auto-start demo when visiting /login?demo=1 (once per mount)
  useEffect(() => {
    if (hasAutoDemo.current || searchParams.get('demo') !== '1') return;
    hasAutoDemo.current = true;
    loginWithDemo();
    router.replace(redirectTo.startsWith('/') ? redirectTo : DEFAULT_REDIRECT);
  }, [searchParams, loginWithDemo, redirectTo, router]);

  const handleTryDemo = () => {
    setDemoLoading(true);
    setError('');
    loginWithDemo();
    router.push(redirectTo.startsWith('/') ? redirectTo : DEFAULT_REDIRECT);
    router.refresh();
    setDemoLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    try {
      await login({ email: email.trim(), password });
      router.push(redirectTo.startsWith('/') ? redirectTo : DEFAULT_REDIRECT);
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Sign in to chairfill
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Enter your email and password to continue
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
          {registered && (
            <div className="mb-5 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Account created successfully. Please sign in.</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>

            {isDemoAvailable && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTryDemo}
                  disabled={demoLoading || isLoading}
                  className="w-full py-2.5 px-4 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {demoLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Starting demo...
                    </>
                  ) : (
                    'Try demo'
                  )}
                </button>
              </>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
