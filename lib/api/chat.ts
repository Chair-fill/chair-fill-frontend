import { api } from "../api-client";
import { API } from "../constants/api";
import { ThreadQueryResponse, MessageStreamResponse, ChatMessage } from "../types/chat";

export async function queryThreads(params: {
  contact_id?: string;
  barber_id?: string;
  conversation_type?: string;
  page_size?: number;
  cursor?: string;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.append(key, String(value));
  });
  
  return api.get<ThreadQueryResponse>(`${API.THREADS.QUERY}?${query.toString()}`);
}

export async function streamMessages(threadId: string, params: {
  provider?: string;
  page_size?: number;
  cursor?: string;
  from?: string;
  to?: string;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.append(key, String(value));
  });

  const response = await api.get<any>(`${API.THREADS.STREAM(threadId)}?${query.toString()}`);
  
  // Transform the response data to match ChatMessage interface
  if (response.data && Array.isArray(response.data.data)) {
    const mappedMessages: ChatMessage[] = response.data.data.map((item: any) => {
      const msgData = item.data || {};
      return {
        id: msgData.guid || msgData.originalROWID?.toString() || Math.random().toString(),
        thread_id: threadId,
        sender_type: msgData.isFromMe ? 'barber' : 'contact',
        content: msgData.text || '',
        created_at: msgData.dateCreated ? new Date(msgData.dateCreated).toISOString() : new Date().toISOString(),
        provider_message_id: msgData.guid,
      };
    });
    
    // Sort messages by created_at in ascending order (oldest first)
    mappedMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    return {
      ...response,
      data: {
        ...response.data,
        data: mappedMessages
      }
    };
  }

  return response;
}
