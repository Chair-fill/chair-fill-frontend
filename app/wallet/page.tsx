"use client";

import BalanceCard from "@/app/features/wallet/components/BalanceCard";
import TransactionList from "@/app/features/wallet/components/TransactionList";
import { Transaction } from "@/lib/types/wallet";
import { Filter, Loader2, Search, Wallet as WalletIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useTechnician } from "@/app/providers/TechnicianProvider";
import { useUser } from "@/app/providers/UserProvider";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/api/transactions";
import { getRecentTransactionAnalytics } from "@/lib/api/analytics";

/** Coerce backend decimal string/number to a JS number. Returns 0 on failure. */
function toAmount(value: string | number | undefined | null): number {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function WalletPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { technician, isTechnicianLoading } = useTechnician();
  const { user } = useUser();

  const wallet = technician?.wallet ?? null;
  const balance = toAmount(wallet?.balance);
  const totalCredit = toAmount(wallet?.total_credit);
  const totalDebit = toAmount(wallet?.total_debit);

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics', 'recent', user?.id],
    queryFn: getRecentTransactionAnalytics,
    enabled: !!user?.id,
  });

  // Try to use analytics data if it has pending/totalEarned, otherwise fallback to 0/totalCredit
  const pending = toAmount(analyticsData?.pending) || 0;
  const totalEarned = toAmount(analyticsData?.total_earned) || totalCredit;

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => getTransactions({ owner: user!.id }),
    enabled: !!user?.id,
  });

  const transactions: Transaction[] = transactionsData || [];
  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background pt-4 sm:pt-8 pb-32 sm:pb-8">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                My Wallet
              </h1>
              <p className="mt-2 text-foreground/60 leading-relaxed font-medium">
                Manage your earnings and payout history.
              </p>
            </div>
            {wallet?.frozen && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider">
                Wallet frozen
              </span>
            )}
          </div>

          {/* Balance Cards */}
          {isTechnicianLoading ? (
            <div className="rounded-3xl border border-border bg-card p-12 flex items-center justify-center text-foreground/60">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading wallet...
            </div>
          ) : wallet ? (
            <BalanceCard
              balance={balance}
              pending={pending}
              totalEarned={totalEarned}
            />
          ) : (
            <div className="rounded-3xl border border-border bg-card p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-foreground/5 rounded-full flex items-center justify-center mb-4">
                <WalletIcon className="w-8 h-8 text-foreground/40" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Wallet not available
              </h3>
              <p className="mt-1 text-sm text-foreground/60">
                We couldn&apos;t load your wallet. Please try again later.
              </p>
            </div>
          )}

          {/* Lifetime stats */}
          {wallet && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-2xl border border-border p-5">
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-1">
                  Total Earned
                </p>
                <p className="text-xl font-bold text-foreground">
                  ${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-5">
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-1">
                  Total Paid Out
                </p>
                <p className="text-xl font-bold text-foreground">
                  ${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full bg-card border border-border rounded-full py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transi[...]
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-card border border-border rounded-full text-sm font-bold text-foreground/60 hover:text-foreground transition-all active:scale-95 shadow-sm"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-card border border-border rounded-full text-sm font-bold text-foreground/60 hover:text-foregro[...]
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Transaction List */}
          {isTransactionsLoading ? (
            <div className="rounded-2xl border border-border bg-card p-10 flex flex-col items-center justify-center text-foreground/60">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p className="text-sm font-medium">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <TransactionList transactions={filteredTransactions} />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-foreground/60">
              No transactions yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
