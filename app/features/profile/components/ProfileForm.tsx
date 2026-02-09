'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/providers/UserProvider';
import { getApiErrorMessage } from '@/lib/api-client';
import { User, Mail, Phone, MapPin, Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import FormError from '@/app/components/ui/FormError';
import { FORM_LABEL, INPUT_LEFT_ICON, INPUT_ICON_LEFT, FORM_SUCCESS_BOX, FORM_SUCCESS_TEXT, BTN_PRIMARY_INLINE } from '@/lib/constants/ui';

export default function ProfileForm() {
  const { user, updateProfile, isLoading } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    imessageContact: '' as '' | 'email' | 'phone',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        imessageContact: (user.imessageContact === 'email' || user.imessageContact === 'phone') ? user.imessageContact : '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.name.trim()) {
      setError('Name is required');
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
            Full Name
          </label>
          <div className="relative">
            <User className={INPUT_ICON_LEFT} />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={INPUT_LEFT_ICON}
            />
          </div>
        </div>

        <div>
          <label className={FORM_LABEL}>
            Work address
          </label>
          <div className="relative">
            <MapPin className={INPUT_ICON_LEFT} />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, State, ZIP"
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

        <div>
          <label htmlFor="imessageContact" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            iMessage contact
          </label>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
            <select
              id="imessageContact"
              name="imessageContact"
              value={formData.imessageContact}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 appearance-none"
            >
              <option value="">Select...</option>
              <option value="email">Email</option>
              <option value="phone">Phone number</option>
            </select>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Which contact info do you use for iMessage?
          </p>
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
