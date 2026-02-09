'use client';

import { useState, useRef } from 'react';
import { useUser } from '@/app/providers/UserProvider';
import { User, Settings, Shield, Bell, Camera, Trash2, Loader2 } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/api-client';
import ProfileForm from '@/app/features/profile/components/ProfileForm';
import NotificationSettings from '@/app/features/profile/components/NotificationSettings';
import SecuritySettings from '@/app/features/profile/components/SecuritySettings';

type Tab = 'profile' | 'notifications' | 'security';

export default function ProfilePage() {
  const { user, uploadProfilePicture, removeProfilePicture, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [pictureError, setPictureError] = useState('');
  const [pictureLoading, setPictureLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPictureError('');
    setPictureLoading(true);
    try {
      await uploadProfilePicture(file);
    } catch (err) {
      setPictureError(getApiErrorMessage(err));
    } finally {
      setPictureLoading(false);
      e.target.value = '';
    }
  };

  const handleRemovePicture = async () => {
    setPictureError('');
    setPictureLoading(true);
    try {
      await removeProfilePicture();
    } catch (err) {
      setPictureError(getApiErrorMessage(err));
    } finally {
      setPictureLoading(false);
    }
  };

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
            {pictureError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{pictureError}</p>
              </div>
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative shrink-0">
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePictureChange}
                  disabled={pictureLoading || isLoading}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={pictureLoading || isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pictureLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    {pictureLoading ? 'Uploading...' : 'Upload'}
                  </button>
                  {user?.avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePicture}
                      disabled={pictureLoading || isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                  {user?.name || 'Loading...'}
                </h2>
                {user?.address && (
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-500 truncate">{user.address}</p>
                )}
                {user?.phone && (
                  <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 truncate">{user.phone}</p>
                )}
                {user?.email && (
                  <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 truncate">{user.email}</p>
                )}
                {user?.imessageContact && (
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">
                    iMessage contact: <span className="font-medium text-zinc-700 dark:text-zinc-200">
                      {user.imessageContact === 'email' ? 'Email' : user.imessageContact === 'phone' ? 'Phone number' : user.imessageContact}
                    </span>
                  </p>
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
              {activeTab === 'security' && <SecuritySettings />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
