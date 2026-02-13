'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/providers/UserProvider';
import { getApiErrorMessage } from '@/lib/api-client';
import { User, Mail, Phone, Loader2, CheckCircle2 } from 'lucide-react';
import FormError from '@/app/components/ui/FormError';
import { FORM_LABEL, INPUT_LEFT_ICON, INPUT_ICON_LEFT, FORM_SUCCESS_BOX, FORM_SUCCESS_TEXT, BTN_PRIMARY_INLINE } from '@/lib/constants/ui';

export default function ProfileForm() {
  const { user, updateProfile, isLoading } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required');
      return;
    }

    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={FORM_LABEL}>
            First name
          </label>
          <div className="relative">
            <User className={INPUT_ICON_LEFT} />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className={INPUT_LEFT_ICON}
            />
          </div>
        </div>
        <div>
          <label className={FORM_LABEL}>
            Last name
          </label>
          <div className="relative">
            <User className={INPUT_ICON_LEFT} />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className={INPUT_LEFT_ICON}
            />
          </div>
        </div>
        <div>
          <label className={FORM_LABEL}>
            Phone Number
          </label>
          <div className="relative">
            <Phone className={INPUT_ICON_LEFT} />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              className={INPUT_LEFT_ICON}
            />
          </div>
        </div>

        <div>
          <label className={FORM_LABEL}>
            Email Address
          </label>
          <div className="relative">
            <Mail className={INPUT_ICON_LEFT} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={INPUT_LEFT_ICON}
            />
          </div>
        </div>
      </div>

      {error && (
        <FormError message={error} />
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-600 dark:text-green-400">Profile updated successfully!</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={BTN_PRIMARY_INLINE}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}
