import { api } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import { getApiErrorMessage } from '@/lib/api-client';

/** Payload for POST /outreach/send (Postman: Send Outreach) */
export interface SendOutreachPayload {
  message: string;
  phone_number: string;
  send_to_all: boolean;
}

/**
 * Send outreach to a contact or all contacts (Postman: Send Outreach).
 * POST /outreach/send. Body: { message, phone_number, send_to_all }.
 */
export async function sendOutreach(payload: SendOutreachPayload): Promise<void> {
  try {
    await api.post(API.OUTREACH.SEND, {
      message: payload.message,
      phone_number: payload.phone_number,
      send_to_all: payload.send_to_all,
    });
  } catch (err) {
    const message = getApiErrorMessage(err);
    throw new Error(message);
  }
}
