import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Megaphone, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/i18n/LanguageProvider";

import AnnouncementCard from "../components/announcements/AnnouncementCard";
import AnnouncementForm from "../components/announcements/AnnouncementForm";
import WelcomeModal from "../components/welcome/WelcomeModal";

export default function AnnouncementsPage() {
  const { t, changeLanguage } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem("welcome_seen"));
  const { toast } = useToast();

  const startY = React.useRef(0);
  const isPulling = React.useRef(false);

  const [canPostOnce, setCanPostOnce] = useState(false);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { filterAnnouncements(); }, [announcements, searchTerm, categoryFilter]);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) { startY.current = e.touches[0].clientY; isPulling.current = true; }
    };
    const handleTouchMove = (e) => {
      if (!isPulling.current) return;
      const distance = e.touches[0].clientY - startY.current;
      if (distance > 0 && distance < 150) setPullDistance(distance);
    };
    const handleTouchEnd = async () => {
      if (pullDistance > 80 && !isRefreshing) { setIsRefreshing(true); await loadData(); setIsRefreshing(false); }
      setPullDistance(0); isPulling.current = false;
    };
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    return () => { document.removeEventListener('touchstart', handleTouchStart); document.removeEventListener('touchmove', handleTouchMove); document.removeEventListener('touchend', handleTouchEnd); };
  }, [pullDistance, isRefreshing]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      // Track page view (once per day per user)
      const todayStr = new Date().toISOString().split("T")[0];
      const existing = await base44.entities.PageView.filter({ user_email: currentUser.email, page_name: "Announcements", view_date: todayStr });
      if (existing.length === 0) {
        await base44.entities.PageView.create({ user_email: currentUser.email, user_name: currentUser.full_name || currentUser.email, page_name: "Announcements", view_date: todayStr });
      }
      // Check if user has a one-time post grant
      if (currentUser.one_time_post_granted) setCanPostOnce(true);
    } catch (error) { setUser(null); }
    const data = await base44.entities.Announcement.list();
    const sorted = data.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.date) - new Date(a.date);
    });
    setAnnouncements(sorted);
    setIsLoading(false);
  };

  const filterAnnouncements = () => {
    let filtered = announcements;
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter !== "all") filtered = filtered.filter(a => a.category === categoryFilter);
    setFilteredAnnouncements(filtered);
  };

  const scheduleReminderEmail = async (announcement) => {
    if (!announcement.start_time || !announcement.date) return;
    try {
      const eventDateTime = new Date(`${announcement.date}T${announcement.start_time}`);
      const oneHourBefore = new Date(eventDateTime.getTime() - 60 * 60 * 1000);
      if (oneHourBefore > new Date()) console.log(`Reminder scheduled for: ${oneHourBefore.toLocaleString()}`);
    } catch (error) { console.error("Error scheduling reminder:", error); }
  };

  const sendNotificationEmails = async (announcement) => {
    setIsSendingEmails(true);
    try {
      const allUsers = await base44.entities.User.list();
      const timeStr = announcement.start_time ? new Date(`2000-01-01T${announcement.start_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';
      const emailSubject = `🔔 New Announcement: ${announcement.title}`;
      const emailBody = `
<!DOCTYPE html><html><head><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#5C2E0F;background-color:#F5EFE6;margin:0;padding:20px}.container{max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(139,69,19,0.1)}.header{background:linear-gradient(135deg,#8B4513 0%,#D2691E 100%);padding:40px 30px;text-align:center}.header h1{color:white;margin:0;font-size:28px}.content{padding:40px 30px}.announcement-title{font-size:24px;font-weight:bold;color:#5C2E0F;margin:0 0 20px}.date-badge{display:inline-block;background:#FEF3C7;color:#8B4513;padding:8px 16px;border-radius:20px;font-size:14px;margin-bottom:20px}.description{color:#8B4513;font-size:16px;line-height:1.8;margin:20px 0}.cta-button{display:inline-block;background:linear-gradient(135deg,#8B4513 0%,#D2691E 100%);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;margin:30px 0}.footer{background:#F5EFE6;padding:30px;text-align:center;border-top:2px solid #D2691E}.footer-text{color:#8B4513;font-size:14px;margin:10px 0}</style></head><body><div class="container"><div class="header"><h1>📢 New Announcement</h1></div><div class="content"><h2 class="announcement-title">${announcement.title}</h2><div class="date-badge">📅 ${new Date(announcement.date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}${timeStr?` at ${timeStr}`:''}</div><hr style="border:none;border-top:2px solid #F5EFE6;margin:30px 0"><div class="description">${announcement.description.replace(/\n/g,'<br>')}</div>${announcement.address?`<p style="color:#8B4513;margin:20px 0">📍 <strong>Location:</strong> ${announcement.address}</p>`:''}<div style="text-align:center"><a href="${window.location.origin}" class="cta-button">View Full Announcement</a></div></div><div class="footer"><p class="footer-text">Food Pantry Bountiful Blessings</p><p class="footer-text">Serving the community with love and compassion</p></div></div></body></html>`.trim();
      const emailPromises = allUsers.map(u =>
        base44.integrations.Core.SendEmail({ from_name: "Food Pantry Bountiful Blessings", to: u.email, subject: emailSubject, body: emailBody }).catch(error => { console.error(`Failed to send email to ${u.email}:`, error); return null; })
      );
      await Promise.all(emailPromises);
      toast({ title: `📧 ${t('announcements.notifSent')}`, description: t('announcements.notifSentDesc').replace('{count}', allUsers.length) });
    } catch (error) {
      toast({ title: `⚠️ ${t('announcements.notifError')}`, description: t('announcements.notifErrorDesc'), variant: "destructive" });
    } finally { setIsSendingEmails(false); }
  };

  const handleSubmit = async (data) => {
    try {
      const newAnnouncement = await base44.entities.Announcement.create(data);
      setShowForm(false);

      // If this was a one-time post, revoke the grant
      if (canPostOnce && user?.role !== 'admin') {
        await base44.auth.updateMe({ one_time_post_granted: false });
        if (user.one_time_post_code_id) {
          await base44.entities.AccessCode.update(user.one_time_post_code_id, { announcement_id: newAnnouncement.id });
        }
        setCanPostOnce(false);
      }

      if (user?.role === 'admin') {
        sendNotificationEmails(newAnnouncement);
      }
      scheduleReminderEmail(newAnnouncement);
      loadData();
      toast({ title: `✅ ${t('announcements.created')}`, description: user?.role === 'admin' ? t('announcements.sendingEmails') : "Your announcement has been published!" });
    } catch (error) {
      toast({ title: `❌ ${t('common.error')}`, description: t('announcements.createError'), variant: "destructive" });
    }
  };

  const handleWelcomeComplete = (lang) => {
    changeLanguage(lang);
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen">
      {showWelcome && <WelcomeModal onComplete={handleWelcomeComplete} />}
      {pullDistance > 0 && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[60] transition-opacity" style={{ opacity: Math.min(pullDistance / 80, 1) }}>
          <div className={`bg-white dark:bg-card rounded-full p-3 shadow-lg border-2 border-amber-300 dark:border-amber-700 ${isRefreshing ? 'animate-spin' : ''}`}>
            <motion.div animate={{ rotate: isRefreshing ? 360 : pullDistance * 3 }} transition={{ duration: isRefreshing ? 1 : 0, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}>
              <RefreshCw className="w-5 h-5 text-[#8B4513] dark:text-amber-400" />
            </motion.div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#D2691E] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
              <Megaphone className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{t('announcements.heroTitle')}</h1>
            <p className="text-base sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">{t('announcements.heroSubtitle')}</p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]/50 w-5 h-5" />
            <Input placeholder={t('announcements.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-amber-300 focus:border-[#8B4513] bg-white" />
          </div>
          <div className="flex gap-3 flex-wrap">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] border-amber-300 bg-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('announcements.allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('announcements.allCategories')}</SelectItem>
                <SelectItem value="food_distribution">{t('announcements.food_distribution')}</SelectItem>
                <SelectItem value="community_event">{t('announcements.community_event')}</SelectItem>
                <SelectItem value="volunteer">{t('announcements.volunteer')}</SelectItem>
                <SelectItem value="donation_drive">{t('announcements.donation_drive')}</SelectItem>
                <SelectItem value="news">{t('announcements.news')}</SelectItem>
              </SelectContent>
            </Select>
            {(user?.role === 'admin' || canPostOnce) && (
              <Button onClick={() => setShowForm(true)} disabled={isSendingEmails} className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all text-sm">
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{canPostOnce && user?.role !== 'admin' ? "Publish (1 time)" : t('announcements.newAnnouncement')}</span>
                <span className="sm:hidden">{t('common.add')}</span>
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mb-8">
              <AnnouncementForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (<div key={i} className="h-80 bg-white/50 rounded-2xl animate-pulse" />))}
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement, index) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} index={index} onDelete={loadData} user={user} />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-24 h-24 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Megaphone className="w-12 h-12 text-[#8B4513]" />
            </div>
            <h3 className="text-2xl font-bold text-[#5C2E0F] mb-2">{t('announcements.noResults')}</h3>
            <p className="text-[#8B4513] max-w-md mx-auto">
              {searchTerm || categoryFilter !== "all" ? t('announcements.tryAdjusting') : t('announcements.checkBack')}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}