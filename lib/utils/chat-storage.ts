import { ChatMessage } from "@/lib/types/chat";

const DB_NAME = "ChairfillChatDB";
const STORE_NAME = "messages";
const DB_VERSION = 1;

export const chatStorage = {
  openDB: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  getMessages: async (contactId: string): Promise<ChatMessage[]> => {
    try {
      const db = await chatStorage.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(contactId);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("IndexedDB getMessages error:", error);
      return [];
    }
  },

  saveMessages: async (contactId: string, messages: ChatMessage[]): Promise<void> => {
    try {
      const db = await chatStorage.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(messages, contactId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("IndexedDB saveMessages error:", error);
    }
  },

  appendMessages: async (contactId: string, newMessages: ChatMessage[]): Promise<ChatMessage[]> => {
    const existing = await chatStorage.getMessages(contactId);
    // Filter out duplicates
    const filteredNew = newMessages.filter(nm => !existing.find(em => em.id === nm.id));
    
    if (filteredNew.length === 0) return existing;

    const merged = [...existing, ...filteredNew].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    await chatStorage.saveMessages(contactId, merged);
    return merged;
  }
};
