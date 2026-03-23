"use client";

import { useState, useEffect, useCallback } from "react";
import { useTechnician } from "@/app/providers/TechnicianProvider";
import { useProgress } from "@/app/providers/ProgressProvider";
import PageLoader from "@/app/components/ui/PageLoader";
import {
  formatPriceDisplay,
  toNumericPrice,
  type BarberService,
} from "@/app/features/profile/components/BarberServicesForm";
import {
  listOfferings,
  createOffering,
  updateOffering,
  deleteOffering,
} from "@/lib/api/offerings";
import {
  Plus,
  Pencil,
  Trash2,
  ClipboardList,
  Loader2,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { FORM_LABEL } from "@/lib/constants/ui";
import RichText from "@/app/components/ui/RichText";
import { useModalKeyboard, useModalScrollLock } from "@/lib/hooks/use-modal";

const INPUT_BASE =
  "w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent text-sm";

const DURATION_OPTIONS = [
  { value: "", label: "Select duration" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1 hr 30 min" },
  { value: "120", label: "2 hours" },
];

function formatDuration(value: string): string {
  const opt = DURATION_OPTIONS.find((o) => o.value === value);
  return opt ? opt.label : value ? `${value} min` : "—";
}

/** Map API offering to BarberService for UI. */
function offeringToService(o: {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  premium_hours?: { slots?: unknown[] };
  promo?: { enabled?: boolean };
}): BarberService {
  return {
    id: o.id,
    name: o.name,
    price: String(o.price),
    duration: String(o.duration),
    description: o.description ?? undefined,
    premiumHours:
      !!o.premium_hours &&
      (Array.isArray((o.premium_hours as { slots?: unknown[] }).slots)
        ? (o.premium_hours as { slots: unknown[] }).slots.length >= 0
        : true),
    offerPromotion: !!o.promo?.enabled,
    premiumFrom: (o.premium_hours as any)?.slots?.[0]?.from,
    premiumTo: (o.premium_hours as any)?.slots?.[0]?.to,
    premiumPrice: (o.premium_hours as any)?.slots?.[0]?.price !== undefined ? String((o.premium_hours as any).slots[0].price) : undefined,
    promoFrom: (o.promo as any)?.from,
    promoTo: (o.promo as any)?.to,
    promoPrice: (o.promo as any)?.price !== undefined ? String((o.promo as any).price) : undefined,
  };
}

export default function ServicesPage() {
  const { technician, isTechnicianLoading, refetchTechnician } =
    useTechnician();
  const { progress } = useProgress();
  const technicianId = technician?.technician_id ?? technician?.id ?? "";

  const [services, setServices] = useState<BarberService[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [premiumHours, setPremiumHours] = useState(false);
  const [premiumFrom, setPremiumFrom] = useState("19:00");
  const [premiumTo, setPremiumTo] = useState("21:00");
  const [premiumPrice, setPremiumPrice] = useState("");
  const [offerPromotion, setOfferPromotion] = useState(false);
  const [promoFrom, setPromoFrom] = useState("11:00");
  const [promoTo, setPromoTo] = useState("13:00");
  const [promoPrice, setPromoPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmRemoveName, setConfirmRemoveName] = useState("");

  const load = useCallback(async () => {
    if (!technicianId) {
      setServices([]);
      setListLoading(false);
      return;
    }
    setListLoading(true);
    setListError("");
    try {
      const offerings = await listOfferings({
        technician_id: technicianId,
        page_size: 100,
      });
      setServices(offerings.map(offeringToService));
    } catch (err) {
      setListError(
        err instanceof Error ? err.message : "Failed to load services.",
      );
      setServices([]);
    } finally {
      setListLoading(false);
    }
  }, [technicianId]);

  useEffect(() => {
    load();
  }, [load]);

  // Clear success message after delay
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const clearForm = useCallback(() => {
    setName("");
    setPrice("");
    setDuration("");
    setDescription("");
    setPremiumHours(false);
    setPremiumFrom("19:00");
    setPremiumTo("21:00");
    setPremiumPrice("");
    setOfferPromotion(false);
    setPromoFrom("11:00");
    setPromoTo("13:00");
    setPromoPrice("");
    setEditingId(null);
    setFormError("");
  }, []);

  const handleAddOrUpdate = async (
    e: React.FormEvent,
    onSuccess?: () => void,
  ) => {
    e.preventDefault();
    setFormError("");
    const trimmedName = name.trim();
    const numericPrice = toNumericPrice(price);
    if (!trimmedName) {
      setFormError("Service name is required.");
      return;
    }
    if (!numericPrice) {
      setFormError("Price is required. Use numbers only (e.g. 25 or 25.50).");
      return;
    }
    const priceNum = parseFloat(numericPrice);
    const durationNum = duration.trim() ? parseInt(duration.trim(), 10) : 30;
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setFormError("Enter a valid price.");
      return;
    }
    if (Number.isNaN(durationNum) || durationNum < 5) {
      setFormError("Duration must be at least 5 minutes.");
      return;
    }
    if (!technicianId) {
      setFormError("Technician profile not found.");
      return;
    }
    setSaving(true);
    try {
      const promoPayload = offerPromotion
        ? {
            discount: 0,
            price: promoPrice ? parseFloat(promoPrice) : undefined,
            from: promoFrom || undefined,
            to: promoTo || undefined,
            enabled: true,
            expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10),
          }
        : undefined;
      const premiumPayload = premiumHours
        ? {
            slots: [
              {
                from: premiumFrom,
                to: premiumTo,
                price: premiumPrice ? parseFloat(premiumPrice) : undefined,
              },
            ],
          }
        : undefined;
      if (editingId && editingId.startsWith("OFF-")) {
        await updateOffering({
          offering_id: editingId,
          name: trimmedName,
          price: priceNum,
          duration: durationNum,
          description: description.trim() || undefined,
          promo_enabled: offerPromotion,
          promo: promoPayload,
          premium_hours: premiumPayload,
        });
      } else {
        await createOffering({
          name: trimmedName,
          price: priceNum,
          duration: durationNum,
          description: description.trim() || undefined,
          technician_id: technicianId,
          premium_hours: premiumPayload,
          promo: promoPayload,
        });
      }
      await load();
      clearForm();
      setSuccessMessage(editingId ? "Service updated." : "Service added.");
      onSuccess?.();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save service.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s: BarberService) => {
    setName(s.name);
    setPrice(s.price);
    setDuration(s.duration ?? "");
    setDescription(s.description ?? "");
    setPremiumHours(s.premiumHours ?? false);
    setPremiumFrom(s.premiumFrom ?? "19:00");
    setPremiumTo(s.premiumTo ?? "21:00");
    setPremiumPrice(s.premiumPrice ?? "");
    setOfferPromotion(s.offerPromotion ?? false);
    setPromoFrom(s.promoFrom ?? "11:00");
    setPromoTo(s.promoTo ?? "13:00");
    setPromoPrice(s.promoPrice ?? "");
    setEditingId(s.id);
    setFormError("");
    // Only open modal on mobile (sm breakpoint = 640px); on desktop form is inline, avoid locking body scroll
    if (typeof window !== "undefined" && window.innerWidth < 640)
      setMobileModalOpen(true);
  };

  const handleRemoveClick = (id: string, name: string) => {
    setConfirmRemoveId(id);
    setConfirmRemoveName(name);
  };

  const handleRemoveConfirm = async () => {
    const id = confirmRemoveId;
    if (!id) return;
    setConfirmRemoveId(null);
    setConfirmRemoveName("");
    if (editingId === id) clearForm();
    if (id.startsWith("OFF-")) {
      setDeletingId(id);
      setListError("");
      try {
        await deleteOffering(id);
        await load();
        setSuccessMessage("Service removed.");
      } catch (err) {
        setListError(
          err instanceof Error ? err.message : "Failed to delete service.",
        );
      } finally {
        setDeletingId(null);
      }
    } else {
      setServices((prev) => prev.filter((s) => s.id !== id));
      setSuccessMessage("Service removed.");
    }
  };

  useModalKeyboard(mobileModalOpen, () => setMobileModalOpen(false));
  useModalScrollLock(mobileModalOpen);

  if (isTechnicianLoading) {
    return <PageLoader message="Loading…" />;
  }

  if (!technician) {
    const isBarber = progress?.is_technician === true;
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black pt-12 sm:pt-24 pb-8">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto rounded-xl bg-card border border-border p-6 text-center">
            {isBarber ? (
              <>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  We couldn&apos;t load your barber profile. Please try again.
                </p>
                <button
                  type="button"
                  onClick={() => refetchTechnician()}
                  className="mt-4 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all"
                >
                  Try again
                </button>
              </>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Complete barber onboarding to add the services you offer.
              </p>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-4 sm:pt-8 pb-8">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header - full width */}
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Services
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Add the services you offer and their prices. Clients will see this
              when you share your link.
            </p>
            {successMessage && (
              <p
                className="mt-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400"
                role="status"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {successMessage}
              </p>
            )}
          </div>



          {/* Desktop: two columns - form left, list right */}
          <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start">
            {/* Add / Edit form (desktop only) - left column */}
            <section
              className="hidden sm:block flex-1 min-w-0 max-w-xl rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm shrink-0"
              aria-labelledby="add-service-heading"
            >
              <h2
                id="add-service-heading"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4"
              >
                {editingId ? "Edit service" : "Add a service"}
              </h2>
              {formError && (
                <p
                  className="mb-3 text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {formError}
                </p>
              )}
              <form
                onSubmit={(e) => handleAddOrUpdate(e)}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="service-name" className={FORM_LABEL}>
                    Name
                  </label>
                  <input
                    id="service-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Haircut, Beard trim"
                    className={INPUT_BASE}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label htmlFor="service-price" className={FORM_LABEL}>
                    Price
                  </label>
                  <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-50 focus-within:border-transparent">
                    <span className="flex items-center px-3 text-zinc-500 dark:text-zinc-400 text-sm border-r border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50">
                      $
                    </span>
                    <input
                      id="service-price"
                      type="text"
                      inputMode="decimal"
                      value={price}
                      onChange={(e) => setPrice(toNumericPrice(e.target.value))}
                      placeholder="0.00"
                      className="flex-1 px-3 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none text-sm min-w-0"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="service-duration" className={FORM_LABEL}>
                    Duration
                  </label>
                  <div className="relative">
                    <select
                      id="service-duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className={`${INPUT_BASE} appearance-none pr-10`}
                    >
                      {DURATION_OPTIONS.map((opt) => (
                        <option key={opt.value || "empty"} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="service-desc" className={FORM_LABEL}>
                    Description
                  </label>
                  <textarea
                    id="service-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description. Use line breaks for new lines, **bold** for bold, and - or * for lists."
                    rows={4}
                    className={`${INPUT_BASE} resize-y min-h-[100px]`}
                  />
                  <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    Formatting: new lines, <strong>**bold**</strong>, and lists
                    with{" "}
                    <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                      - item
                    </code>{" "}
                    or{" "}
                    <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                      * item
                    </code>
                  </p>
                </div>

                {/* Premium Hours toggle */}
                <div className="flex items-start justify-between gap-4 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      Premium Hours
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      Override the days and times you want this service to be
                      bookable.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={premiumHours}
                    onClick={() => setPremiumHours((v) => !v)}
                    className={`relative w-12 h-6 rounded-full transition-colors shrink-0 focus:outline-none ${
                      premiumHours
                        ? "bg-green-600 dark:bg-green-400"
                        : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        premiumHours ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {premiumHours && (
                  <div className="grid grid-cols-2 gap-4 p-4 border border-border bg-white/[0.02] rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">From</label>
                      <input
                        type="time"
                        value={premiumFrom}
                        onChange={(e) => setPremiumFrom(e.target.value)}
                        className={`${INPUT_BASE} [color-scheme:dark]`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">To</label>
                      <input
                        type="time"
                        value={premiumTo}
                        onChange={(e) => setPremiumTo(e.target.value)}
                        className={`${INPUT_BASE} [color-scheme:dark]`}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">Premium Price</label>
                      <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-50 focus-within:border-transparent">
                        <span className="flex items-center px-3 text-zinc-500 dark:text-zinc-400 text-sm border-r border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={premiumPrice}
                          onChange={(e) => setPremiumPrice(toNumericPrice(e.target.value))}
                          placeholder="80.00"
                          className="flex-1 px-3 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none text-sm min-w-0"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Offer Promotion toggle */}
                <div className="flex items-start justify-between gap-4 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      Offer Promotion
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      Offer this service at a discount for a certain period of
                      time.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={offerPromotion}
                    onClick={() => setOfferPromotion((v) => !v)}
                    className={`relative w-12 h-6 rounded-full transition-colors shrink-0 focus:outline-none ${
                      offerPromotion
                        ? "bg-green-600 dark:bg-green-400"
                        : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        offerPromotion ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {offerPromotion && (
                  <div className="grid grid-cols-2 gap-4 p-4 border border-border bg-white/[0.02] rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">From</label>
                      <input
                        type="time"
                        value={promoFrom}
                        onChange={(e) => setPromoFrom(e.target.value)}
                        className={`${INPUT_BASE} [color-scheme:dark]`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">To</label>
                      <input
                        type="time"
                        value={promoTo}
                        onChange={(e) => setPromoTo(e.target.value)}
                        className={`${INPUT_BASE} [color-scheme:dark]`}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">Promotion Price</label>
                      <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-50 focus-within:border-transparent">
                        <span className="flex items-center px-3 text-zinc-500 dark:text-zinc-400 text-sm border-r border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={promoPrice}
                          onChange={(e) => setPromoPrice(toNumericPrice(e.target.value))}
                          placeholder="35.00"
                          className="flex-1 px-3 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none text-sm min-w-0"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving || !name.trim() || !toNumericPrice(price)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none transition-all"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update service"
                        : "Add service"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={clearForm}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* List - right column on desktop */}
            <section
              aria-labelledby="services-list-heading"
              className="flex-1 min-w-0 w-full"
            >
              <h2
                id="services-list-heading"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3"
              >
                Your services ({services.length})
              </h2>
              {listError && (
                <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
                  <p
                    className="text-sm text-red-600 dark:text-red-400 flex-1"
                    role="alert"
                  >
                    {listError}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setListError("");
                      load();
                    }}
                    className="text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:underline shrink-0"
                  >
                    Try again
                  </button>
                </div>
              )}
              {listLoading ? (
                <div className="rounded-2xl border border-border bg-card p-8 flex items-center justify-center">
                  <Loader2
                    className="w-8 h-8 animate-spin text-zinc-400"
                    aria-hidden
                  />
                </div>
              ) : services.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-8 text-center">
                  <ClipboardList
                    className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3"
                    aria-hidden
                  />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    No services yet
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    <span className="hidden sm:inline">
                      Use the form above to add your first service.
                    </span>
                    <span className="sm:hidden">
                      Tap + to add your first service.
                    </span>
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {services.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-2xl border border-border bg-card px-4 py-3 flex flex-row flex-wrap sm:flex-nowrap sm:items-center justify-between gap-3 shadow-sm"
                    >
                      {confirmRemoveId === s.id ? (
                        <>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 flex-1 min-w-0">
                            Remove{" "}
                            <strong>{confirmRemoveName || s.name}</strong>?
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmRemoveId(null);
                                setConfirmRemoveName("");
                              }}
                              className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveConfirm()}
                              className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="min-w-0 flex-1 w-full sm:w-auto">
                            {/* Row 1: name + actions (same row on mobile); on desktop name is here, actions in column 2 */}
                            <div className="flex flex-row items-center gap-2 sm:block">
                              <p className="font-medium text-zinc-900 dark:text-zinc-50 min-w-0 flex-1 truncate sm:truncate-none">
                                {s.name}
                              </p>
                              <div className="flex items-center gap-1 shrink-0 sm:hidden">
                                {editingId !== s.id && (
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(s)}
                                    disabled={deletingId !== null}
                                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                    aria-label={`Edit ${s.name}`}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveClick(s.id, s.name)
                                  }
                                  disabled={deletingId !== null}
                                  className="p-2 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                  aria-label={`Remove ${s.name}`}
                                >
                                  {deletingId === s.id ? (
                                    <Loader2
                                      className="w-4 h-4 animate-spin"
                                      aria-hidden
                                    />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 sm:mt-0">
                              <span>
                                {formatPriceDisplay(s.price)}
                                {s.duration && (
                                  <span className="text-zinc-500 dark:text-zinc-500">
                                    {" "}
                                    · {formatDuration(s.duration)}
                                  </span>
                                )}
                              </span>
                            </p>
                            {s.description && (
                              <div className="mt-1">
                                <RichText
                                  text={s.description}
                                  className="text-zinc-500 dark:text-zinc-500"
                                />
                              </div>
                            )}
                            {(s.premiumHours || s.offerPromotion) && (
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {s.premiumHours && (
                                  <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                                    Premium hours
                                  </span>
                                )}
                                {s.offerPromotion && (
                                  <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
                                    Promotion
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="hidden sm:flex items-center gap-1 shrink-0">
                            {editingId !== s.id && (
                              <button
                                type="button"
                                onClick={() => handleEdit(s)}
                                disabled={deletingId !== null}
                                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                aria-label={`Edit ${s.name}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveClick(s.id, s.name)}
                              disabled={deletingId !== null}
                              className="p-2 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                              aria-label={`Remove ${s.name}`}
                            >
                              {deletingId === s.id ? (
                                <Loader2
                                  className="w-4 h-4 animate-spin"
                                  aria-hidden
                                />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          {/* End desktop two-column: form left, list right */}

          {/* Mobile-only modal: Add/Edit service form */}
          <div className="sm:hidden">
            {mobileModalOpen && (
              <div className="fixed inset-0 z-50 flex flex-col bg-background">
                <div className="flex items-center justify-between shrink-0 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileModalOpen(false);
                      clearForm();
                    }}
                    className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    Cancel
                  </button>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {editingId ? "Edit service" : "Add service"}
                  </h2>
                  <div className="w-14" />
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {formError && (
                    <p
                      className="mb-3 text-sm text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      {formError}
                    </p>
                  )}
                  <form
                    onSubmit={(e) =>
                      handleAddOrUpdate(e, () => setMobileModalOpen(false))
                    }
                    className="space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="modal-service-name"
                        className={FORM_LABEL}
                      >
                        Name
                      </label>
                      <input
                        id="modal-service-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Haircut, Beard trim"
                        className={INPUT_BASE}
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="modal-service-price"
                        className={FORM_LABEL}
                      >
                        Price
                      </label>
                      <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-50">
                        <span className="flex items-center px-3 text-zinc-500 dark:text-zinc-400 text-sm border-r border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50">
                          $
                        </span>
                        <input
                          id="modal-service-price"
                          type="text"
                          inputMode="decimal"
                          value={price}
                          onChange={(e) =>
                            setPrice(toNumericPrice(e.target.value))
                          }
                          placeholder="0.00"
                          className="flex-1 px-3 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 text-sm min-w-0 focus:outline-none"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="modal-service-duration"
                        className={FORM_LABEL}
                      >
                        Duration
                      </label>
                      <div className="relative">
                        <select
                          id="modal-service-duration"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className={`${INPUT_BASE} appearance-none pr-10`}
                        >
                          {DURATION_OPTIONS.map((opt) => (
                            <option
                              key={opt.value || "empty"}
                              value={opt.value}
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="modal-service-desc"
                        className={FORM_LABEL}
                      >
                        Description
                      </label>
                      <textarea
                        id="modal-service-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Short description. Use line breaks, **bold**, - or * for lists."
                        rows={4}
                        className={`${INPUT_BASE} resize-y min-h-[100px]`}
                      />
                    </div>
                    <div className="flex items-start justify-between gap-4 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          Premium Hours
                        </p>
                        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                          Override the days and times you want this service to
                          be bookable.
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={premiumHours}
                        onClick={() => setPremiumHours((v) => !v)}
                        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 focus:outline-none ${premiumHours ? "bg-green-600 dark:bg-green-400" : "bg-zinc-300 dark:bg-zinc-700"}`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${premiumHours ? "left-7" : "left-1"}`}
                        />
                      </button>
                    </div>

                    {premiumHours && (
                      <div className="grid grid-cols-2 gap-4 p-4 border border-border bg-white/[0.02] rounded-xl">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">From</label>
                          <input
                            type="time"
                            value={premiumFrom}
                            onChange={(e) => setPremiumFrom(e.target.value)}
                            className={`${INPUT_BASE} [color-scheme:dark]`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">To</label>
                          <input
                            type="time"
                            value={premiumTo}
                            onChange={(e) => setPremiumTo(e.target.value)}
                            className={`${INPUT_BASE} [color-scheme:dark]`}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">Premium Price</label>
                          <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-50 focus-within:border-transparent">
                            <span className="flex items-center px-3 text-zinc-500 dark:text-zinc-400 text-sm border-r border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={premiumPrice}
                              onChange={(e) => setPremiumPrice(toNumericPrice(e.target.value))}
                              placeholder="80.00"
                              className="flex-1 px-3 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none text-sm min-w-0"
                              autoComplete="off"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          Offer Promotion
                        </p>
                        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                          Offer this service at a discount for a certain period
                          of time.
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={offerPromotion}
                        onClick={() => setOfferPromotion((v) => !v)}
                        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 focus:outline-none ${offerPromotion ? "bg-green-600 dark:bg-green-400" : "bg-zinc-300 dark:bg-zinc-700"}`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${offerPromotion ? "left-7" : "left-1"}`}
                        />
                      </button>
                    </div>

                    {offerPromotion && (
                      <div className="grid grid-cols-2 gap-4 p-4 border border-border bg-white/[0.02] rounded-xl">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">From</label>
                          <input
                            type="time"
                            value={promoFrom}
                            onChange={(e) => setPromoFrom(e.target.value)}
                            className={`${INPUT_BASE} [color-scheme:dark]`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">To</label>
                          <input
                            type="time"
                            value={promoTo}
                            onChange={(e) => setPromoTo(e.target.value)}
                            className={`${INPUT_BASE} [color-scheme:dark]`}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">Promotion Price</label>
                          <div className="flex rounded-lg border border-border bg-white dark:bg-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-50 focus-within:border-transparent">
                            <span className="flex items-center px-3 text-zinc-500 dark:text-zinc-400 text-sm border-r border-border bg-zinc-50 dark:bg-zinc-800/50">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={promoPrice}
                              onChange={(e) => setPromoPrice(toNumericPrice(e.target.value))}
                              placeholder="35.00"
                              className="flex-1 px-3 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none text-sm min-w-0"
                              autoComplete="off"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => {
                            clearForm();
                            setMobileModalOpen(false);
                          }}
                          className="flex-1 flex items-center justify-center p-3 rounded-full text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800"
                          aria-label="Cancel"
                        >
                          <ChevronDown className="w-5 h-5 rotate-180 sm:rotate-0" />
                          <span className="hidden sm:inline ml-2 text-sm font-medium">Cancel</span>
                        </button>
                      )}
                        <button
                          type="submit"
                          disabled={
                            saving || !name.trim() || !toNumericPrice(price)
                          }
                          className="flex-1 inline-flex items-center justify-center p-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                          aria-label={editingId ? "Update service" : "Add service"}
                        >
                          {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Plus className={`w-5 h-5 ${editingId ? "rotate-45" : ""}`} />
                          )}
                          <span className="hidden sm:inline ml-2 text-sm font-bold">
                            {editingId ? "Update service" : "Add service"}
                          </span>
                        </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
          {/* Global FAB for Services (Mobile Only) */}
          <button
            type="button"
            onClick={() => setMobileModalOpen(true)}
            className="fixed bottom-24 right-6 z-40 sm:hidden flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground hover:opacity-90 shadow-2xl active:scale-95 transition-all"
            aria-label="Add service"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
      </main>
    </div>
  );
}
