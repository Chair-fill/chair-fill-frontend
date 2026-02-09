'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
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
} from '@/lib/constants/ui';

type Step = 'request' | 'otp' | 'password';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [field, setField] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const emailTrimmed = field.trim().toLowerCase();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.post(API.AUTH.FORGOT_PASSWORD_VERIFY, {
        field: emailTrimmed,
        strategy: 'otp',
      });
      const nextToken = getResponseToken(data);
      if (nextToken) {
        setToken(nextToken);
        setStep('otp');
      } else {
        setError('Check your email for the verification code.');
        setStep('otp');
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) {
      setError('Enter the verification code');
      return;
    }
    setIsLoading(true);
    try {
      await api.post(API.AUTH.FORGOT_PASSWORD_OTP_VERIFY, {
        field: field.trim(),
        otp: otp.trim(),
        token,
      });
      setStep('password');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await api.post(API.AUTH.FORGOT_PASSWORD_UPDATE, {
        field: field.trim(),
        otp: otp.trim(),
        token,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Reset password
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {step === 'request' && "Enter your email and we'll send you a verification code."}
            {step === 'otp' && 'Enter the code we sent to your email.'}
            {step === 'password' && 'Enter your new password below.'}
          </p>
        </div>

      <AuthCard>
          {success ? (
            <div className="text-center py-4">
              <p className="text-green-600 dark:text-green-400 font-medium">Password reset successfully.</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Redirecting to sign in...</p>
            </div>
          ) : step === 'request' ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              {error && <FormError message={error} />}
              <div>
                <label htmlFor="field" className={FORM_LABEL}>Email address</label>
                <div className="relative">
                  <Mail className={INPUT_ICON_LEFT} />
                  <input id="field" name="field" type="email" autoComplete="email" required value={field} onChange={e => { setField(e.target.value); setError(''); }} placeholder="you@example.com" className={INPUT_LEFT_ICON} />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className={BTN_PRIMARY}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send verification code'}
              </button>
            </form>
          ) : step === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {error && <FormError message={error} />}
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Code sent to <span className="font-medium text-zinc-900 dark:text-zinc-50">{field}</span></p>
              <div>
                <label htmlFor="otp" className={FORM_LABEL}>Verification code</label>
                <input id="otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={e => { setOtp(e.target.value); setError(''); }} placeholder="123456" className={INPUT_PLAIN} />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep('request')} className={`flex-1 ${BTN_SECONDARY}`}>Back</button>
                <button type="submit" disabled={isLoading} className={BTN_PRIMARY_FLEX}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {error && <FormError message={error} />}
              <div>
                <label htmlFor="newPassword" className={FORM_LABEL}>New password</label>
                <div className="relative">
                  <Lock className={INPUT_ICON_LEFT} />
                  <input id="newPassword" name="newPassword" type={showNewPassword ? 'text' : 'password'} autoComplete="new-password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(''); }} placeholder="••••••••" className={INPUT_LEFT_RIGHT_ICON} />
                  <button type="button" onClick={() => setShowNewPassword(p => !p)} className={INPUT_ICON_RIGHT} aria-label={showNewPassword ? 'Hide password' : 'Show password'}>
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">At least 8 characters</p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className={FORM_LABEL}>Confirm new password</label>
                <div className="relative">
                  <Lock className={INPUT_ICON_LEFT} />
                  <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }} placeholder="••••••••" className={INPUT_LEFT_RIGHT_ICON} />
                  <button type="button" onClick={() => setShowConfirmPassword(p => !p)} className={INPUT_ICON_RIGHT} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep('otp')} className={`flex-1 ${BTN_SECONDARY}`}>Back</button>
                <button type="submit" disabled={isLoading} className={BTN_PRIMARY_FLEX}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset password'}
                </button>
              </div>
            </form>
          )}
      </AuthCard>
    </AuthLayout>
  );
}
