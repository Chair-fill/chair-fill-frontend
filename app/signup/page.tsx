'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Loader2, Phone, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useUser } from '@/app/providers/UserProvider';
import { api, getApiErrorMessage, getResponseToken } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import AuthLayout from '@/app/components/ui/AuthLayout';
import AuthCard from '@/app/components/ui/AuthCard';
import FormError from '@/app/components/ui/FormError';
import {
  FORM_LABEL,
  INPUT_LEFT_ICON,
  INPUT_LEFT_RIGHT_ICON,
  INPUT_PLAIN,
  INPUT_ICON_LEFT,
  INPUT_ICON_RIGHT,
  BTN_PRIMARY,
  BTN_PRIMARY_FLEX,
  BTN_SECONDARY,
  AUTH_SUBTITLE,
  AUTH_FOOTER_TEXT,
  AUTH_FOOTER_LINK,
} from '@/lib/constants/ui';

type Step = 'email' | 'otp' | 'details';

export default function SignupPage() {
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      const { data } = await api.post(API.AUTH.SIGNUP_VERIFY, { field: emailTrimmed });
      const token = getResponseToken(data);
      if (token) setVerifyToken(token);
      setEmail(emailTrimmed);
      setStep('otp');
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
      // Full page load ensures clean state so RequireAuth doesn't redirect to /contacts
      window.location.href = '/login?registered=1';
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const loading = isLoading || stepLoading;

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Create your account
        </h1>
        <p className={AUTH_SUBTITLE}>
          {step === 'email' && 'Enter your email to receive a verification code.'}
          {step === 'otp' && 'Enter the code we sent to your email.'}
          {step === 'details' && 'Add your details to finish signing up.'}
        </p>
      </div>

      <AuthCard>
        {step === 'email' && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            {error && <FormError message={error} />}
            <div>
              <label htmlFor="email" className={FORM_LABEL}>Email address</label>
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
            <button type="submit" disabled={loading} className={BTN_PRIMARY}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send verification code'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
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
              <button type="button" onClick={() => { setStep('email'); setError(''); setOtp(''); }} className={`flex-1 ${BTN_SECONDARY}`}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="submit" disabled={loading} className={BTN_PRIMARY_FLEX}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
              </button>
            </div>
          </form>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmitDetails} className="space-y-5">
            {error && <FormError message={error} />}

            <div>
              <label className={FORM_LABEL}>Email address</label>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 py-2 pl-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">{email}</p>
            </div>

            <div>
              <label htmlFor="name" className={FORM_LABEL}>Full name</label>
              <div className="relative">
                <User className={INPUT_ICON_LEFT} />
                <input id="name" name="name" type="text" autoComplete="name" required value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder="John Doe" className={INPUT_LEFT_ICON} />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className={FORM_LABEL}>Phone number</label>
              <div className="relative">
                <Phone className={INPUT_ICON_LEFT} />
                <input id="phone" name="phone" type="tel" autoComplete="tel" required value={phone} onChange={e => { setPhone(e.target.value); setError(''); }} placeholder="+1 (555) 123-4567" className={INPUT_LEFT_ICON} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={FORM_LABEL}>Password</label>
              <div className="relative">
                <Lock className={INPUT_ICON_LEFT} />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="••••••••" minLength={8} className={INPUT_LEFT_RIGHT_ICON} />
                <button type="button" onClick={() => setShowPassword(p => !p)} className={INPUT_ICON_RIGHT} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={FORM_LABEL}>Confirm password</label>
              <div className="relative">
                <Lock className={INPUT_ICON_LEFT} />
                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }} placeholder="••••••••" className={INPUT_LEFT_RIGHT_ICON} />
                <button type="button" onClick={() => setShowConfirmPassword(p => !p)} className={INPUT_ICON_RIGHT} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setStep('otp')} className={`flex-1 ${BTN_SECONDARY}`}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="submit" disabled={loading} className={BTN_PRIMARY_FLEX}>
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>) : 'Sign up'}
              </button>
            </div>
          </form>
        )}

        <p className={AUTH_FOOTER_TEXT}>
          Already have an account?{' '}
          <Link href="/login" className={AUTH_FOOTER_LINK}>Sign in</Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
