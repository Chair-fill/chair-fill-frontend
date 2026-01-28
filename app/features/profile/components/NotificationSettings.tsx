'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/providers/UserProvider';
import { Bell, Mail, MessageSquare, Megaphone, Loader2, CheckCircle2 } from 'lucide-react';
import type { NotificationPreferences } from '@/lib/types/user';

export default function NotificationSettings() {
  const { user, updateNotifications, isLoading } = useUser();
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    marketing: false,
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.notifications) {
      setPrefs(user.notifications);
    }
  }, [user]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      await updateNotifications(prefs);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update notifications:', error);
    }
  };

  const toggleItems = [
    {
      key: 'email' as const,
      icon: Mail,
      title: 'Email Notifications',
      description: 'Receive email updates about your contacts and outreach campaigns',
    },
    {
      key: 'sms' as const,
      icon: MessageSquare,
      title: 'SMS Notifications',
      description: 'Get text messages for important updates and alerts',
    },
    {
      key: 'marketing' as const,
      icon: Megaphone,
      title: 'Marketing Emails',
      description: 'Receive tips, product updates, and promotional offers',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Notification Preferences
        </h3>
      </div>

      <div className="space-y-4">
        {toggleItems.map(({ key, icon: Icon, title, description }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mt-0.5" />
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{title}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle(key)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                prefs[key]
                  ? 'bg-zinc-900 dark:bg-zinc-50'
                  : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white dark:bg-zinc-900 transition-transform ${
                  prefs[key] ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-600 dark:text-green-400">Preferences saved!</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </div>
  );
}
