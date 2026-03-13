import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Copy, Plus, Trash2, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code.slice(0, 4) + "-" + code.slice(4);
}

export default function AccessCodesPanel() {
  const [codes, setCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toast } = useToast();

  useEffect(() => { loadCodes(); }, []);

  const loadCodes = async () => {
    setIsLoading(true);
    const all = await base44.entities.AccessCode.list("-created_date");
    setCodes(all);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    const code = generateCode();
    await base44.entities.AccessCode.create({ code, is_used: false });
    toast({ title: "✅ Code created", description: code });
    await loadCodes();
    setIsCreating(false);
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "📋 Copied!", description: code });
  };

  const handleDelete = async () => {
    await base44.entities.AccessCode.delete(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: "✅ Code deleted" });
    await loadCodes();
  };

  const unused = codes.filter(c => !c.is_used);
  const used = codes.filter(c => c.is_used);

  if (isLoading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Access Codes</h3>
          <p className="text-sm text-gray-500">Generate one-time codes so people can publish an announcement</p>
        </div>
        <Button onClick={handleCreate} disabled={isCreating} className="bg-[#8B4513] hover:bg-[#5C2E0F]">
          <Plus className="w-4 h-4 mr-1" /> Generate Code
        </Button>
      </div>

      {/* Available codes */}
      {unused.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Available ({unused.length})</h4>
          <div className="grid gap-2">
            {unused.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Key className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-mono text-lg font-bold text-gray-900 dark:text-white tracking-wider">{c.code}</span>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(c.code, c.id)}>
                    {copiedId === c.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => setDeleteTarget(c)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Used codes */}
      {used.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Used ({used.length})</h4>
          <div className="grid gap-2">
            {used.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 opacity-70">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Key className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <span className="font-mono text-sm font-bold text-gray-500 line-through">{c.code}</span>
                    <p className="text-xs text-gray-400">Used by {c.used_by_name || c.used_by_email || "unknown"} • {c.used_date ? new Date(c.used_date).toLocaleDateString() : ""}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">Used</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {codes.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <Key className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No access codes yet. Generate one to share with someone.</p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete code {deleteTarget?.code}?</AlertDialogTitle>
            <AlertDialogDescription>This code will no longer be usable.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}