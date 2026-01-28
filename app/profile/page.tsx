'use client';

import { useState } from 'react';
import { useUser } from '@/app/providers/UserProvider';
import { User, Settings, Shield, Bell, CreditCard } from 'lucide-react';
import ProfileForm from '@/app/features/profile/components/ProfileForm';
import NotificationSettings from '@/app/features/profile/components/NotificationSettings';
import SecuritySettings from '@/app/features/profile/components/SecuritySettings';
import BillingSettings from '@/app/features/profile/components/BillingSettings';

type Tab = 'profile' | 'notifications' | 'billing' | 'security';

export default function ProfilePage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'billing' as const, label: 'Payment & Billing', icon: CreditCard },
    { id: 'security' as const, label: 'Security', icon: Shield },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-2">
              <Settings className="w-8 h-8 text-zinc-900 dark:text-zinc-50 shrink-0" />
              <h1 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                Account Settings
              </h1>
            </div>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
              Manage your profile, notifications, and security settings
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 mb-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center">
                  <span className="text-xl font-semibold text-white dark:text-zinc-900">
                    {user ? getInitials(user.name) : '?'}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                  {user?.name || 'Loading...'}
                </h2>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 truncate">{user?.email}</p>
                {user?.address && (
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-500 truncate">{user.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800">
              <nav className="flex flex-col sm:flex-row overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800 sm:divide-y-0 sm:divide-x sm:divide-zinc-200 dark:sm:divide-zinc-800">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex w-full sm:w-auto items-center justify-center sm:justify-start gap-2 px-4 py-3 sm:px-6 sm:py-4 text-sm font-medium transition-colors shrink-0 ${
                      activeTab === id
                        ? 'text-zinc-900 dark:text-zinc-50'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === 'profile' && <ProfileForm />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'billing' && <BillingSettings />}
              {activeTab === 'security' && <SecuritySettings />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
