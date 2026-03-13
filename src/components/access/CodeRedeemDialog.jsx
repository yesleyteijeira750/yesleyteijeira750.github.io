import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CodeRedeemDialog({ open, onOpenChange }) {
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setIsChecking(true);
    const normalized = code.trim().toUpperCase();
    const matches = await base44.entities.AccessCode.filter({ code: normalized });
    const accessCode = matches[0];

    if (!accessCode) {
      toast({ title: "❌ Invalid code", description: "This code does not exist.", variant: "destructive" });
      setIsChecking(false);
      return;
    }

    if (accessCode.is_used) {
      toast({ title: "❌ Code already used", description: "This code has already been redeemed.", variant: "destructive" });
      setIsChecking(false);
      return;
    }

    // Mark as used
    let user = null;
    try { user = await base44.auth.me(); } catch {}

    await base44.entities.AccessCode.update(accessCode.id, {
      is_used: true,
      used_by_email: user?.email || "anonymous",
      used_by_name: user?.full_name || "Anonymous",
      used_date: new Date().toISOString()
    });

    // Save grant to user record
    if (user) {
      await base44.auth.updateMe({ 
        one_time_post_granted: true,
        one_time_post_code_id: accessCode.id 
      });
    }

    toast({ title: "✅ Code accepted!", description: "You can now create one announcement." });
    setCode("");
    setIsChecking(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#F5EFE6] dark:bg-gray-900 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[#5C2E0F] dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5" /> Enter Access Code
          </DialogTitle>
          <DialogDescription className="text-[#8B4513] dark:text-amber-200">
            Enter your unique code to publish an announcement.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder="XXXX-XXXX"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            className="text-center font-mono text-xl tracking-widest border-amber-300 focus:border-[#8B4513]"
            maxLength={9}
            onKeyDown={e => e.key === "Enter" && handleRedeem()}
          />
          <Button onClick={handleRedeem} disabled={isChecking || !code.trim()} className="w-full bg-[#8B4513] hover:bg-[#5C2E0F]">
            {isChecking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
            Redeem Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}