import { Transaction } from "@/lib/types/wallet";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, XCircle } from "lucide-react";

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const isPositive = transaction.amount > 0;
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': return <ArrowDownLeft className="w-5 h-5 text-emerald-500" />;
      case 'payout': return <ArrowUpRight className="w-5 h-5 text-primary" />;
      case 'adjustment': return <ArrowDownLeft className="w-5 h-5 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 group hover:bg-white/5 transition-all rounded-2xl border border-transparent hover:border-white/5">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${
          transaction.type === 'payout' ? 'bg-primary/10' : 'bg-white/5'
        }`}>
          {getTypeIcon(transaction.type)}
        </div>
        <div>
          <p className="text-sm font-bold text-foreground truncate max-w-[150px] sm:max-w-xs">{transaction.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
              {new Date(transaction.date).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
            <div className="w-1 h-1 rounded-full bg-foreground/10" />
            <div className="flex items-center gap-1">
              {getStatusIcon(transaction.status)}
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                transaction.status === 'completed' ? 'text-emerald-500' : 
                transaction.status === 'pending' ? 'text-amber-500' : 'text-red-500'
              }`}>
                {transaction.status}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <p className={`text-sm font-black ${isPositive ? 'text-emerald-500' : 'text-foreground'}`}>
          {isPositive ? '+' : ''}${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[10px] font-bold text-foreground/40 mt-0.5 uppercase tracking-wider">USD</p>
      </div>
    </div>
  );
};

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Transaction History</h3>
        <button className="text-xs font-bold text-primary hover:opacity-80 transition-opacity uppercase tracking-wider">
          View All
        </button>
      </div>
      
      <div className="divide-y divide-border">
        {transactions.length > 0 ? (
          transactions.map((t) => (
            <TransactionItem key={t.id} transaction={t} />
          ))
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
              <Clock className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-foreground/40">No transactions recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
