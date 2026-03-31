"use client";

import { Wallet, ArrowUpRight, Clock, DollarSign } from "lucide-react";
import { useState } from "react";

interface BalanceCardProps {
  balance: number;
  pending: number;
  totalEarned: number;
}

export default function BalanceCard({ balance, pending, totalEarned }: BalanceCardProps) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Balance Card */}
      <div className="lg:col-span-2 bg-primary rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-primary/20 group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-all duration-700 -rotate-12 translate-x-8 -translate-y-8">
          <Wallet className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 space-y-8 text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold tracking-wider uppercase opacity-80">Available Balance</span>
          </div>
          
          <div>
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <p className="mt-2 text-sm font-medium opacity-70 flex items-center gap-2">
              <Clock className="w-4 h-4" /> 
              Next automatic payout scheduled for Monday
            </p>
          </div>

          <button 
            onClick={() => setShowPayoutModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-white text-primary rounded-full font-black text-sm uppercase tracking-widest hover:bg-opacity-90 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Request Payout
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div className="p-2.5 bg-amber-500/10 rounded-xl w-fit">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-1">Pending</p>
            <h3 className="text-2xl font-bold text-foreground">
              ${pending.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl w-fit">
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-1">Total Earned</p>
            <h3 className="text-2xl font-bold text-foreground">
              ${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
      </div>

      {/* Placeholder Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowPayoutModal(false)}
          />
          <div className="relative bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl p-8 space-y-6 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Request Payout</h3>
              <p className="mt-2 text-foreground/60 font-medium leading-relaxed">
                Payout processing is coming soon! <br /> 
                Connect your Stripe account to enable instant payouts.
              </p>
            </div>
            <button 
              onClick={() => setShowPayoutModal(false)}
              className="w-full py-4 bg-primary text-primary-foreground rounded-full font-black text-sm uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
