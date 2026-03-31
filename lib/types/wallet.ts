export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type TransactionType = 'booking' | 'payout' | 'adjustment';

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  description: string;
  type: TransactionType;
}

export interface WalletState {
  balance: number;
  pending: number;
  totalEarned: number;
  transactions: Transaction[];
}
