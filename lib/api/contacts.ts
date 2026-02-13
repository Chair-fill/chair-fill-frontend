import { api } from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import type { Contact } from '@/lib/types/contact';

/** Payload for bulk upload: contacts without id (our UI shape) */
export type ContactUploadItem = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

/** Backend contact shape (Postman: first_name, last_name, email, phone_number_1, etc.) */
interface ApiContact {
  id?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  phone_number_1?: string;
  address?: string;
  [key: string]: unknown;
}

/** Backend bulk JSON body (Postman: Bulk JSON) */
interface BulkJsonBody {
  shop_id?: string;
  technician_id?: string;
  contacts: Array<{
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number_1?: string;
    [key: string]: unknown;
  }>;
}

function mapApiContactToContact(raw: ApiContact): Contact {
  const id = String(raw.id ?? '');
  const first = (raw.first_name ?? '').trim();
  const last = (raw.last_name ?? '').trim();
  const name = (raw.name ?? [first, last].filter(Boolean).join(' ')) || '';
  return {
    id,
    name: name || 'Unnamed',
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? raw.phone_number_1 ?? ''),
    ...(raw.address != null && raw.address !== '' && { address: String(raw.address) }),
  };
}

/** Split "Name" into first_name and last_name (first token vs rest) */
function nameToFirstLast(name: string): { first_name: string; last_name: string } {
  const trimmed = (name ?? '').trim();
  const space = trimmed.indexOf(' ');
  if (space <= 0) return { first_name: trimmed || 'Contact', last_name: '' };
  return {
    first_name: trimmed.slice(0, space),
    last_name: trimmed.slice(space + 1).trim(),
  };
}

/** Query params for GET /contact/list (user_id required; cursor-based pagination) */
export interface ContactListParams {
  user_id: string;
  page_size?: number;
  cursor?: string; // id of last element from previous fetch
  phone_number?: string;
  first_name?: string;
  from?: string; // ISO date
  to?: string;   // ISO date
}

/** Cursor-based list response from GET /contact/list */
export interface ContactListResult {
  contacts: Contact[];
  page_size: number;
  /** Id of last item returned; pass as cursor for next page. Omitted when no more pages. */
  next_cursor?: string;
}

/** Raw API response for list (array or { data, page_size?, next_cursor? }) */
interface ContactListApiResponse {
  data?: ApiContact[];
  page_size?: number;
  next_cursor?: string;
}

/**
 * Fetch contacts from the backend with user_id and cursor-based pagination.
 * GET /contact/list?user_id=...&page_size=20&cursor=id_of_last_element&...
 */
export async function fetchContactList(params: ContactListParams): Promise<ContactListResult> {
  const {
    user_id,
    page_size = 50,
    cursor,
    phone_number,
    first_name,
    from,
    to,
  } = params;

  const search = new URLSearchParams();
  search.set('user_id', user_id);
  search.set('page_size', String(page_size));
  if (cursor != null && cursor !== '') search.set('cursor', cursor);
  if (phone_number != null && phone_number !== '') search.set('phone_number', phone_number);
  if (first_name != null && first_name !== '') search.set('first_name', first_name);
  if (from != null && from !== '') search.set('from', from);
  if (to != null && to !== '') search.set('to', to);

  const url = `${API.CONTACT.LIST}?${search.toString()}`;
  const { data } = await api.get<ApiContact[] | ContactListApiResponse>(url);
  const raw = Array.isArray(data) ? { data } : (data as ContactListApiResponse);
  const rawList: ApiContact[] = Array.isArray(raw.data) ? raw.data : [];
  const size = raw.page_size ?? page_size;
  const contacts = rawList.map(mapApiContactToContact).filter((c) => c.id);
  const next_cursor =
    raw.next_cursor ?? (contacts.length === size && contacts.length > 0 ? contacts[contacts.length - 1].id : undefined);

  return {
    contacts,
    page_size: size,
    next_cursor,
  };
}

/**
 * Fetch contacts (legacy / clear-all use). Uses user_id and first page only.
 * Prefer fetchContactList for list UI with pagination.
 */
export async function fetchContacts(technicianId?: string, userId?: string): Promise<Contact[]> {
  if (userId != null && userId !== '') {
    const result = await fetchContactList({ user_id: userId, page_size: 50 });
    return result.contacts;
  }
  const url =
    technicianId != null && technicianId !== ''
      ? `${API.CONTACT.LIST}?technician_id=${encodeURIComponent(technicianId)}`
      : API.CONTACT.LIST;
  const { data } = await api.get<ApiContact[] | { data?: ApiContact[] }>(url);
  const rawList = Array.isArray(data) ? data : (data as { data?: ApiContact[] })?.data;
  const list: ApiContact[] = Array.isArray(rawList) ? rawList : [];
  return list.map(mapApiContactToContact).filter((c) => c.id);
}

/**
 * Create a single contact (Postman: Create Contact).
 * POST /contact. Body: first_name, last_name, email?, phone_number_1?, shop_id?, technician_id?.
 */
export async function createContact(
  contact: ContactUploadItem,
  technicianId?: string
): Promise<Contact> {
  const { first_name, last_name } = nameToFirstLast(contact.name ?? '');
  const body: Record<string, string> = {
    first_name: first_name || 'Contact',
    last_name: last_name || '',
  };
  const email = (contact.email ?? '').trim();
  const phone = (contact.phone ?? '').trim();
  const address = (contact.address ?? '').trim();
  if (email) body.email = email;
  if (phone) body.phone_number_1 = phone;
  if (address) body.address = address;
  if (technicianId) body.technician_id = technicianId;
  try {
    const { data } = await api.post<ApiContact | { data?: ApiContact }>(API.CONTACT.CREATE, body);
    const raw = (data && typeof data === 'object' && 'data' in data
      ? (data as { data?: ApiContact }).data
      : data) as ApiContact | undefined;
    if (raw && (raw.id != null || raw.first_name != null)) {
      return mapApiContactToContact(raw);
    }
    return {
      id: String((raw as ApiContact)?.id ?? ''),
      name: contact.name || 'Contact',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
    };
  } catch (err) {
    const message = getApiErrorMessage(err);
    throw new Error(message);
  }
}

/**
 * Upload contacts in bulk via JSON (Postman: Bulk JSON).
 * POST /contact/bulk/json. Body: { technician_id?, shop_id?, contacts: [{ first_name, last_name?, email?, phone_number_1? }] }.
 */
export async function uploadContacts(
  contacts: ContactUploadItem[],
  technicianId?: string
): Promise<Contact[]> {
  const contactsPayload = contacts.map((c) => {
    const { first_name, last_name } = nameToFirstLast(c.name ?? '');
    const row: BulkJsonBody['contacts'][0] = {
      first_name: first_name || 'Contact',
      ...(last_name && { last_name }),
      ...(c.email != null && c.email.trim() !== '' && { email: c.email.trim() }),
      ...(c.phone != null && c.phone.trim() !== '' && { phone_number_1: c.phone.trim() }),
    };
    return row;
  });

  if (contactsPayload.length === 0) {
    return [];
  }

  const body: BulkJsonBody = {
    contacts: contactsPayload,
    shop_id: '',
    technician_id: technicianId ?? '',
  };

  try {
    const { data } = await api.post<ApiContact[] | { data?: ApiContact[] }>(
      API.CONTACT.BULK_JSON,
      body
    );
    const rawList = Array.isArray(data) ? data : (data as { data?: ApiContact[] })?.data;
    const list: ApiContact[] = Array.isArray(rawList) ? rawList : [];
    return list.map(mapApiContactToContact).filter((c) => c.id);
  } catch (err) {
    const message = getApiErrorMessage(err);
    throw new Error(message);
  }
}

/**
 * Delete one contact (Postman: Delete Contact).
 * DELETE /contact/:id
 */
export async function deleteContact(id: string): Promise<void> {
  try {
    await api.delete(API.CONTACT.DELETE(id));
  } catch (err) {
    const message = getApiErrorMessage(err);
    throw new Error(message);
  }
}

/**
 * Fetch all contacts for a user by cursor-paging (for clear-all, etc.).
 */
export async function fetchAllContactsForUser(userId: string, pageSize = 50): Promise<Contact[]> {
  const all: Contact[] = [];
  let cursor: string | undefined;
  let hasMore = true;
  while (hasMore) {
    const result = await fetchContactList({
      user_id: userId,
      page_size: pageSize,
      cursor,
    });
    all.push(...result.contacts);
    hasMore = !!result.next_cursor && result.contacts.length === pageSize;
    cursor = result.next_cursor;
  }
  return all;
}

/**
 * Clear all contacts for the given user. Fetches all pages then deletes each contact.
 */
export async function clearContacts(userId: string): Promise<void> {
  const list = await fetchAllContactsForUser(userId);
  await Promise.all(list.map((c) => deleteContact(c.id)));
}
