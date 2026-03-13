import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Bell, Shield, Menu, X, Home, Info, Phone, CreditCard, Heart, Settings as SettingsIcon, Calendar as CalendarIcon, ArrowLeft, BookOpen, Camera, Gift } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageProvider, useLanguage } from "@/components/i18n/LanguageProvider";


const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
};

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LayoutContent currentPageName={currentPageName}>{children}</LayoutContent>
    </LanguageProvider>
  );
}

function LayoutContent({ children, currentPageName }) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [isMobile, setIsMobile] = React.useState(false);


  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isAdmin = user?.role === "admin";

  const bottomTabItems = [
    { name: t('nav.home'), icon: Home, path: "Announcements" },
    { name: t('nav.resources'), icon: BookOpen, path: "Resources" },
    { name: t('nav.gallery'), icon: Camera, path: "Gallery" },
    { name: "Raffle", icon: Gift, path: "__raffle__", external: "https://rafflebbofcc.base44.app/" },
    ...(isAdmin ? [{ name: t('nav.admin'), icon: Shield, path: "AdminPortal" }] : []),
    { name: t('nav.profile'), icon: SettingsIcon, path: "Profile", requireAuth: true }
  ];

  const detailPages = ["AnnouncementDetail", "PrivacyPolicy"];
  const isDetailPage = detailPages.includes(currentPageName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-950 dark:to-gray-900">
      {/* Header */}
      <header className="bg-[#FFFBF0] dark:bg-card backdrop-blur-md border-b border-amber-200 dark:border-amber-800 sticky top-0 z-50 shadow-md safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {isMobile && isDetailPage ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-[#8B4513] dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
            ) : (
              <Link to={createPageUrl("Announcements")} className="flex items-center gap-3 group">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e4114143e84ad0df65d068/512622c87_1762982225481.jpg"
                  alt="Bountiful Blessings Food Pantry"
                  className="h-12 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </Link>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link to={createPageUrl("Announcements")} className={`px-3 py-2 rounded-xl font-medium transition-all text-sm ${location.pathname === createPageUrl("Announcements") ? "bg-amber-200 dark:bg-amber-900 text-[#5C2E0F] dark:text-white" : "text-[#8B4513] dark:text-white hover:bg-amber-100 dark:hover:bg-amber-900/20"}`}>
                {t('nav.home')}
              </Link>
              <Link to={createPageUrl("Resources")} className={`px-3 py-2 rounded-xl font-medium transition-all text-sm ${location.pathname === createPageUrl("Resources") ? "bg-amber-200 dark:bg-amber-900 text-[#5C2E0F] dark:text-white" : "text-[#8B4513] dark:text-white hover:bg-amber-100 dark:hover:bg-amber-900/20"}`}>
                {t('nav.resources')}
              </Link>
              <Link to={createPageUrl("Gallery")} className={`px-3 py-2 rounded-xl font-medium transition-all text-sm ${location.pathname === createPageUrl("Gallery") ? "bg-amber-200 dark:bg-amber-900 text-[#5C2E0F] dark:text-white" : "text-[#8B4513] dark:text-white hover:bg-amber-100 dark:hover:bg-amber-900/20"}`}>
                {t('nav.gallery')}
              </Link>
              <a href="https://rafflebbofcc.base44.app/" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-xl font-medium transition-all text-sm text-[#8B4513] dark:text-white hover:bg-amber-100 dark:hover:bg-amber-900/20 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" /> Raffle
              </a>
              {isAdmin && (
                <>
                  <Link to={createPageUrl("CheckInSystem")} className={`px-3 py-2 rounded-xl font-medium transition-all text-sm ${location.pathname === createPageUrl("CheckInSystem") ? "bg-amber-200 dark:bg-amber-900 text-[#5C2E0F] dark:text-white" : "text-[#8B4513] dark:text-white hover:bg-amber-100 dark:hover:bg-amber-900/20"}`}>
                    {t('nav.checkin')}
                  </Link>
                  <Link to={createPageUrl("Analytics")} className={`px-3 py-2 rounded-xl font-medium transition-all text-sm ${location.pathname === createPageUrl("Analytics") ? "bg-amber-200 dark:bg-amber-900 text-[#5C2E0F] dark:text-white" : "text-[#8B4513] dark:text-white hover:bg-amber-100 dark:hover:bg-amber-900/20"}`}>
                    {t('nav.analytics')}
                  </Link>
                  <Link to={createPageUrl("AdminPortal")} className={`flex items-center gap-1 px-3 py-2 rounded-xl font-medium transition-all text-sm ${location.pathname === createPageUrl("AdminPortal") ? "bg-amber-200 dark:bg-amber-900 text-[#5C2E0F] dark:text-white" : "text-[#8B4513] dark:text-white hover:bg-amber-100 dark:hover:bg-amber-900/20"}`}>
                    <Shield className="w-3 h-3" />
                    {t('nav.admin')}
                  </Link>
                </>
              )}
              {user ? (
                <Link to={createPageUrl("Profile")} className="flex items-center gap-2 ml-2 pl-2 border-l border-[#8B4513]/20 dark:border-amber-700/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#8B4513] to-[#D2691E] dark:from-[#D2691E] dark:to-[#8B4513] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{user.full_name?.[0] || "U"}</span>
                  </div>
                  {isAdmin && (
                    <span className="text-xs font-medium text-[#5C2E0F] dark:text-white bg-amber-200 dark:bg-amber-900 px-2 py-1 rounded-full">
                      {t('common.admin')}
                    </span>
                  )}
                </Link>
              ) : null}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && !isDetailPage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#FFFBF0] dark:bg-card border-t border-amber-200 dark:border-amber-800 z-40 safe-area-bottom">
          <div className="flex justify-around items-center py-2 px-2">
            {bottomTabItems.map((item) => {
              if (item.requireAuth && !user) return null;
              const Icon = item.icon;
              if (item.external) {
                return (
                  <a key={item.path} href={item.external} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all text-[#8B4513] dark:text-white">
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </a>
                );
              }
              const isActive = location.pathname === createPageUrl(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    if (isActive) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      navigate(createPageUrl(item.path), { replace: true });
                    } else {
                      navigate(createPageUrl(item.path));
                    }
                  }}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${isActive ? "bg-amber-200 dark:bg-amber-900 text-[#5C2E0F] dark:text-white" : "text-[#8B4513] dark:text-white"}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <footer className="bg-[#FFFBF0] dark:bg-card backdrop-blur-sm border-t border-amber-200 dark:border-amber-800 mt-16 safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e4114143e84ad0df65d068/512622c87_1762982225481.jpg"
              alt="Bountiful Blessings Food Pantry"
              className="h-12 w-auto object-contain"
            />
            <p className="text-sm text-[#8B4513] dark:text-amber-200">
              {t('footer.serving')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}