"use client";
import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { 
  TrendingUp, Users, DollarSign, 
  ArrowUpRight, ArrowDownRight, 
  Filter, Download, Calendar, Activity
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

const DATA = [
  { name: "Jan", revenue: 4000, orders: 240, users: 120 },
  { name: "Feb", revenue: 3000, orders: 198, users: 150 },
  { name: "Mar", revenue: 2000, orders: 980, users: 400 },
  { name: "Apr", revenue: 2780, orders: 390, users: 500 },
  { name: "May", revenue: 1890, orders: 480, users: 650 },
  { name: "Jun", revenue: 2390, orders: 380, users: 800 },
  { name: "Jul", revenue: 3490, orders: 430, users: 1100 },
];

const CATEGORY_DATA = [
  { name: "Concerts", value: 400 },
  { name: "Sports", value: 300 },
  { name: "Theater", value: 200 },
  { name: "Festivals", value: 100 },
];

const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#f59e0b"];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
          <p className="text-secondary">Deep dive into revenue, user growth, and market trends.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500/50 transition-colors"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="btn-ghost py-2 px-4 text-sm gap-2 border border-white/10">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          label="Gross Revenue" 
          value="$124,592" 
          change="+12.5%" 
          trend="up" 
          icon={<DollarSign className="w-5 h-5" />} 
        />
        <MetricCard 
          label="Active Users" 
          value="18,245" 
          change="+8.2%" 
          trend="up" 
          icon={<Users className="w-5 h-5" />} 
        />
        <MetricCard 
          label="Tickets Sold" 
          value="45,902" 
          change="-2.4%" 
          trend="down" 
          icon={<Activity className="w-5 h-5" />} 
        />
        <MetricCard 
          label="Conversion Rate" 
          value="4.82%" 
          change="+0.5%" 
          trend="up" 
          icon={<TrendingUp className="w-5 h-5" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Revenue & Growth</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-xs text-secondary">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-xs text-secondary">Users</span>
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="users" stroke="#a855f7" strokeWidth={3} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card p-8 flex flex-col">
          <h3 className="text-xl font-bold mb-8">Category Breakdown</h3>
          <div className="flex-1 h-[300px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {CATEGORY_DATA.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i] }} />
                  <span className="text-sm text-secondary">{cat.name}</span>
                </div>
                <span className="text-sm font-bold">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Activity */}
        <div className="lg:col-span-3 card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Platform Activity</h3>
            <button className="text-xs text-indigo-400 font-bold uppercase tracking-widest hover:underline">View Detailed Logs</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Top Organizers</p>
              {[
                { name: "Live Nation", sales: "12,450", revenue: "$450k" },
                { name: "MSG Entertainment", sales: "8,920", revenue: "$320k" },
                { name: "AEG Presents", sales: "7,150", revenue: "$280k" },
              ].map(org => (
                <div key={org.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs">{org.name[0]}</div>
                    <span className="text-sm font-medium">{org.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">{org.revenue}</p>
                    <p className="text-[10px] text-muted">{org.sales} tickets</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="md:col-span-2">
              <div className="h-[200px] w-full bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-center">
                <p className="text-sm text-muted italic">Session geography heatmap loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, trend, icon }: any) {
  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <p className="text-xs text-secondary mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
