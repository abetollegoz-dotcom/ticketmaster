"use client";
import { useState } from "react";
import { 
  DollarSign, CreditCard, ArrowUpRight, 
  Clock, CheckCircle, AlertCircle, 
  Download, Filter, Plus
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PayoutsPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payouts & Earnings</h1>
          <p className="text-secondary">Track your earnings and manage your withdrawal methods.</p>
        </div>
        <button className="btn-primary py-2.5 px-6 text-sm gap-2">
          <Plus className="w-4 h-4" /> Add Payout Method
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card p-6 bg-indigo-500/5 border-indigo-500/20">
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Available for Withdrawal</p>
          <p className="text-3xl font-bold mb-4">{formatCurrency(12450.00)}</p>
          <button className="btn-primary w-full py-2 text-xs">Request Payout Now</button>
        </div>
        <div className="card p-6">
          <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Pending Clearance</p>
          <p className="text-3xl font-bold mb-4">{formatCurrency(3120.50)}</p>
          <p className="text-[10px] text-secondary flex items-center gap-1">
            <Clock className="w-3 h-3" /> Usually takes 3-5 business days
          </p>
        </div>
        <div className="card p-6">
          <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Total Paid Out</p>
          <p className="text-3xl font-bold mb-4">{formatCurrency(85920.00)}</p>
          <button className="text-xs text-indigo-400 font-bold hover:underline">View History →</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold">Recent Payouts</h3>
            <button className="text-xs text-muted flex items-center gap-2 hover:text-white">
              <Download className="w-4 h-4" /> Download Statement
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/2 text-muted uppercase text-[10px] font-bold tracking-wider">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { id: "PAY-9281X", date: "May 12, 2026", amount: 4500.00, status: "COMPLETED" },
                  { id: "PAY-8172A", date: "May 05, 2026", amount: 2100.00, status: "COMPLETED" },
                  { id: "PAY-7162B", date: "Apr 28, 2026", amount: 3200.00, status: "PENDING" },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{row.id}</td>
                    <td className="px-6 py-4 text-secondary">{row.date}</td>
                    <td className="px-6 py-4 font-bold">{formatCurrency(row.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold ${
                        row.status === "COMPLETED" ? "text-emerald-400" : "text-amber-400"
                      }`}>
                        {row.status === "COMPLETED" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6 h-fit">
          <h3 className="font-bold mb-6">Payout Methods</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="badge badge-brand text-[10px]">Primary</span>
              </div>
              <p className="text-sm font-bold">Bank Transfer (**** 9012)</p>
              <p className="text-xs text-secondary">Last used on May 12, 2026</p>
            </div>
            
            <button className="w-full py-4 rounded-xl border border-dashed border-white/10 text-muted text-xs font-bold hover:bg-white/5 hover:border-indigo-500/30 transition-all">
              + Connect New Method
            </button>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Tax Information Required</p>
                <p className="text-[10px] text-secondary leading-relaxed">Please update your W-9 form to avoid payout delays for the upcoming quarter.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
