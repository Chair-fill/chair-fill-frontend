'use client';

import { useState, useEffect } from 'react';
import { useTechnician } from '@/app/providers/TechnicianProvider';
import { getApiErrorMessage } from '@/lib/api-client';
import { User, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import FormError from '@/app/components/ui/FormError';
import { FORM_LABEL, INPUT_LEFT_ICON, INPUT_ICON_LEFT, INPUT_PLAIN, BTN_PRIMARY_INLINE } from '@/lib/constants/ui';
import { US_STATES } from '@/lib/constants/us-states';

export default function TechnicianProfileForm() {
  const { technician, updateTechnician, isTechnicianLoading } = useTechnician();
  const [nickName, setNickName] = useState('');
  const [workAddress, setWorkAddress] = useState('');
  const [state, setState] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const country = 'United States';

  useEffect(() => {
    if (technician) {
      setNickName(String(technician.nick_name ?? technician.full_name ?? '').trim());
      const addr = technician.address as { street?: string; country?: string; state?: string } | undefined;
      setWorkAddress(addr?.street ?? '');
      setState(addr?.state ?? '');
    }
  }, [technician]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'nickName') setNickName(value);
    if (name === 'workAddress') setWorkAddress(value);
    if (name === 'state') setState(value);
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const hasTechnician = technician != null;
    if (hasTechnician) {
      const addressTrimmed = workAddress.trim();
      if (!addressTrimmed) {
        setError('Work address is required.');
        return;
      }
      const stateTrimmed = state.trim();
      if (!stateTrimmed) {
        setError('Please select your state.');
        return;
      }
    }
    try {
      if (hasTechnician) {
        await updateTechnician({
          nick_name: nickName.trim() || undefined,
          address: {
            street: workAddress.trim(),
            country,
            state: state.trim(),
          },
        });
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const saving = isTechnicianLoading;

  if (technician == null && !isTechnicianLoading) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Complete barber onboarding to set up your work address.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Your barber/technician details — work address and how clients know you.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="technician-nickName" className={FORM_LABEL}>
            Nickname <span className="text-zinc-500 dark:text-zinc-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <User className={INPUT_ICON_LEFT} />
            <input
              id="technician-nickName"
              name="nickName"
              type="text"
              value={nickName}
              onChange={handleChange}
              placeholder="How clients know you"
              className={`${INPUT_LEFT_ICON} placeholder:text-zinc-400`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="technician-workAddress" className={FORM_LABEL}>
            Work address
          </label>
          <div className="relative">
            <MapPin className={INPUT_ICON_LEFT} />
            <input
              id="technician-workAddress"
              name="workAddress"
              type="text"
              autoComplete="street-address"
              value={workAddress}
              onChange={handleChange}
              placeholder="Work address"
              className={`${INPUT_LEFT_ICON} placeholder:text-zinc-400`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="technician-country" className={FORM_LABEL}>
            Country
          </label>
          <input
            id="technician-country"
            name="country"
            type="text"
            value={country}
            readOnly
            className={`${INPUT_PLAIN} bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed text-zinc-500 dark:text-zinc-400`}
          />
        </div>
        <div>
          <label htmlFor="technician-state" className={FORM_LABEL}>
            State
          </label>
          <select
            id="technician-state"
            name="state"
            value={state}
            onChange={handleChange}
            required
            className="w-full py-2.5 pl-10 pr-4 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
          >
            <option value="">Select your state</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <FormError message={error} />}
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-600 dark:text-green-400">Technician profile updated.</p>
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={BTN_PRIMARY_INLINE}>
          {saving ? (
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

