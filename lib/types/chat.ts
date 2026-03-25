export interface ChatThread {
  id: string;
  provider_chat_id?: string;
  barber_id: string;
  user_id?: string;
  contact_id: string;
  conversation_type: 'barber_outreach' | 'lead_generation' | 'dashboard_management';
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_type: 'barber' | 'contact' | 'system';
  content: string;
  provider_message_id?: string;
  created_at: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface ThreadQueryResponse {
  data: ChatThread[];
  cursor?: string;
  total?: number;
}

export interface MessageStreamResponse {
  data: ChatMessage[];
  cursor?: string;
}
