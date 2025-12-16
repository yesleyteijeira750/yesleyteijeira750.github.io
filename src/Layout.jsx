import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Bell, Shield, Menu, X, Home, Info, Phone, CreditCard } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ChatBot from "./components/chat/ChatBot";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const isAdmin = user?.role === "admin";

  const menuItems = [
    { name: "Home", icon: Home, path: "Announcements" },
    { name: "Announcements", icon: Bell, path: "Announcements" },
    { name: "My ID Card", icon: CreditCard, path: "MyCard", requireAuth: true },
    { name: "About Us", icon: Info, path: "AboutUs" },
    { name: "Contact", icon: Phone, path: "Contact" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <style>{`
        :root {
          --primary: #8B4513;
          --primary-dark: #5C2E0F;
          --secondary: #D2691E;
          --accent: #CD853F;
          --bg-cream: #FFFBF0;
        }
      `}</style>

      {/* Header */}
      <header className="bg-[#FFFBF0] backdrop-blur-md border-b border-amber-200 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <Link to={createPageUrl("Announcements")} className="flex items-center gap-3 group">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e4114143e84ad0df65d068/512622c87_1762982225481.jpg"
                alt="Bountiful Blessings Food Pantry"
                className="h-16 sm:h-20 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                to={createPageUrl("Announcements")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  location.pathname === createPageUrl("Announcements")
                    ? "bg-amber-200 text-[#5C2E0F]"
                    : "text-[#8B4513] hover:bg-amber-100"
                }`}
              >
                <Bell className="w-4 h-4" />
                Announcements
              </Link>

              <Link
                to={createPageUrl("Reviews")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  location.pathname === createPageUrl("Reviews")
                    ? "bg-amber-200 text-[#5C2E0F]"
                    : "text-[#8B4513] hover:bg-amber-100"
                }`}
              >
                ⭐ Reviews
              </Link>

              {user && (
                <Link
                  to={createPageUrl("MyCard")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    location.pathname === createPageUrl("MyCard")
                      ? "bg-amber-200 text-[#5C2E0F]"
                      : "text-[#8B4513] hover:bg-amber-100"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  My ID Card
                </Link>
              )}

              <Link
                to={createPageUrl("AboutUs")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  location.pathname === createPageUrl("AboutUs")
                    ? "bg-amber-200 text-[#5C2E0F]"
                    : "text-[#8B4513] hover:bg-amber-100"
                }`}
              >
                <Info className="w-4 h-4" />
                About Us
              </Link>

              <Link
                to={createPageUrl("Contact")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  location.pathname === createPageUrl("Contact")
                    ? "bg-amber-200 text-[#5C2E0F]"
                    : "text-[#8B4513] hover:bg-amber-100"
                }`}
              >
                <Phone className="w-4 h-4" />
                Contact
              </Link>

              {isAdmin && (
                <Link
                  to={createPageUrl("AdminPortal")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    location.pathname === createPageUrl("AdminPortal")
                      ? "bg-amber-200 text-[#5C2E0F]"
                      : "text-[#8B4513] hover:bg-amber-100"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[#8B4513]/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.full_name?.[0] || "U"}
                    </span>
                  </div>
                  {isAdmin && (
                    <span className="text-xs font-medium text-[#5C2E0F] bg-amber-200 px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
              ) : null}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-[#8B4513] hover:bg-amber-100"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-amber-200 bg-[#FFFBF0]"
            >
              <nav className="px-4 py-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  if (item.requireAuth && !user) return null;
                  
                  return (
                    <Link
                      key={item.path}
                      to={createPageUrl(item.path)}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                        location.pathname === createPageUrl(item.path)
                          ? "bg-amber-200 text-[#5C2E0F]"
                          : "text-[#8B4513] hover:bg-amber-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}

                <Link
                  to={createPageUrl("Reviews")}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    location.pathname === createPageUrl("Reviews")
                      ? "bg-amber-200 text-[#5C2E0F]"
                      : "text-[#8B4513] hover:bg-amber-100"
                  }`}
                >
                  ⭐ Reviews
                </Link>

                {isAdmin && (
                  <Link
                    to={createPageUrl("AdminPortal")}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      location.pathname === createPageUrl("AdminPortal")
                        ? "bg-amber-200 text-[#5C2E0F]"
                        : "text-[#8B4513] hover:bg-amber-100"
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                    Admin Portal
                  </Link>
                )}

                {user && (
                  <div className="flex items-center gap-3 px-4 py-3 mt-4 border-t border-amber-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.full_name?.[0] || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[#5C2E0F]">{user.full_name}</p>
                      {isAdmin && (
                        <span className="text-xs text-[#8B4513] bg-amber-200 px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <ChatBot />

      <footer className="bg-[#FFFBF0] backdrop-blur-sm border-t border-amber-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e4114143e84ad0df65d068/512622c87_1762982225481.jpg"
              alt="Bountiful Blessings Food Pantry"
              className="h-12 w-auto object-contain"
            />
            <p className="text-sm text-[#8B4513]">
              Serving the community with love ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}