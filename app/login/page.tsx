'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useUser } from '@/app/providers/UserProvider';
import { api, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import AuthLayout from '@/app/components/ui/AuthLayout';
import AuthCard from '@/app/components/ui/AuthCard';
import FormError from '@/app/components/ui/FormError';
import FormSuccess from '@/app/components/ui/FormSuccess';
import {
  FORM_LABEL,
  INPUT_LEFT_ICON,
  INPUT_ICON_LEFT,
  INPUT_PLAIN,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_PRIMARY_FLEX,
  AUTH_SUBTITLE,
  AUTH_FOOTER_TEXT,
  AUTH_FOOTER_LINK,
} from '@/lib/constants/ui';

const DEFAULT_REDIRECT = '/contacts';
const ONBOARDING_BARBER_ACCOUNT = '/onboarding/barber-account';
const ONBOARDING_CHOOSE_PLAN = '/onboarding/choose-plan';
const isDemoAvailable = process.env.NEXT_PUBLIC_FF_DEMO_MODE === 'true';

type ProgressPayload = { is_technician?: boolean; has_subscribed?: boolean };

/** Call progress/me and return redirect path. Uses is_technician and has_subscribed. */
async function getRedirectAfterLogin(fallback: string): Promise<string> {
  try {
    const { data } = await api.get<ProgressPayload | { data?: ProgressPayload }>(API.PROGRESS.ME);
    const raw = data && typeof data === 'object' ? data : null;
    const prog: ProgressPayload | undefined =
      raw && 'data' in raw && raw.data != null ? raw.data : (raw as ProgressPayload | undefined);
    const isTechnician = prog && typeof prog === 'object' && prog.is_technician === true;
    const hasSubscribed = prog && typeof prog === 'object' && prog.has_subscribed === true;
    if (!isTechnician) return ONBOARDING_BARBER_ACCOUNT;
    if (!hasSubscribed) return ONBOARDING_CHOOSE_PLAN;
    return fallback;
  } catch {
    return ONBOARDING_BARBER_ACCOUNT;
  }
}

type Step = 'credentials' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || DEFAULT_REDIRECT;
  const registered = searchParams.get('registered') === '1';
  const { signinVerify, signinWithOtp, loginWithDemo, logout, clearSessionForNewLogin, isLoading } = useUser();
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const hasAutoDemo = useRef(false);

  // Clear any existing session when showing login so the next user (or re-login) never uses the previous user's token or identity.
  useEffect(() => {
    clearSessionForNewLogin();
  }, [clearSessionForNewLogin]);

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

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    try {
      const result = await signinVerify(email.trim(), password);
      if (result.needsOtp && result.verifyToken) {
        setVerifyToken(result.verifyToken);
        setStep('otp');
      } else {
        setIsRedirecting(true);
        try {
          const fallback = redirectTo.startsWith('/') ? redirectTo : DEFAULT_REDIRECT;
          const dest = await getRedirectAfterLogin(fallback);
          router.push(dest);
          router.refresh();
        } finally {
          setIsRedirecting(false);
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) {
      setError('Please enter the code from your email.');
      return;
    }
    try {
      await signinWithOtp(email.trim(), verifyToken, otp.trim());
      setIsRedirecting(true);
      try {
        const fallback = redirectTo.startsWith('/') ? redirectTo : DEFAULT_REDIRECT;
        const dest = await getRedirectAfterLogin(fallback);
        router.push(dest);
        router.refresh();
      } finally {
        setIsRedirecting(false);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-zinc-400 dark:text-zinc-500 animate-spin" />
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Signing you in...</p>
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Sign in to chairfill
        </h1>
        <p className={AUTH_SUBTITLE}>
          {step === 'credentials' ? 'Enter your email and password to continue' : 'Enter the code we sent to your email'}
        </p>
      </div>

      <AuthCard>
        {registered && (
          <div className="mb-5">
            <FormSuccess message="Account created successfully. Please sign in." />
          </div>
        )}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            {error && <FormError message={error} />}

            <div>
              <label htmlFor="email" className={FORM_LABEL}>
                Email address
              </label>
              <div className="relative">
                <Mail className={INPUT_ICON_LEFT} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className={INPUT_LEFT_ICON}
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
                <Lock className={INPUT_ICON_LEFT} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className={INPUT_LEFT_ICON}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={BTN_PRIMARY}
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
                  className="w-full py-2.5 px-4 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
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
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            {error && <FormError message={error} />}
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Code sent to <span className="font-medium text-zinc-900 dark:text-zinc-50">{email}</span>
            </p>
            <div>
              <label htmlFor="otp" className={FORM_LABEL}>Verification code</label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={e => { setOtp(e.target.value); setError(''); }}
                placeholder="123456"
                className={INPUT_PLAIN}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setStep('credentials'); setError(''); setOtp(''); }}
                className={`flex-1 ${BTN_SECONDARY}`}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="submit" disabled={isLoading} className={BTN_PRIMARY_FLEX}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
              </button>
            </div>
          </form>
        )}

        <p className={AUTH_FOOTER_TEXT}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className={AUTH_FOOTER_LINK}>
            Sign up
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
