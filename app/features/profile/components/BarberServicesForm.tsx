'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTechnician } from '@/app/providers/TechnicianProvider';
import { Plus, Trash2, ClipboardList, Loader2, CheckCircle2 } from 'lucide-react';
import { INPUT_PLAIN, BTN_PRIMARY_INLINE } from '@/lib/constants/ui';
import { FORM_LABEL } from '@/lib/constants/ui';

const STORAGE_KEY_PREFIX = 'chairfill_barber_services_';

export interface BarberService {
  id: string;
  name: string;
  price: string;
  description?: string;
}

/** Accepts stored items (price may be missing for legacy data). */
function isBarberServiceShape(item: unknown): item is { id: string; name: string; price?: string; description?: string } {
  const s = item as { id?: string; name?: string };
  return item != null && typeof item === 'object' && typeof s.id === 'string' && typeof s.name === 'string';
}

function loadServices(technicianId: string): BarberService[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + technicianId);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isBarberServiceShape).map((s) => ({
      id: s.id,
      name: s.name,
      price: typeof s.price === 'string' ? s.price : '',
      description: typeof s.description === 'string' ? s.description : '',
    }));
  } catch {
    return [];
  }
}

function saveServices(technicianId: string, services: BarberService[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + technicianId, JSON.stringify(services));
  } catch {
    // ignore
  }
}

/** Keep only digits and at most one decimal point. */
function toNumericPrice(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const parts = trimmed.replace(/[^\d.]/g, '').split('.');
  if (parts.length === 1) return parts[0];
  return parts[0] + '.' + (parts.slice(1).join('').slice(0, 2));
}

/** Format stored numeric price for display with dollar sign (e.g. "25" -> "$25", "25.5" -> "$25.50"). */
function formatPriceDisplay(price: string): string {
  const num = price.trim().replace(/[^\d.]/g, '');
  if (!num) return '';
  const parsed = parseFloat(num);
  if (Number.isNaN(parsed)) return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(parsed);
}

export default function BarberServicesForm() {
  const { technician } = useTechnician();
  const [services, setServices] = useState<BarberService[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [addError, setAddError] = useState('');

  const technicianId = technician?.technician_id ?? technician?.id ?? '';

  const load = useCallback(() => {
    if (technicianId) setServices(loadServices(technicianId));
    else setServices([]);
  }, [technicianId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    const name = newName.trim();
    const price = newPrice.trim();
    if (!name) {
      setAddError('Service name is required.');
      return;
    }
    const numericPrice = toNumericPrice(price);
    if (!numericPrice) {
      setAddError('Price is required. Enter numbers only (e.g. 25 or 25.50).');
      return;
    }
    const id = `svc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setServices((prev) => [
      ...prev,
      { id, name, price: numericPrice, description: newDescription.trim() || undefined },
    ]);
    setNewName('');
    setNewPrice('');
    setNewDescription('');
  };

  const handleRemove = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveServices = async () => {
    if (!technicianId) return;
    const missingPrice = services.some((s) => !s.price?.trim());
    if (missingPrice) {
      setAddError('Every service must have a price. Add a price to all services before saving.');
      return;
    }
    setAddError('');
    setSaving(true);
    setSaveSuccess(false);
    try {
      saveServices(technicianId, services);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!technician) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Complete barber onboarding to add the services you offer.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Add the services you offer so clients know what you provide.
      </p>

      <form onSubmit={handleAdd} className="space-y-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label htmlFor="barber-service-name" className={FORM_LABEL}>
              Service name
            </label>
            <input
              id="barber-service-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Haircut, Beard trim"
              className={INPUT_PLAIN}
            />
          </div>
          <div>
            <label htmlFor="barber-service-price" className={FORM_LABEL}>
              Price
            </label>
            <input
              id="barber-service-price"
              type="text"
              inputMode="decimal"
              value={newPrice}
              onChange={(e) => setNewPrice(toNumericPrice(e.target.value))}
              placeholder="e.g. 25 or 25.50"
              className={INPUT_PLAIN}
            />
          </div>
        </div>
        <div>
          <label htmlFor="barber-service-desc" className={FORM_LABEL}>
            Description <span className="text-zinc-500 font-normal">(optional)</span>
          </label>
          <textarea
            id="barber-service-desc"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Short description of the service"
            rows={2}
            className={`${INPUT_PLAIN} resize-y min-h-[60px]`}
          />
        </div>
        <button
          type="submit"
          disabled={!newName.trim() || !toNumericPrice(newPrice)}
          className={BTN_PRIMARY_INLINE}
        >
          <Plus className="w-4 h-4" />
          Add service
        </button>
      </form>

      {services.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-6 text-center">
          <ClipboardList className="w-10 h-10 mx-auto text-zinc-400 dark:text-zinc-500 mb-2" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No services added yet. Add one above.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {services.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{s.name}</span>
                <span className="mx-2 text-zinc-400 dark:text-zinc-500">—</span>
                <span className="text-zinc-600 dark:text-zinc-400">{formatPriceDisplay(s.price)}</span>
                {s.description && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{s.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(s.id)}
                className="p-1.5 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors shrink-0"
                aria-label={`Remove ${s.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {services.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Add or remove services, then save to keep changes.
          </p>
          <button
            type="button"
            onClick={handleSaveServices}
            disabled={saving}
            className={BTN_PRIMARY_INLINE}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved
              </>
            ) : (
              'Save services'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
