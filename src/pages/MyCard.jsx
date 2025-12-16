import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CreditCard, User as UserIcon, Hash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function MyCardPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const cardRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      toast({
        title: "⛔ Authentication Required",
        description: "Please log in to view your card.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: '#FFFBF0',
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `food-pantry-card-${user.full_name.replace(/\s/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: "✅ Card Downloaded!",
        description: "Your digital card has been saved.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "❌ Download Failed",
        description: "Please try again or take a screenshot.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md border-amber-200">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-[#5C2E0F] mb-4">
              Authentication Required
            </h2>
            <p className="text-[#8B4513]">Please log in to view your card.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasBarcode = user.barcode_number && user.barcode_number.trim() !== '';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl mb-3">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#5C2E0F] mb-2">
            My ID Card
          </h1>
          <p className="text-[#8B4513] text-lg">
            Your Food Pantry identification card
          </p>
        </div>

        {/* Card Preview */}
        <div className="mb-6">
          <div 
            ref={cardRef}
            className="bg-gradient-to-br from-[#FFFBF0] via-amber-50 to-orange-50 rounded-3xl shadow-2xl border-4 border-[#8B4513] p-8 sm:p-12 max-w-2xl mx-auto"
          >
            {/* Card Header with Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e4114143e84ad0df65d068/512622c87_1762982225481.jpg"
                alt="Bountiful Blessings Food Pantry"
                className="h-24 sm:h-32 w-auto object-contain"
              />
            </div>

            {/* Divider */}
            <div className="border-t-2 border-[#8B4513]/20 mb-8"></div>

            {/* User Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-[#8B4513]/70 font-medium">Cardholder Name</p>
                  <p className="text-2xl font-bold text-[#5C2E0F]">{user.full_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-full flex items-center justify-center flex-shrink-0">
                  <Hash className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-[#8B4513]/70 font-medium">Member ID</p>
                  <p className="text-xl font-mono font-bold text-[#5C2E0F]">
                    {hasBarcode ? user.barcode_number : 'Not Assigned'}
                  </p>
                </div>
              </div>
            </div>

            {/* Barcode Section */}
            {hasBarcode ? (
              <div className="bg-white rounded-2xl p-6 border-2 border-[#8B4513]/20">
                <div className="flex flex-col items-center">
                  <img
                    src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(user.barcode_number)}&code=Code128&translate-esc=on&dpi=96&imagetype=Gif`}
                    alt="Barcode"
                    className="max-w-full h-20 sm:h-24 object-contain mb-3"
                  />
                  <p className="text-lg font-mono font-bold text-[#5C2E0F] tracking-wider">
                    {user.barcode_number}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200 text-center">
                <p className="text-[#8B4513] font-medium">
                  📋 Your barcode number has not been assigned yet.
                </p>
                <p className="text-sm text-[#8B4513]/70 mt-2">
                  Please contact the administrator to receive your member ID.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[#8B4513]/70">
                Valid for all Food Pantry Bountiful Blessings services
              </p>
              <p className="text-xs text-[#8B4513]/60 mt-2">
                Member since {new Date(user.created_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {hasBarcode && (
          <div className="flex justify-center">
            <Button
              onClick={handleDownload}
              size="lg"
              className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D] text-white shadow-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Card
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}