"use client";

import BalanceCard from "@/app/features/wallet/components/BalanceCard";
import TransactionList from "@/app/features/wallet/components/TransactionList";
import { Transaction } from "@/lib/types/wallet";
import { ArrowDownLeft, ArrowUpRight, Filter, Search } from "lucide-react";
import { useState } from "react";

const mockTransactions: Transaction[] = [
  {
    id: "1",
    amount: 35.00,
    date: new Date().toISOString(),
    status: "completed",
    description: "Skin Fade - John Doe",
    type: "booking",
  },
  {
    id: "2",
    amount: 65.00,
    date: new Date(Date.now() - 3600000).toISOString(),
    status: "completed",
    description: "Full Service - Jane Smith",
    type: "booking",
  },
  {
    id: "3",
    amount: -420.00,
    date: new Date(Date.now() - 86400000).toISOString(),
    status: "pending",
    description: "Payout to Bank Account (...1234)",
    type: "payout",
  },
  {
    id: "4",
    amount: 45.00,
    date: new Date(Date.now() - 172800000).toISOString(),
    status: "completed",
    description: "Haircut & Beard - Bob Wilson",
    type: "booking",
  },
  {
    id: "5",
    amount: 10.00,
    date: new Date(Date.now() - 259200000).toISOString(),
    status: "failed",
    description: "Adjustment - Bonus Credit",
    type: "adjustment",
  },
];

export default function WalletPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = mockTransactions.filter(t => 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
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
          </div>

          {/* Balance Cards */}
          <BalanceCard 
            balance={1240.50} 
            pending={420.00} 
            totalEarned={8450.00} 
          />

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="w-full bg-card border border-border rounded-full py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
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
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-card border border-border rounded-full text-sm font-bold text-foreground/60 hover:text-foreground transition-all active:scale-95 shadow-sm"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Transaction List */}
          <TransactionList transactions={filteredTransactions} />
        </div>
      </main>
    </div>
  );
}
