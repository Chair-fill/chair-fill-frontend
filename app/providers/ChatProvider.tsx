"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { ChatMessage } from "@/lib/types/chat";
import { chatStorage } from "@/lib/utils/chat-storage";

interface ChatContextType {
  getMessages: (contactId: string) => Promise<ChatMessage[]>;
  saveMessages: (contactId: string, messages: ChatMessage[]) => Promise<void>;
  appendMessages: (contactId: string, newMessages: ChatMessage[]) => Promise<ChatMessage[]>;
  clearCache: (contactId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  // We don't necessarily need to keep ALL messages for ALL contacts in React state
  // to avoid memory bloat. We can just use IndexedDB as the source of truth,
  // and components can manage their own local state from it.
  
  const getMessages = useCallback(async (contactId: string) => {
    return await chatStorage.getMessages(contactId);
  }, []);

  const saveMessages = useCallback(async (contactId: string, messages: ChatMessage[]) => {
    await chatStorage.saveMessages(contactId, messages);
  }, []);

  const appendMessages = useCallback(async (contactId: string, newMessages: ChatMessage[]) => {
    return await chatStorage.appendMessages(contactId, newMessages);
  }, []);

  const clearCache = useCallback(async (contactId: string) => {
    await chatStorage.saveMessages(contactId, []);
  }, []);

  return (
    <ChatContext.Provider value={{ getMessages, saveMessages, appendMessages, clearCache }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
