import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, Moon, Sun, Globe, Shield, FileText, Trash2, MessageCircle, Calendar as CalendarIcon, Info, Phone, Heart, BookOpen, Camera, ChevronRight, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ProfilePage() {
  const { t, language, changeLanguage } = useLanguage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark" || (localStorage.getItem("theme") === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches));
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try { const u = await base44.auth.me(); setUser(u); } catch { setUser(null); }
    setIsLoading(false);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode; setIsDarkMode(newMode);
    if (newMode) { document.documentElement.classList.add("dark"); localStorage.setItem("theme", "dark"); }
    else { document.documentElement.classList.remove("dark"); localStorage.setItem("theme", "light"); }
  };

  const handleLanguageChange = (newLang) => { changeLanguage(newLang); };

  const handleDeleteAccount = async () => {
    try { await base44.asServiceRole.entities.User.delete(user.id); toast({ title: t('profile.accountDeleted'), description: t('profile.accountDeletedDesc') }); setTimeout(() => base44.auth.logout(), 2000); }
    catch { toast({ title: t('common.error'), description: t('profile.deleteError'), variant: "destructive" }); }
  };

  const menuItems = [
    { icon: Bell, label: t('profile.notifications'), path: "NotificationSettings" },
    { icon: CalendarIcon, label: t('profile.calendar'), path: "Calendar" },
    { icon: Info, label: t('profile.about'), path: "AboutUs" },
    { icon: Phone, label: t('profile.contact'), path: "Contact" },
    { icon: Heart, label: t('profile.volunteersLink'), path: "Volunteers" },
    { icon: BookOpen, label: t('profile.stories'), path: "Stories" },
    { icon: Info, label: t('profile.reviews'), path: "Reviews" },
    { icon: FileText, label: t('profile.privacy'), path: "PrivacyPolicy" }
  ];

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] dark:border-amber-400" /></div>;

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-amber-200 dark:border-amber-800"><CardContent className="p-12 text-center">
        <User className="w-16 h-16 text-[#8B4513] dark:text-amber-400 opacity-30 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#5C2E0F] dark:text-white mb-2">{t('profile.loginPrompt')}</h3>
        <Button onClick={() => base44.auth.redirectToLogin(window.location.pathname)} className="mt-4 bg-[#8B4513] hover:bg-[#5C2E0F] dark:bg-amber-600 dark:hover:bg-amber-700">{t('common.login')}</Button>
      </CardContent></Card>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-amber-200 dark:border-amber-800"><CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#8B4513] to-[#D2691E] dark:from-amber-600 dark:to-amber-800 rounded-full flex items-center justify-center"><span className="text-white text-3xl font-bold">{user.full_name?.[0] || "U"}</span></div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#5C2E0F] dark:text-white mb-1">{user.full_name}</h1>
                <p className="text-[#8B4513] dark:text-white mb-2">{user.email}</p>
                <a href="https://wa.me/19413102786" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[#8B4513] dark:text-white hover:underline"><MessageCircle className="w-4 h-4" />{t('profile.supportChat')} +1 (941) 310-2786</a>
                {user.role === "admin" && <div className="mt-2"><span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-gradient-to-r from-[#8B4513] to-[#D2691E] dark:from-amber-600 dark:to-amber-800 px-3 py-1 rounded-full"><Shield className="w-3 h-3" />{t('profile.admin')}</span></div>}
              </div>
            </div>
          </CardContent></Card>
        </motion.div>

        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800"><CardTitle className="text-[#5C2E0F] dark:text-white">{t('profile.settings')}</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border border-amber-200 dark:border-amber-700">
              <div className="flex items-center gap-3">{isDarkMode ? <Moon className="w-5 h-5 text-[#8B4513] dark:text-white" /> : <Sun className="w-5 h-5 text-[#8B4513] dark:text-white" />}<span className="text-[#5C2E0F] dark:text-white font-medium">{isDarkMode ? t('profile.dark') : t('profile.light')}</span></div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#5C2E0F] dark:text-white mb-3 flex items-center gap-2"><Globe className="w-4 h-4" />{t('profile.language')}</h3>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="border-amber-300 dark:border-amber-700"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('profile.english')}</SelectItem>
                  <SelectItem value="es">{t('profile.spanish')}</SelectItem>
                  <SelectItem value="ht">{t('profile.creole')}</SelectItem>
                  <SelectItem value="ru">{t('profile.russian')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800"><CardTitle className="text-[#5C2E0F] dark:text-white">{t('profile.navigation')}</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {menuItems.map((item) => { const Icon = item.icon; return (
                <button key={item.path} onClick={() => navigate(createPageUrl(item.path))} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3"><Icon className="w-5 h-5 text-[#8B4513] dark:text-amber-400" /><span className="text-[#5C2E0F] dark:text-white font-medium">{item.label}</span></div>
                  <ChevronRight className="w-5 h-5 text-[#8B4513] dark:text-amber-400" />
                </button>
              ); })}
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => base44.auth.logout()} variant="outline" className="w-full border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-gray-800 text-[#5C2E0F] dark:text-white"><LogOut className="w-5 h-5 mr-2" />{t('profile.logout')}</Button>
        <Button onClick={() => setShowDeleteDialog(true)} variant="destructive" className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"><Trash2 className="w-4 h-4 mr-2" />{t('profile.deleteAccount')}</Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#5C2E0F] dark:text-white">{t('profile.deleteAccount')}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8B4513] dark:text-white">{t('profile.deleteWarning')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:border-amber-700 dark:text-white">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">{t('common.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}