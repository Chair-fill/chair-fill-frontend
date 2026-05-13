"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

interface Props {
  shopName: string;
}

export default function InquiryForm({ shopName: _shopName }: Props) {
  const [inquirySent, setInquirySent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  function handleInquiry(e: FormEvent) {
    e.preventDefault();
    setInquirySent(true);
  }

  if (inquirySent) {
    return (
      <div className="text-center py-6">
        <p className="text-[28px] mb-2">✓</p>
        <p className="font-semibold text-[14px] text-green-500 mb-1">Inquiry sent!</p>
        <p className="text-[13px] text-foreground/50">The shop owner will follow up shortly.</p>
        <Link href="/inquiries" className="mt-4 block text-[13px] text-primary hover:underline">
          View my inquiries →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleInquiry} className="space-y-3">
      <div>
        <label className="block text-[12px] font-mono tracking-wider text-foreground/50 mb-1.5">Your name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
          placeholder="Marcus Johnson"
        />
      </div>
      <div>
        <label className="block text-[12px] font-mono tracking-wider text-foreground/50 mb-1.5">Phone number</label>
        <input
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
          placeholder="(813) 555-0100"
        />
      </div>
      <div>
        <label className="block text-[12px] font-mono tracking-wider text-foreground/50 mb-1.5">Message</label>
        <textarea
          required
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-primary/50 transition-colors resize-none"
          placeholder="I'm interested in a full-time booth, available starting next week..."
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 rounded-lg bg-primary text-black font-bold text-[14px] hover:brightness-110 transition-all"
      >
        Send inquiry
      </button>
    </form>
  );
}
