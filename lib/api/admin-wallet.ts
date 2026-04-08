import { api, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';

/** Admin view of a wallet. */
export interface AdminWallet {
  wallet_id: string;
  user_id?: string;
  balance: string | number;
  total_credit?: string | number;
  total_debit?: string | number;
  wallet_pin_changed?: boolean;
  frozen?: boolean;
  created_at?: string;
  updated_at?: string;
  owner?: {
    id: string;
    full_name?: string;
    email?: string;
    type?: string;
  } | null;
  [key: string]: unknown;
}

/** Body for credit/debit. */
export interface AdminWalletAdjustBody {
  amount: number;
  narration: string;
}

/** Body for freeze/unfreeze. */
export interface AdminWalletFreezeBody {
  wallet_id?: string;
  user_id?: string;
  /** Defaults to true on the backend if omitted; pass false to unfreeze. */
  frozen?: boolean;
}

function unwrap<T>(data: unknown): T {
  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return (data as { data: T }).data;
  }
  return data as T;
}

function normalizeWalletList(data: unknown): AdminWallet[] {
  if (Array.isArray(data)) return data as AdminWallet[];
  if (data && typeof data === 'object') {
    const inner = (data as { data?: unknown }).data;
    if (Array.isArray(inner)) return inner as AdminWallet[];
    if (inner && typeof inner === 'object' && Array.isArray((inner as { wallets?: unknown }).wallets)) {
      return (inner as { wallets: AdminWallet[] }).wallets;
    }
    if (Array.isArray((data as { wallets?: unknown }).wallets)) {
      return (data as { wallets: AdminWallet[] }).wallets;
    }
  }
  return [];
}

/**
 * List all user wallets. GET /admin/wallet/users
 */
export async function listAdminWallets(): Promise<AdminWallet[]> {
  try {
    const { data } = await api.get<unknown>(API.ADMIN_WALLET.USERS);
    return normalizeWalletList(data);
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}

/**
 * Reset wallet PIN for a user. POST /admin/wallet/reset-pin/:uid
 */
export async function resetWalletPin(userId: string): Promise<void> {
  try {
    await api.post(API.ADMIN_WALLET.RESET_PIN(userId));
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}

/**
 * Credit a user's wallet. POST /admin/wallet/user/:user_id/credit
 */
export async function creditUserWallet(
  userId: string,
  body: AdminWalletAdjustBody,
): Promise<AdminWallet> {
  try {
    const { data } = await api.post<unknown>(API.ADMIN_WALLET.CREDIT(userId), body);
    return unwrap<AdminWallet>(data);
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}

/**
 * Debit a user's wallet. POST /admin/wallet/user/:user_id/debit
 */
export async function debitUserWallet(
  userId: string,
  body: AdminWalletAdjustBody,
): Promise<AdminWallet> {
  try {
    const { data } = await api.post<unknown>(API.ADMIN_WALLET.DEBIT(userId), body);
    return unwrap<AdminWallet>(data);
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}

/**
 * Get a single user's wallet. GET /admin/wallet/:user_id/user
 */
export async function getUserWallet(userId: string): Promise<AdminWallet> {
  try {
    const { data } = await api.get<unknown>(API.ADMIN_WALLET.GET_USER(userId));
    return unwrap<AdminWallet>(data);
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}

/**
 * Freeze (or unfreeze) a wallet. POST /admin/wallet/freeze
 */
export async function freezeWallet(body: AdminWalletFreezeBody = {}): Promise<AdminWallet> {
  try {
    const { data } = await api.post<unknown>(API.ADMIN_WALLET.FREEZE, body);
    return unwrap<AdminWallet>(data);
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}
