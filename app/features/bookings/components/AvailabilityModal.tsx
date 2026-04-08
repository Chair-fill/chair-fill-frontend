"use client";

import { useState, useEffect } from "react";
import { X, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { useTechnician, DaySchedule, Availability } from "@/app/providers/TechnicianProvider";
import { getApiErrorMessage } from "@/lib/api-client";
import { getAvailability, updateAvailability, type Weekday } from "@/lib/api/availability";

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DEFAULT_SCHEDULE: DaySchedule = {
  isOpen: true,
  from: "08:00",
  to: "20:00",
};

const INITIAL_AVAILABILITY: Availability = {
  monday: { ...DEFAULT_SCHEDULE },
  tuesday: { ...DEFAULT_SCHEDULE },
  wednesday: { ...DEFAULT_SCHEDULE },
  thursday: { ...DEFAULT_SCHEDULE },
  friday: { ...DEFAULT_SCHEDULE },
  saturday: { ...DEFAULT_SCHEDULE },
  sunday: { ...DEFAULT_SCHEDULE, isOpen: false },
};


export default function AvailabilityModal({ isOpen, onClose }: AvailabilityModalProps) {
  const { technician, refetchTechnician, isTechnicianLoading } = useTechnician();
  const technicianId = technician?.technician_id ?? technician?.id ?? "";
  const [availability, setAvailability] = useState<Availability>(INITIAL_AVAILABILITY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Hydrate the form when the modal opens. GET /availability/me (no date)
  // returns the full per-weekday schedule under data.availability.weekdays.
  useEffect(() => {
    if (!isOpen || !technicianId) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await getAvailability({ technician_id: technicianId });
        if (cancelled) return;
        const weekdays = res?.availability?.weekdays ?? {};
        const next: Availability = { ...INITIAL_AVAILABILITY };
        for (const day of DAYS) {
          const entry = weekdays[day];
          if (!entry) {
            next[day] = { ...DEFAULT_SCHEDULE, isOpen: day !== "sunday" };
            continue;
          }
          // Backend marks "closed" by storing 00:00–00:00.
          const isClosed =
            !entry.open_time ||
            !entry.close_time ||
            (entry.open_time === "00:00" && entry.close_time === "00:00");
          next[day] = {
            isOpen: !isClosed,
            from: isClosed ? DEFAULT_SCHEDULE.from : entry.open_time,
            to: isClosed ? DEFAULT_SCHEDULE.to : entry.close_time,
          };
        }
        setAvailability(next);
      } catch {
        // Leave the form on its defaults if the fetch fails — the user can
        // still edit and re-save.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, technicianId]);

  const handleToggleDay = (day: typeof DAYS[number]) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen },
    }));
    setError("");
    setSuccess(false);
  };

  const handleTimeChange = (day: typeof DAYS[number], field: "from" | "to", value: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    setError("");
    setSuccess(false);
  };

  const handleApplyToAll = (sourceDay: typeof DAYS[number]) => {
    const sourceSchedule = availability[sourceDay];
    const newAvailability = { ...availability };
    DAYS.forEach((day) => {
      newAvailability[day] = { ...sourceSchedule };
    });
    setAvailability(newAvailability);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      // Persist the per-day weekly schedule via the dedicated endpoint:
      // one PUT /availability/update per weekday using period: "day_of_week".
      // Closed days are sent as a zero-length window (00:00 - 00:00) so the
      // backend stores the closure rather than ignoring it.
      if (!technicianId) {
        throw new Error("Technician profile not loaded yet.");
      }
      for (const day of DAYS) {
        const schedule = availability[day];
        const dayWindow: [string, string] = schedule.isOpen
          ? [schedule.from, schedule.to]
          : ["00:00", "00:00"];
        await updateAvailability({
          technician_id: technicianId,
          period: "day_of_week",
          weekday: day as Weekday,
          availableTime: dayWindow,
        });
      }
      // Refetch the technician profile so any other surfaces that read it
      // (e.g. the calendar) pick up the change on next render.
      await refetchTechnician().catch(() => {});
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-none sm:rounded-3xl border-t sm:border border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-2xl">
              <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-50 tracking-tight">Working Hours</h2>
              <p className="text-sm text-zinc-500 font-medium">Set your weekly availability</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-all group"
          >
            <X className="w-6 h-6 text-zinc-500 group-hover:text-zinc-50" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-8 max-h-[70vh] overflow-y-auto space-y-4 scrollbar-hide">
            {DAYS.map((day) => (
              <div
                key={day}
                className={`p-3 sm:p-4 rounded-3xl border transition-all duration-300 ${
                  availability[day].isOpen
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-black/40 border-white/5 opacity-50 grayscale"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none ring-offset-black focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          availability[day].isOpen ? "bg-primary" : "bg-zinc-800"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                            availability[day].isOpen ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-lg font-bold capitalize text-zinc-100 tracking-wide">
                        {day}
                      </span>
                    </div>

                    {availability[day].isOpen ? (
                      <button
                        type="button"
                        onClick={() => handleApplyToAll(day)}
                        className="sm:hidden px-3 py-2 text-[10px] uppercase tracking-widest font-black text-primary bg-primary/10 rounded-xl transition-all active:scale-95"
                      >
                        Apply to All
                      </button>
                    ) : (
                      <span className="sm:hidden text-xs font-black text-red-500 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 uppercase tracking-widest">
                        Closed
                      </span>
                    )}
                  </div>

                  {availability[day].isOpen ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-black/60 rounded-xl p-1 border border-white/5 transition-colors">
                        <input
                          type="time"
                          value={availability[day].from}
                          onChange={(e) => handleTimeChange(day, "from", e.target.value)}
                          className="bg-transparent px-3 py-2 text-sm font-bold text-zinc-50 outline-none [color-scheme:dark] min-w-[100px]"
                        />
                        <span className="text-zinc-600 font-black text-[10px] uppercase">to</span>
                        <input
                          type="time"
                          value={availability[day].to}
                          onChange={(e) => handleTimeChange(day, "to", e.target.value)}
                          className="bg-transparent px-3 py-2 text-sm font-bold text-zinc-50 outline-none [color-scheme:dark] min-w-[100px]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyToAll(day)}
                        className="hidden sm:inline-flex px-4 py-2 text-[11px] uppercase tracking-widest font-black text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-95"
                      >
                        Apply to All
                      </button>
                    </div>
                  ) : (
                    <span className="hidden sm:inline-flex text-xs font-black text-red-500 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 uppercase tracking-widest">
                      Closed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 sm:p-8 border-t border-border bg-black/40 backdrop-blur-md flex flex-col gap-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-sm text-green-500">Working hours updated successfully!</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || isTechnicianLoading}
                className="flex-[2] px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Working Hours"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
