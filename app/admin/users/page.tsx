"use client";
import { useState, useEffect } from "react";
import { 
  Users, Search, Filter, MoreVertical, 
  UserCheck, UserX, Shield, Mail, 
  Trash2, UserPlus, ArrowLeftRight, Edit
} from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { formatDateShort } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(json => {
        if (json.success) setUsers(json.data);
        setLoading(false);
      });
  }, []);

  const handleToggleStatus = (id: string, active: boolean) => {
    toast.success(`User ${active ? 'activated' : 'suspended'}`);
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(query.toLowerCase()) || 
    u.email?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-secondary">Manage platform users, organizers, and administrative staff.</p>
        </div>
        <button className="btn-primary py-2.5 px-6 text-sm gap-2">
          <UserPlus className="w-4 h-4" /> Add New User
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="pl-9 py-2 text-sm w-full" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="btn-ghost py-2 px-4 text-sm gap-2 border border-white/5 flex-1 sm:flex-none">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="btn-ghost py-2 px-4 text-sm gap-2 border border-white/5 flex-1 sm:flex-none">
              Role: All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-muted animate-pulse">Fetching users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-20 text-center text-muted">No users found matching your search.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/2 text-muted uppercase text-[10px] font-bold tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.role.includes("ADMIN") ? "bg-red-500/10 text-red-400" :
                        user.role === "ORGANIZER" ? "bg-indigo-500/10 text-indigo-400" :
                        "bg-white/5 text-muted"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary">{formatDateShort(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-xs">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/10 rounded-lg" title="Edit User">
                          <Edit className="w-4 h-4 text-muted" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg" title="Manage Permissions">
                          <Shield className="w-4 h-4 text-muted" />
                        </button>
                        <button className="p-2 hover:bg-red-500/10 rounded-lg" title="Suspend User">
                          <UserX className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
