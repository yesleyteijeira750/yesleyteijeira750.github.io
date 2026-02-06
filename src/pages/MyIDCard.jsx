import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CreditCard } from "lucide-react";
import Barcode from "react-barcode";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";

export default function MyIDCardPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      base44.auth.redirectToLogin(window.location.pathname);
    }
    setIsLoading(false);
  };

  const handleDownload = async () => {
    const cardElement = document.getElementById("id-card");
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: "#FFFBF0",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `${user?.full_name || "member"}-id-card.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error downloading card:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] dark:border-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] dark:from-[#D2691E] dark:to-[#8B4513] rounded-2xl mb-3">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#5C2E0F] dark:text-amber-100 mb-2">
              My ID Card
            </h1>
            <p className="text-[#8B4513] dark:text-amber-200/80">
              Show this card when visiting the food pantry
            </p>
          </div>

          <Card
            id="id-card"
            className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-[#FFFBF0] to-amber-50 dark:from-card dark:to-amber-950/20 overflow-hidden"
          >
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e4114143e84ad0df65d068/512622c87_1762982225481.jpg"
                  alt="Food Pantry Logo"
                  className="h-20 w-auto mx-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-[#5C2E0F] dark:text-amber-100 mb-1">
                  Member ID Card
                </h2>
                <p className="text-sm text-[#8B4513] dark:text-amber-200/80">
                  Bountiful Blessings Food Pantry
                </p>
              </div>

              <div className="bg-white dark:bg-background rounded-xl p-6 mb-6 border-2 border-[#8B4513] dark:border-amber-700">
                <div className="mb-4">
                  <p className="text-sm text-[#8B4513]/60 dark:text-amber-200/60 mb-1">Name</p>
                  <p className="text-xl font-bold text-[#5C2E0F] dark:text-amber-100">
                    {user?.full_name || "Member"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#8B4513]/60 dark:text-amber-200/60 mb-1">Member ID</p>
                  <p className="text-lg font-mono font-bold text-[#8B4513] dark:text-amber-300">
                    {user?.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              {user?.id && (
                <div className="bg-white dark:bg-background rounded-xl p-6 flex justify-center border-2 border-[#8B4513] dark:border-amber-700">
                  <Barcode
                    value={user.id}
                    format="CODE128"
                    height={80}
                    displayValue={false}
                    background="transparent"
                    lineColor={document.documentElement.classList.contains('dark') ? '#FCD34D' : '#8B4513'}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleDownload}
              className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] dark:from-[#D2691E] dark:to-[#8B4513] hover:from-[#5C2E0F] hover:to-[#A0522D] text-white"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Card
            </Button>
          </div>

          <div className="mt-8 text-center">
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-6">
                <p className="text-sm text-[#8B4513] dark:text-amber-200/80">
                  💡 <strong>Tip:</strong> Save this card to your phone or print it out. Staff will
                  scan your barcode for quick check-in at the food pantry.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}