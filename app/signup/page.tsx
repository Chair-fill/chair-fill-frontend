'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Loader2, Phone, ArrowLeft } from 'lucide-react';
import { useUser } from '@/app/providers/UserProvider';
import { api, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';

type Step = 'email' | 'otp' | 'details';

export default function SignupPage() {
  const router = useRouter();
  const { signup, logout, isLoading } = useUser();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [stepLoading, setStepLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setStepLoading(true);
    try {
      const { data } = await api.post<{ token?: string }>(API.AUTH.SIGNUP_VERIFY, {
        field: emailTrimmed,
      });
      const token = (data as { token?: string })?.token;
      if (token) {
        setVerifyToken(token);
        setEmail(emailTrimmed);
        setStep('otp');
      } else {
        setError('Check your email for the verification code.');
        setStep('otp');
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setStepLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) {
      setError('Please enter the code from your email.');
      return;
    }
    setStepLoading(true);
    try {
      await api.post(API.AUTH.VERIFY_EMAIL, {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        token: verifyToken,
      });
      setStep('details');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setStepLoading(false);
    }
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    const phoneTrimmed = phone.trim();
    if (!phoneTrimmed) {
      setError('Please enter your phone number.');
      return;
    }
    if (!/^\+?[0-9\s-()]{7,}$/.test(phoneTrimmed)) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneTrimmed,
      });
      logout();
      router.push('/login?registered=1');
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const loading = isLoading || stepLoading;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Create your account
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {step === 'email' && 'Enter your email to receive a verification code.'}
            {step === 'otp' && 'Enter the code we sent to your email.'}
            {step === 'details' && 'Add your details to finish signing up.'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
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
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send verification code'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Code sent to <span className="font-medium text-zinc-900 dark:text-zinc-50">{email}</span>
              </p>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Verification code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={e => { setOtp(e.target.value); setError(''); }}
                  placeholder="123456"
                  className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); setOtp(''); }}
                  className="flex-1 py-2.5 px-4 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium inline-flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                </button>
              </div>
            </form>
          )}

          {step === 'details' && (
            <form onSubmit={handleSubmitDetails} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Email address
                </label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 py-2 pl-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  {email}
                </p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Phone number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setError(''); }}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    minLength={8}
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Must be at least 8 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('otp')}
                  className="flex-1 py-2.5 px-4 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium inline-flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Sign up'
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
