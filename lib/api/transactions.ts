import { api, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import { Transaction, TransactionStatus, TransactionType } from '@/lib/types/wallet';

export interface GetTransactionsParams {
  owner: string;
  cursor?: string;
  from?: string;
  to?: string;
  page_size?: number;
  category?: string;
  status?: string;
  paginate?: boolean;
}

// Map backend status to frontend TransactionStatus
function mapStatus(status: string | undefined): TransactionStatus {
  if (!status) return 'pending';
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'success' || s === 'successful') return 'completed';
  if (s === 'failed' || s === 'error') return 'failed';
  return 'pending';
}

// Map backend category/type to frontend TransactionType
function mapType(category: string | undefined, type: string | undefined): TransactionType {
  const c = (category || '').toLowerCase();
  const t = (type || '').toLowerCase();
  
  if (c.includes('payout') || c.includes('withdrawal')) return 'payout';
  if (c.includes('booking') || c.includes('charge')) return 'booking';
  
  if (t === 'credit') return 'booking'; // assume credits are from bookings for now
  if (t === 'debit') return 'payout';   // assume debits are payouts
  
  return 'adjustment';
}

function normalizeTransactionsResponse(data: unknown): Transaction[] {
  let backendTxns: any[] = [];
  if (Array.isArray(data)) {
    backendTxns = data;
  } else if (data && typeof data === 'object') {
    const inner = (data as any).data;
    if (Array.isArray(inner)) {
      backendTxns = inner;
    }
  }

  return backendTxns.map((t: any): Transaction => {
    // If it's a debit, we might want to represent it as a negative amount for the UI
    const isDebit = t.transaction_type === 'DEBIT';
    const amount = Number(t.amount) || 0;
    
    return {
      id: t.transaction_id || Math.random().toString(36).substring(7),
      amount: isDebit ? -amount : amount,
      date: t.created_at || t.updated_at || new Date().toISOString(),
      status: mapStatus(t.transaction_status),
      description: t.description || 'Transaction',
      type: mapType(t.transaction_category, t.transaction_type),
    };
  });
}

/**
 * Get transactions list for a given owner. GET /transactions/list
 */
export async function getTransactions(params: GetTransactionsParams): Promise<Transaction[]> {
  try {
    const search = new URLSearchParams();
    search.set('owner', params.owner);
    
    search.set('cursor', params.cursor || '');
    
    // The backend expects YYYY-MM-DD format for dates
    const fromDate = params.from ? new Date(params.from) : new Date(0);
    const toDate = params.to ? new Date(params.to) : new Date();
    
    search.set('from', fromDate.toISOString().split('T')[0]);
    search.set('to', toDate.toISOString().split('T')[0]);
    
    search.set('page_size', (params.page_size || 50).toString());
    
    if (params.category) search.set('category', params.category);
    if (params.status) search.set('status', params.status);
    if (params.paginate !== undefined) search.set('paginate', params.paginate.toString());

    const url = `${API.TRANSACTIONS.LIST}?${search.toString()}`;
    const { data } = await api.get<unknown>(url);
    
    return normalizeTransactionsResponse(data);
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}
