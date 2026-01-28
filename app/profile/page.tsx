'use client';

import { useState } from 'react';
import { useUser } from '@/app/providers/UserProvider';
import { User, Settings, Shield, Bell } from 'lucide-react';
import ProfileForm from '@/app/features/profile/components/ProfileForm';
import NotificationSettings from '@/app/features/profile/components/NotificationSettings';
import SecuritySettings from '@/app/features/profile/components/SecuritySettings';

type Tab = 'profile' | 'notifications' | 'security';

export default function ProfilePage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
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
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <Settings className="w-8 h-8 text-zinc-900 dark:text-zinc-50" />
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                Account Settings
              </h1>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Manage your profile, notifications, and security settings
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-4">
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
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {user?.name || 'Loading...'}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">{user?.email}</p>
                {user?.address && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">{user.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800">
              <nav className="flex">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === id
                        ? 'border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50'
                        : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'profile' && <ProfileForm />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'security' && <SecuritySettings />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
