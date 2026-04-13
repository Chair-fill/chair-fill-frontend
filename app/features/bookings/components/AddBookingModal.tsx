"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Mail, Phone, Clock, Loader2 } from "lucide-react";
import { useModalKeyboard, useModalScrollLock } from "@/lib/hooks/use-modal";
import { useTechnician, type Availability } from "@/app/providers/TechnicianProvider";
import { useContacts } from "@/app/providers/ContactsProvider";
import { listOfferings, type Offering } from "@/lib/api/offerings";
import { createBooking } from "@/lib/api/bookings";
import { createContact } from "@/lib/api/contacts";
import { getApiErrorMessage } from "@/lib/api-client";

const DAY_INDEX_TO_NAME: Record<number, keyof Availability> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a booking has been successfully created so the parent can refresh. */
  onCreated?: () => void | Promise<void>;
  selectedDate: Date;
  availability?: Availability;
}

/** Format HH:mm to 12-hour display (e.g. "09:00" → "9:00 AM"). */
function to12Hour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Format Date + HH:mm string into an ISO datetime string. */
function combineDateAndTime(date: Date, time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const local = new Date(date);
  local.setHours(hours || 0, minutes || 0, 0, 0);
  return local.toISOString();
}

export default function AddBookingModal({
  isOpen,
  onClose,
  onCreated,
  selectedDate,
  availability,
}: AddBookingModalProps) {
  const { technician } = useTechnician();
  const { contacts, refetchContactList } = useContacts();
  const technicianId = technician?.technician_id ?? technician?.id ?? "";

  type ClientMode = "existing" | "new";
  const [clientMode, setClientMode] = useState<ClientMode>("existing");

  const [formData, setFormData] = useState({
    contactId: "",
    offeringId: "",
    time: "10:00",
    newName: "",
    newEmail: "",
    newPhone: "",
  });

  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [shouldRender, setShouldRender] = useState(isOpen);
  // Animating out = currently rendered but the parent has flipped isOpen to false.
  const isAnimatingOut = shouldRender && !isOpen;

  // Sync shouldRender when isOpen flips to true via render-time state update.
  if (isOpen && !shouldRender) {
    setShouldRender(true);
  }

  useEffect(() => {
    if (isOpen || !shouldRender) return;
    const timer = setTimeout(() => setShouldRender(false), 400);
    return () => clearTimeout(timer);
  }, [isOpen, shouldRender]);

  // Default to "existing" only when the technician already has contacts;
  // otherwise drop straight into the "new client" form.
  useEffect(() => {
    if (!isOpen) return;
    setClientMode(contacts.length > 0 ? "existing" : "new");
  }, [isOpen, contacts.length]);

  // Load offerings whenever the modal opens for a technician.
  useEffect(() => {
    if (!isOpen || !technicianId) return;
    let cancelled = false;
    setLoadingMeta(true);
    setError("");
    listOfferings({ technician_id: technicianId, page_size: 100 })
      .then((offs) => {
        if (cancelled) return;
        setOfferings(offs);
        setFormData((prev) => ({
          ...prev,
          offeringId: prev.offeringId || offs[0]?.id || "",
          contactId: prev.contactId || contacts[0]?.id || "",
        }));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoadingMeta(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, technicianId, contacts]);

  // Derive the working-hours window for the currently selected date
  const dayName = DAY_INDEX_TO_NAME[selectedDate.getDay()];
  const daySchedule = availability?.[dayName];
  const minTime = daySchedule?.isOpen ? daySchedule.from : undefined;
  const maxTime = daySchedule?.isOpen ? daySchedule.to : undefined;

  // Clamp the default time into working hours when the selected date changes
  useEffect(() => {
    if (!minTime || !maxTime) return;
    setFormData((prev) => {
      if (prev.time < minTime) return { ...prev, time: minTime };
      if (prev.time > maxTime) return { ...prev, time: maxTime };
      return prev;
    });
  }, [selectedDate, minTime, maxTime]);

  useModalKeyboard(isOpen, onClose);
  useModalScrollLock(isOpen);

  if (!shouldRender) return null;

  const resetForm = () => {
    setFormData({
      contactId: contacts[0]?.id ?? "",
      offeringId: offerings[0]?.id ?? "",
      time: "10:00",
      newName: "",
      newEmail: "",
      newPhone: "",
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!technicianId) {
      setError("Technician profile not loaded yet.");
      return;
    }
    if (!formData.offeringId) {
      setError("Please select a service.");
      return;
    }

    setSubmitting(true);
    try {
      let contactId = formData.contactId;

      if (clientMode === "new") {
        const name = formData.newName.trim();
        const email = formData.newEmail.trim();
        const phone = formData.newPhone.trim();
        if (!name) {
          setError("Please enter the client's name.");
          setSubmitting(false);
          return;
        }
        if (!email && !phone) {
          setError("Please enter an email or phone number for the new client.");
          setSubmitting(false);
          return;
        }
        const created = await createContact(
          { name, email, phone },
          technicianId,
        );
        contactId = created.id;
        // Refresh the global contacts list so the new client shows up next time.
        refetchContactList().catch(() => {});
      } else if (!contactId) {
        setError("Please select a client or add a new one.");
        setSubmitting(false);
        return;
      }

      await createBooking(technicianId, {
        services: [{ id: formData.offeringId, units: 1 }],
        client: { contact_id: contactId },
        date: combineDateAndTime(selectedDate, formData.time),
      });
      await onCreated?.();
      resetForm();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 ${isAnimatingOut ? "animate-fade-out" : "animate-fade-in"}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div
        className={`relative bg-card rounded-none border-t sm:border border-border shadow-2xl w-full max-w-md overflow-hidden ${
          isAnimatingOut ? "animate-slide-down" : "animate-slide-up"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add Appointment</h2>
            <p className="text-sm text-foreground/40 mt-1">
              Book a client into your calendar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-foreground/40" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto pb-32">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500">
              {error}
            </div>
          )}

          {loadingMeta && (
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading services...
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider ml-1">
                Client
              </label>
              <div className="inline-flex rounded-full bg-white/5 border border-white/10 p-0.5 text-[10px] font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setClientMode("existing")}
                  disabled={contacts.length === 0}
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    clientMode === "existing"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/60 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                  }`}
                >
                  Existing
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode("new")}
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    clientMode === "new"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  New
                </button>
              </div>
            </div>

            {clientMode === "existing" ? (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 pointer-events-none" />
                <select
                  required
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [&>option]:bg-zinc-800 [&>option]:text-zinc-50"
                  value={formData.contactId}
                  onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                  disabled={contacts.length === 0}
                >
                  {contacts.length === 0 ? (
                    <option value="">No contacts yet</option>
                  ) : (
                    contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || c.email || c.phone || c.id}
                      </option>
                    ))
                  )}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    value={formData.newName}
                    onChange={(e) => setFormData({ ...formData, newName: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    value={formData.newEmail}
                    onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    value={formData.newPhone}
                    onChange={(e) => setFormData({ ...formData, newPhone: e.target.value })}
                  />
                </div>
                <p className="text-[11px] text-foreground/40 ml-1">
                  We&apos;ll save this client to your contacts so you can rebook them later.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider ml-1">
              Service
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 pointer-events-none" />
              <select
                required
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [&>option]:bg-zinc-800 [&>option]:text-zinc-50"
                value={formData.offeringId}
                onChange={(e) => setFormData({ ...formData, offeringId: e.target.value })}
                disabled={loadingMeta || offerings.length === 0}
              >
                {offerings.length === 0 ? (
                  <option value="">No services available</option>
                ) : (
                  offerings.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} — ${o.price} ({o.duration} min)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider ml-1">
              Time
            </label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
              <input
                required
                type="time"
                min={minTime}
                max={maxTime}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [color-scheme:dark]"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            {minTime && maxTime && (
              <p className="text-[11px] text-foreground/40 ml-1">
                Working hours: {to12Hour(minTime)} – {to12Hour(maxTime)}
              </p>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 bg-white/5 hover:bg-white/10 text-foreground font-bold py-4 rounded-xl transition-all border border-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingMeta || !technicianId}
              className="flex-1 bg-primary hover:opacity-90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Booking"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
