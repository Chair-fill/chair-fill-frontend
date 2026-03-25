"use client";

import { useEffect, useState, useRef } from "react";
import { X, Send, User, MessageSquare, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { queryThreads, streamMessages } from "@/lib/api/chat";
import { ChatThread, ChatMessage } from "@/lib/types/chat";
import { useModalKeyboard, useModalScrollLock } from "@/lib/hooks/use-modal";

interface ChatThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  contactName: string;
  technicianId: string;
}

export default function ChatThreadModal({
  isOpen,
  onClose,
  contactId,
  contactName,
  technicianId,
}: ChatThreadModalProps) {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useModalKeyboard(isOpen, onClose);
  useModalScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    async function loadChat() {
      setLoading(true);
      setError(null);
      try {
        // 1. Find or "create" thread for this contact
        const queryRes = await queryThreads({ 
          contact_id: contactId,
          barber_id: technicianId 
        });

        const existingThread = queryRes.data.data?.[0];
        
        if (existingThread) {
          setThread(existingThread);
          // 2. Load messages
          const msgRes = await streamMessages(existingThread.id, { page_size: 50 });
          setMessages(msgRes.data.data || []);
        } else {
          setThread(null);
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
        setError("Could not load conversation history.");
      } finally {
        setLoading(false);
      }
    }

    loadChat();
  }, [isOpen, contactId, technicianId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end p-0 sm:p-4 pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg h-full sm:h-[90vh] bg-card border-l sm:border border-border sm:rounded-[2.5rem] shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground leading-tight">{contactName}</h2>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Chat History</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-zinc-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50 dark:bg-black/20"
        >
          {loading ? (
            <div key="loading" className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-zinc-500">Loading conversation...</p>
            </div>
          ) : error ? (
            <div key="error" className="h-full flex flex-col items-center justify-center space-y-4 p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <span className="text-2xl text-red-500">!</span>
              </div>
              <p className="text-zinc-500 font-medium">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div key="empty" className="h-full flex flex-col items-center justify-center space-y-4 p-8 text-center opacity-50">
              <MessageSquare className="w-16 h-16 text-zinc-300 dark:text-zinc-700" />
              <p className="text-zinc-500 font-medium">No messages yet.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isBarber = msg.sender_type === 'barber';
              return (
                <div 
                  key={msg.id || `msg-${idx}`}
                  className={`flex ${isBarber ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] space-y-1 ${isBarber ? 'items-end' : 'items-start'}`}>
                    <div className={`
                      px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm
                      ${isBarber 
                        ? 'bg-primary text-black rounded-tr-none' 
                        : 'bg-white dark:bg-zinc-800 border border-border text-foreground rounded-tl-none'}
                    `}>
                      {msg.content}
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-widest text-zinc-500 ${isBarber ? 'text-right' : 'text-left'}`}>
                      {(() => {
                        const date = new Date(msg.created_at);
                        return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'h:mm a');
                      })()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer/Input (Read Only for now as per "show up") */}
        <div className="p-6 border-t border-border bg-card/50 backdrop-blur-xl">
          <div className="relative">
            <input 
              type="text"
              placeholder="Chat is view-only..."
              disabled
              className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-border rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none opacity-50 cursor-not-allowed"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary/20 text-primary rounded-xl opacity-50 cursor-not-allowed">
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-center mt-4 font-black uppercase tracking-widest text-zinc-500 opacity-50">
            Powered by Chairfill Core
          </p>
        </div>
      </div>
    </div>
  );
}
