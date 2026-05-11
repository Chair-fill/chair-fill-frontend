"use client";

import { useState } from "react";
import Link from "next/link";
import MarketplaceNav from "@/app/components/marketplace/MarketplaceNav";

// Mock threads — swap for GET /marketplace/inquiries when backend is ready
const MOCK_THREADS = [
  {
    id: "1",
    shopName: "King's Cuts",
    shopSlug: "kings-cuts-tampa",
    citySlug: "tampa-fl",
    lastMessage: "Hey Marcus, the full-time booth is still available. When can you come take a look?",
    timestamp: "2h ago",
    status: "open" as const,
    unread: true,
  },
  {
    id: "2",
    shopName: "Uptown Cuts",
    shopSlug: "uptown-cuts-dallas",
    citySlug: "dallas-tx",
    lastMessage: "Great — I've accepted your inquiry. Let's get you started Monday.",
    timestamp: "1d ago",
    status: "accepted" as const,
    unread: false,
  },
];

export default function InquiriesPage() {
  const [activeThread, setActiveThread] = useState(MOCK_THREADS[0].id);
  const [reply, setReply] = useState("");
  const thread = MOCK_THREADS.find((t) => t.id === activeThread)!;

  return (
    <>
      <MarketplaceNav />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-20">
          <h1 className="font-black text-[28px] mb-6">My Inquiries</h1>

          <div className="flex gap-5 h-[600px]">
            {/* Thread list */}
            <div className="w-72 shrink-0 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border">
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40">
                  Conversations
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {MOCK_THREADS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveThread(t.id)}
                    className={`w-full text-left px-4 py-4 border-b border-border transition-colors ${
                      activeThread === t.id ? "bg-primary/10" : "hover:bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-[13px] font-semibold ${activeThread === t.id ? "text-primary" : "text-foreground"}`}>
                        {t.shopName}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {t.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        <span className="text-[11px] text-foreground/40 font-mono">{t.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-[12px] text-foreground/50 line-clamp-2">{t.lastMessage}</p>
                    <span
                      className={`mt-2 inline-block text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full ${
                        t.status === "accepted"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-border text-foreground/40"
                      }`}
                    >
                      {t.status === "accepted" ? "✓ Accepted" : "Open"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message pane */}
            <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
              {/* Thread header */}
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="font-bold text-[15px]">{thread.shopName}</p>
                  <Link
                    href={`/shops/${thread.citySlug}/${thread.shopSlug}`}
                    className="text-[12px] text-primary hover:underline"
                  >
                    View listing →
                  </Link>
                </div>
                {thread.status === "accepted" && (
                  <div className="text-right">
                    <span className="text-[11px] font-mono tracking-wider px-2.5 py-1 rounded-full bg-green-500/10 text-green-500">
                      ✓ Accepted
                    </span>
                    <p className="text-[11px] text-foreground/50 mt-1">
                      Proceed to book your dates
                    </p>
                    <Link
                      href="/signup?source=marketplace-booking"
                      className="mt-2 inline-block text-[12px] text-primary hover:underline"
                    >
                      Complete booking →
                    </Link>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex justify-start">
                  <div className="bg-background border border-border rounded-xl rounded-tl-sm px-4 py-3 max-w-[75%]">
                    <p className="text-[13px] text-foreground/80 leading-relaxed">{thread.lastMessage}</p>
                    <p className="text-[11px] text-foreground/30 mt-1 font-mono">{thread.timestamp}</p>
                  </div>
                </div>
              </div>

              {/* Reply */}
              <div className="px-4 py-3 border-t border-border flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Type a reply…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && reply.trim()) {
                      // TODO: POST /marketplace/inquiries/:id/messages { body: reply }
                      setReply("");
                    }
                  }}
                />
                <button
                  onClick={() => { if (reply.trim()) setReply(""); }}
                  className="px-4 py-2 rounded-lg bg-primary text-black font-semibold text-[13px] hover:brightness-110 transition-all"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
