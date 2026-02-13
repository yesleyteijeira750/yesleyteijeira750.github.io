import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function NotificationSettingsPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    announcements: true, volunteers: true, reminders: true, system_updates: false,
    method_email: true, method_push: true
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (u?.notification_preferences) setNotifications(u.notification_preferences);
      } catch { setUser(null); }
      setIsLoading(false);
    };
    load();
  }, []);

  const handleToggle = async (key) => {
    const newNotifs = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifs);
    try {
      await base44.auth.updateMe({ notification_preferences: newNotifs });
      toast({ title: t('profile.prefsUpdated'), description: t('profile.prefsUpdatedDesc') });
    } catch {
      setNotifications(notifications);
      toast({ title: t('common.error'), description: t('profile.prefsError'), variant: "destructive" });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]" /></div>;

  const items = [
    { key: 'announcements', title: t('profile.newAnnouncements'), desc: t('profile.newAnnouncementsDesc') },
    { key: 'volunteers', title: t('profile.volunteerOpps'), desc: t('profile.volunteerOppsDesc') },
    { key: 'reminders', title: t('profile.eventReminders'), desc: t('profile.eventRemindersDesc') },
    { key: 'system_updates', title: t('profile.systemUpdates'), desc: t('profile.systemUpdatesDesc') },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate(createPageUrl("Profile"))} className="text-[#8B4513] dark:text-amber-400 -ml-2">
          <ArrowLeft className="w-5 h-5 mr-2" />{t('common.back')}
        </Button>

        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl mb-3">
            <Bell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#5C2E0F] dark:text-white">{t('profile.notifications')}</h1>
        </div>

        {/* Categories */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 space-y-3">
            {items.map(item => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-amber-200 dark:border-amber-700">
                <div className="flex-1 mr-3">
                  <p className="font-medium text-[#5C2E0F] dark:text-white text-sm">{item.title}</p>
                  <p className="text-xs text-[#8B4513]/70 dark:text-amber-200/70 mt-0.5">{item.desc}</p>
                </div>
                <Switch checked={notifications[item.key]} onCheckedChange={() => handleToggle(item.key)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}