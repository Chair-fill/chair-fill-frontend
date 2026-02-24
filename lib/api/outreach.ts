import { api } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import { getApiErrorMessage } from '@/lib/api-client';

/** Payload for POST /outreach/blast (Postman: Blast). Use technician_id only; shop_id is mutually exclusive and for later. */
export interface SendBlastPayload {
  contact_ids: string[];
  initial_outreach_message: string;
  technician_id: string;
}

/**
 * Send outreach blast to contacts (technician-based; shop_id not sent).
 * POST /outreach/blast. Body: { contact_ids, initial_outreach_message, technician_id }.
 */
export async function sendBlast(payload: SendBlastPayload): Promise<void> {
  try {
    await api.post(API.OUTREACH.BLAST, {
      contact_ids: payload.contact_ids,
      initial_outreach_message: payload.initial_outreach_message,
      technician_id: payload.technician_id,
    });
  } catch (err) {
    const message = getApiErrorMessage(err);
    throw new Error(message);
  }
}
