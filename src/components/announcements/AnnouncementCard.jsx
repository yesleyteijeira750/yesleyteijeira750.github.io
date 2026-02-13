import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Package, Users, DollarSign, Newspaper, ArrowRight, Pin, Trash2, Shield, MapPin, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useAutoTranslate } from "@/components/i18n/useAutoTranslate";

const DEFAULT_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e4114143e84ad0df65d068/61281850d_Clipped_image_20251006_150708.png";

export default function AnnouncementCard({ announcement, index, onDelete, user }) {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { tt } = useAutoTranslate([announcement.title, announcement.description]);

  const categoryConfig = {
    food_distribution: { label: t('announcements.food_distribution'), icon: Package, color: "bg-green-100 text-green-700 border-green-200" },
    community_event: { label: t('announcements.community_event'), icon: Users, color: "bg-blue-100 text-blue-700 border-blue-200" },
    volunteer: { label: t('announcements.volunteerOpportunity'), icon: Users, color: "bg-purple-100 text-purple-700 border-purple-200" },
    donation_drive: { label: t('announcements.donation_drive'), icon: DollarSign, color: "bg-amber-100 text-amber-700 border-amber-200" },
    news: { label: t('announcements.news'), icon: Newspaper, color: "bg-orange-100 text-orange-700 border-orange-200" }
  };

  const config = categoryConfig[announcement.category] || categoryConfig.news;
  const CategoryIcon = config.icon;
  const displayImage = announcement.image_url || DEFAULT_IMAGE;

  const formatTime = (time) => {
    if (!time) return '';
    try { return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); } catch { return time; }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (user?.role !== 'admin') { toast({ title: `⛔ ${t('announcements.accessDenied')}`, description: t('announcements.adminOnly'), variant: "destructive" }); return; }
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDialog(false);
    try {
      await base44.entities.Announcement.delete(announcement.id);
      toast({ title: `✅ ${t('announcements.deleted')}`, description: t('announcements.deletedDesc') });
      onDelete();
    } catch (error) {
      toast({ title: `❌ ${t('common.error')}`, description: t('announcements.deleteError'), variant: "destructive" });
    }
  };

  const handleMapClick = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (announcement.address) window.open(`https://www.google.com/maps?q=${encodeURIComponent(announcement.address)}`, '_blank');
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="relative group">
        {user?.role === 'admin' && (
          <Button variant="ghost" size="icon" onClick={handleDeleteClick} className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-red-50 text-red-600 hover:text-red-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        <Link to={createPageUrl(`AnnouncementDetail?id=${announcement.id}`)}>
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-amber-200 bg-white backdrop-blur-sm relative h-full flex flex-col">
            {announcement.is_pinned && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-[#8B4513] text-white border-none shadow-lg"><Pin className="w-3 h-3 mr-1 fill-white" />{t('announcements.pinned')}</Badge>
              </div>
            )}
            <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-amber-100 to-[#F5EFE6]">
              <img src={displayImage} alt={announcement.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-2 mb-3">
                <Badge variant="outline" className={`${config.color} border font-medium text-xs flex-shrink-0`}><CategoryIcon className="w-3 h-3 mr-1" />{config.label}</Badge>
                <div className="flex items-center gap-1 text-xs text-[#8B4513] flex-shrink-0"><Calendar className="w-3 h-3" />{format(parseISO(announcement.date + "T00:00:00"), "MMM d, yyyy")}</div>
              </div>
              {(announcement.start_time || announcement.end_time) && (
                <div className="flex items-center gap-2 text-sm text-[#8B4513] mb-3 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{announcement.start_time && formatTime(announcement.start_time)}{announcement.start_time && announcement.end_time && ' - '}{announcement.end_time && formatTime(announcement.end_time)}</span>
                </div>
              )}
              <h3 className="text-lg sm:text-xl font-bold text-[#5C2E0F] mb-3 group-hover:text-[#8B4513] transition-colors line-clamp-2 break-words">{tt(announcement.title)}</h3>
              <p className="text-[#8B4513]/80 line-clamp-3 mb-4 leading-relaxed text-sm sm:text-base break-words flex-1">{tt(announcement.description)}</p>
              {announcement.address && (
                <Button onClick={handleMapClick} variant="outline" size="sm" className="w-full mb-4 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 transition-all">
                  <MapPin className="w-4 h-4 mr-2" />{t('announcements.viewOnMap')}
                </Button>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-amber-200 mt-auto">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-[#8B4513]/60">{t('announcements.posted')} {format(new Date(announcement.created_date), "MMM d")}</span>
                  {announcement.created_by && (
                    <Badge className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white border-none shadow-md"><Shield className="w-3 h-3 mr-1" />{t('common.admin')}</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-[#8B4513] hover:text-[#5C2E0F] hover:bg-amber-100 group-hover:gap-2 gap-1 transition-all text-sm flex-shrink-0 ml-2">
                  {t('announcements.readMore')}<ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-[#F5EFE6]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#5C2E0F]">{t('announcements.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8B4513]">{t('announcements.deleteDesc').replace('{title}', announcement.title)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#8B4513] text-[#8B4513] hover:bg-amber-100">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}