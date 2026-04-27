"use client";

import { useState, useEffect } from "react";
import { X, Clock, Loader2, CheckCircle2, Plus, Trash2, CalendarDays } from "lucide-react";
import { useTechnician, DaySchedule, Availability } from "@/app/providers/TechnicianProvider";
import { getApiErrorMessage } from "@/lib/api-client";
import { clearWeeklyAvailabilityCache, updateAvailability, fetchWeeklyAvailability, getAvailability, type Weekday } from "@/lib/api/availability";
import type { CalendarDailyEntry } from "@/lib/api/calendar";

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAvailability?: Availability;
  dailyEntries?: Record<string, CalendarDailyEntry>;
}

/** Convert minutes-from-midnight to "HH:mm" */
function minutesToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type Tab = "weekly" | "date-specific";

const DAYS = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
] as const;

const DEFAULT_SCHEDULE: DaySchedule = { isOpen: true, from: "08:00", to: "20:00" };

const INITIAL_AVAILABILITY: Availability = {
  monday: { ...DEFAULT_SCHEDULE },
  tuesday: { ...DEFAULT_SCHEDULE },
  wednesday: { ...DEFAULT_SCHEDULE },
  thursday: { ...DEFAULT_SCHEDULE },
  friday: { ...DEFAULT_SCHEDULE },
  saturday: { ...DEFAULT_SCHEDULE },
  sunday: { ...DEFAULT_SCHEDULE, isOpen: false },
};

interface DateOverride {
  date: string; // YYYY-MM-DD
  isOpen: boolean;
  from: string;
  to: string;
  off_times: [string, string][];
}

export default function AvailabilityModal({ isOpen, onClose, initialAvailability, dailyEntries = {} }: AvailabilityModalProps) {
  const { technician, refetchTechnician, isTechnicianLoading } = useTechnician();
  const technicianId = technician?.technician_id ?? technician?.id ?? "";
  const [tab, setTab] = useState<Tab>("weekly");
  const [availability, setAvailability] = useState<Availability>(INITIAL_AVAILABILITY);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [dirtyDays, setDirtyDays] = useState<Set<Weekday>>(new Set());
  const [dirtyOverrides, setDirtyOverrides] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && initialAvailability) {
      setAvailability(initialAvailability);
    }
  }, [isOpen, initialAvailability]);

  // Pre-fill overrides from calendar data
  useEffect(() => {
    if (isOpen && dailyEntries && Object.keys(dailyEntries).length > 0) {
      const existingOverrides: DateOverride[] = Object.entries(dailyEntries)
        .filter(([_, entry]) => entry.availability_modified)
        .map(([date, entry]) => ({
          date,
          isOpen: entry.open_time !== "00:00" || entry.close_time !== "00:00",
          from: entry.open_time === "00:00" && entry.close_time === "00:00" ? "09:00" : entry.open_time,
          to: entry.open_time === "00:00" && entry.close_time === "00:00" ? "18:00" : entry.close_time,
          off_times: (entry.availability.off_times || []).map(range => 
            [minutesToHHMM(range[0]), minutesToHHMM(range[1])] as [string, string]
          ),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      if (existingOverrides.length > 0) {
        setOverrides(existingOverrides);
        // We don't mark them as dirty because they are already saved on backend
        setDirtyOverrides(new Set());
      }
    }
  }, [isOpen, dailyEntries]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError("");
      setSuccess(false);
      setDirtyDays(new Set());
      setDirtyOverrides(new Set());
    }
  }, [isOpen]);

  // ── Weekly handlers ──
  const handleToggleDay = (day: typeof DAYS[number]) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen },
    }));
    setDirtyDays((prev) => new Set(prev).add(day));
    setError(""); setSuccess(false);
  };

  const handleTimeChange = (day: typeof DAYS[number], field: "from" | "to", value: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    setDirtyDays((prev) => new Set(prev).add(day));
    setError(""); setSuccess(false);
  };


  // ── Date-specific handlers ──
  const addOverride = () => {
    const existing = new Set(overrides.map((o) => o.date));
    const candidate = new Date();
    candidate.setDate(candidate.getDate() + 1);
    let dateStr = "";
    let weekday: Weekday = "monday";

    for (let i = 0; i < 365; i++) {
      const y = candidate.getFullYear();
      const m = String(candidate.getMonth() + 1).padStart(2, "0");
      const d = String(candidate.getDate()).padStart(2, "0");
      dateStr = `${y}-${m}-${d}`;
      if (!existing.has(dateStr)) {
        weekday = DAYS[candidate.getDay() === 0 ? 6 : candidate.getDay() - 1] as Weekday;
        break;
      }
      candidate.setDate(candidate.getDate() + 1);
    }

    const defaultDay = availability[weekday];
    const newIdx = overrides.length;
    setOverrides([
      ...overrides,
      {
        date: dateStr,
        isOpen: defaultDay.isOpen,
        from: defaultDay.from,
        to: defaultDay.to,
        off_times: [],
      },
    ]);
    setDirtyOverrides((prev) => new Set(prev).add(newIdx));
    setError("");
    setSuccess(false);
  };

  const handleAddOffTime = (idx: number) => {
    const current = overrides[idx].off_times ?? [];
    updateOverride(idx, { off_times: [...current, ["12:00", "13:00"]] });
  };

  const handleRemoveOffTime = (overrideIdx: number, offTimeIdx: number) => {
    const current = overrides[overrideIdx].off_times ?? [];
    updateOverride(overrideIdx, {
      off_times: current.filter((_, i) => i !== offTimeIdx),
    });
  };

  const handleOffTimeChange = (overrideIdx: number, offTimeIdx: number, fieldIndex: 0 | 1, value: string) => {
    const current = overrides[overrideIdx].off_times ?? [];
    const next = [...current];
    next[offTimeIdx] = [...next[offTimeIdx]] as [string, string];
    next[offTimeIdx][fieldIndex] = value;
    updateOverride(overrideIdx, { off_times: next });
  };

  const removeOverride = (idx: number) => {
    setOverrides(overrides.filter((_, i) => i !== idx));
    // Remap dirty indices: drop the removed idx and shift higher indices down by 1
    setDirtyOverrides((prev) => {
      const next = new Set<number>();
      prev.forEach((d) => {
        if (d < idx) next.add(d);
        else if (d > idx) next.add(d - 1);
      });
      return next;
    });
    setError(""); setSuccess(false);
  };

  const updateOverride = (idx: number, patch: Partial<DateOverride>) => {
    setOverrides(overrides.map((o, i) => i === idx ? { ...o, ...patch } : o));
    setDirtyOverrides((prev) => new Set(prev).add(idx));
    setError(""); setSuccess(false);
  };

  // ── Save ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(false); setSaving(true);

    try {
      if (!technicianId) throw new Error("Technician profile not loaded yet.");

      if (tab === "weekly") {
        if (dirtyDays.size === 0) {
          setSuccess(true);
          setTimeout(() => { setSuccess(false); onClose(); }, 1500);
          return;
        }

        // Save weekly schedule: one PUT per weekday with period: "day_of_week", ONLY for dirty days
        for (const day of Array.from(dirtyDays)) {
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
      } else {
        if (dirtyOverrides.size === 0) {
          setSuccess(true);
          setTimeout(() => { setSuccess(false); onClose(); }, 1500);
          return;
        }

        // Save date-specific overrides: one PUT per date with period: "only_on_day", ONLY for dirty overrides
        for (const idx of Array.from(dirtyOverrides)) {
          const override = overrides[idx];
          if (!override) continue;

          const window: [string, string] = override.isOpen
            ? [override.from, override.to]
            : ["00:00", "00:00"];

          const dateObj = new Date(override.date);
          const weekday = DAYS[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1];

          await updateAvailability({
            technician_id: technicianId,
            period: "only_on_day",
            date: override.date,
            weekday: weekday as Weekday,
            availableTime: window,
            off_times: override.off_times,
          });
        }
      }

      await refetchTechnician().catch(() => {});
      clearWeeklyAvailabilityCache(technicianId);
      setDirtyDays(new Set());
      setDirtyOverrides(new Set());
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 2000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-none border-t sm:border border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-2xl">
              <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-50 tracking-tight">Working Hours</h2>
              <p className="text-sm text-zinc-500 font-medium">Manage your availability</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all group">
            <X className="w-6 h-6 text-zinc-500 group-hover:text-zinc-50" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setTab("weekly")}
            className={`flex-1 py-3 text-sm font-bold transition-all ${
              tab === "weekly"
                ? "text-primary border-b-2 border-primary"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Weekly Hours
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("date-specific")}
            className={`flex-1 py-3 text-sm font-bold transition-all ${
              tab === "date-specific"
                ? "text-primary border-b-2 border-primary"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Date-Specific
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-8 max-h-[60vh] overflow-y-auto space-y-4 scrollbar-hide">
            {tab === "weekly" ? (
              /* ── Weekly Hours ── */
              DAYS.map((day) => (
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
                    </div>

                    {availability[day].isOpen ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-black/60 rounded-xl p-1 border border-white/5">
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
                      </div>
                    ) : (
                      <span className="text-xs font-black text-red-500 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 uppercase tracking-widest">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              /* ── Date-Specific Hours ── */
              <div className="space-y-4">
                <p className="text-sm text-zinc-500 font-medium">
                  Override your weekly hours for specific dates — holidays, special events, or one-off schedule changes.
                </p>

                {overrides.length === 0 && (
                  <div className="p-8 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                    <CalendarDays className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-500 font-medium text-sm">No date overrides yet</p>
                    <p className="text-zinc-600 text-xs mt-1">Add one to customize hours for a specific date</p>
                  </div>
                )}

                {overrides.map((override, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      override.isOpen
                        ? "bg-white/[0.03] border-white/10"
                        : "bg-black/40 border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <input
                        type="date"
                        value={override.date}
                        onChange={(e) => updateOverride(idx, { date: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-zinc-50 outline-none [color-scheme:dark]"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateOverride(idx, { isOpen: !override.isOpen })}
                          className={`relative inline-flex h-6 w-10 items-center rounded-full transition-all duration-300 ${
                            override.isOpen ? "bg-primary" : "bg-zinc-800"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                              override.isOpen ? "translate-x-5" : "translate-x-1"
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeOverride(idx)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {override.isOpen ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-1.5 bg-black/60 rounded-xl p-1 border border-white/5 w-fit">
                          <input
                            type="time"
                            value={override.from}
                            onChange={(e) => updateOverride(idx, { from: e.target.value })}
                            className="bg-transparent px-3 py-2 text-sm font-bold text-zinc-50 outline-none [color-scheme:dark] min-w-[100px]"
                          />
                          <span className="text-zinc-600 font-black text-[10px] uppercase">to</span>
                          <input
                            type="time"
                            value={override.to}
                            onChange={(e) => updateOverride(idx, { to: e.target.value })}
                            className="bg-transparent px-3 py-2 text-sm font-bold text-zinc-50 outline-none [color-scheme:dark] min-w-[100px]"
                          />
                        </div>

                        {/* Off-times management */}
                        <div className="space-y-3 pt-2 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Disabled Time Ranges</span>
                            <button
                              type="button"
                              onClick={() => handleAddOffTime(idx)}
                              className="text-[10px] uppercase tracking-widest font-black text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Range
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {override.off_times?.map((offTime, offIdx) => (
                              <div key={offIdx} className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 bg-black/40 rounded-lg p-1 border border-white/5 w-fit">
                                  <input
                                    type="time"
                                    value={offTime[0]}
                                    onChange={(e) => handleOffTimeChange(idx, offIdx, 0, e.target.value)}
                                    className="bg-transparent px-2 py-1 text-xs font-bold text-zinc-300 outline-none [color-scheme:dark] min-w-[80px]"
                                  />
                                  <span className="text-zinc-700 font-black text-[8px] uppercase">to</span>
                                  <input
                                    type="time"
                                    value={offTime[1]}
                                    onChange={(e) => handleOffTimeChange(idx, offIdx, 1, e.target.value)}
                                    className="bg-transparent px-2 py-1 text-xs font-bold text-zinc-300 outline-none [color-scheme:dark] min-w-[80px]"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOffTime(idx, offIdx)}
                                  className="p-1.5 rounded-lg text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                            {(!override.off_times || override.off_times.length === 0) && (
                              <p className="text-[10px] text-zinc-600 italic">No disabled ranges (e.g. lunch breaks) added.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-black text-red-500 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 uppercase tracking-widest">
                        Closed for the day
                      </span>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addOverride}
                  className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-sm font-bold text-zinc-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Date Override
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 sm:p-8 border-t border-border bg-black/40 backdrop-blur-md flex flex-col gap-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-sm text-green-500">
                  {tab === "weekly" ? "Weekly hours updated!" : "Date overrides saved!"}
                </p>
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
                disabled={saving || isTechnicianLoading || (tab === "date-specific" && overrides.length === 0)}
                className="flex-[2] px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : tab === "weekly" ? (
                  "Save Weekly Hours"
                ) : (
                  "Save Date Overrides"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
