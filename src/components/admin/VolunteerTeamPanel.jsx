import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Users, Send, XCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function VolunteerTeamPanel() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    const allUsers = await base44.entities.User.list();
    // Show non-admin users
    setUsers(allUsers.filter(u => u.role !== "admin"));
    setLoading(false);
  };

  const togglePublishAccess = async (targetUser) => {
    const newValue = !targetUser.one_time_post_granted;
    await base44.entities.User.update(targetUser.id, { one_time_post_granted: newValue });
    toast({ title: newValue ? "✅ Publish access granted" : "❌ Publish access removed", description: `${targetUser.full_name || targetUser.email}` });
    loadUsers();
  };

  const filtered = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#8B4513]" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Volunteer Team</h2>
        </div>
        <span className="text-sm text-gray-500">{users.filter(u => u.one_time_post_granted).length} active</span>
      </div>

      <p className="text-sm text-gray-500">Grant volunteers one-time permission to publish an announcement. The permission is automatically removed after they publish.</p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-2">
        {filtered.map(u => (
          <div key={u.id} className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">{(u.full_name || u.email)?.[0]?.toUpperCase() || "?"}</span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{u.full_name || "No name"}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant={u.one_time_post_granted ? "destructive" : "outline"}
              onClick={() => togglePublishAccess(u)}
              className={u.one_time_post_granted ? "" : "text-[#8B4513] border-[#8B4513] hover:bg-[#8B4513] hover:text-white"}
            >
              {u.one_time_post_granted ? (
                <><XCircle className="w-3.5 h-3.5 mr-1" /> Revoke</>
              ) : (
                <><Send className="w-3.5 h-3.5 mr-1" /> Grant Post</>
              )}
            </Button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">No users found</p>
        )}
      </div>
    </div>
  );
}