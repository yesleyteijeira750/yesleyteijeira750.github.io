import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Globe, Heart } from "lucide-react";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ht", label: "Kreyòl Ayisyen", flag: "🇭🇹" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

const welcomeMessages = {
  en: {
    welcome: "Welcome to",
    org: "Bountiful Blessings of Charlotte County Inc.",
    body: "This app connects you with our local food assistance program.\nFind distribution schedules, important announcements, upcoming events, and community resources — all in one place.",
    goal: "Our goal is that no one goes to bed hungry.",
    selectLang: "Choose your language",
    continueBtn: "Continue",
  },
  es: {
    welcome: "Bienvenido a",
    org: "Bountiful Blessings of Charlotte County Inc.",
    body: "Esta aplicación te conecta con nuestro programa local de asistencia alimentaria.\nEncuentra horarios de distribución, anuncios importantes, próximos eventos y recursos comunitarios — todo en un solo lugar.",
    goal: "Nuestra meta es que nadie se vaya a la cama con hambre.",
    selectLang: "Elige tu idioma",
    continueBtn: "Continuar",
  },
  ht: {
    welcome: "Byenveni nan",
    org: "Bountiful Blessings of Charlotte County Inc.",
    body: "Aplikasyon sa a konekte ou ak pwogram asistans alimantè lokal nou an.\nJwenn orè distribisyon, anons enpòtan, evènman kap vini ak resous kominote — tout nan yon sèl kote.",
    goal: "Objektif nou se pou pèsonn pa al dòmi grangou.",
    selectLang: "Chwazi lang ou",
    continueBtn: "Kontinye",
  },
  ru: {
    welcome: "Добро пожаловать в",
    org: "Bountiful Blessings of Charlotte County Inc.",
    body: "Это приложение связывает вас с нашей местной программой продовольственной помощи.\nНаходите расписание раздач, важные объявления, предстоящие мероприятия и ресурсы сообщества — всё в одном месте.",
    goal: "Наша цель — чтобы никто не ложился спать голодным.",
    selectLang: "Выберите язык",
    continueBtn: "Продолжить",
  },
};

export default function WelcomeModal({ onComplete }) {
  const [step, setStep] = useState("language"); // "language" or "welcome"
  const [selectedLang, setSelectedLang] = useState(null);

  const msg = welcomeMessages[selectedLang] || welcomeMessages.en;

  const handleLanguageSelect = (code) => {
    setSelectedLang(code);
    setStep("welcome");
  };

  const handleContinue = () => {
    localStorage.setItem("language", selectedLang);
    localStorage.setItem("welcome_seen", "true");
    onComplete(selectedLang);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === "language" ? (
          <motion.div
            key="language"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35 }}
            className="bg-white dark:bg-card rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#D2691E] p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-white/90 text-sm">Choose your language</p>
                <p className="text-white/90 text-sm">Elige tu idioma</p>
                <p className="text-white/90 text-sm">Chwazi lang ou</p>
                <p className="text-white/90 text-sm">Выберите язык</p>
              </div>
            </div>

            {/* Language buttons */}
            <div className="p-6 space-y-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-amber-200 hover:border-[#8B4513] hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group"
                >
                  <span className="text-3xl">{lang.flag}</span>
                  <span className="text-lg font-semibold text-[#5C2E0F] dark:text-white group-hover:text-[#8B4513]">
                    {lang.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35 }}
            className="bg-white dark:bg-card rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#D2691E] p-8 text-center">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e4114143e84ad0df65d068/512622c87_1762982225481.jpg"
                alt="Bountiful Blessings"
                className="h-20 w-auto mx-auto mb-4 object-contain rounded-xl"
              />
              <p className="text-white/80 text-sm font-medium">{msg.welcome}</p>
              <h2 className="text-xl font-bold text-white mt-1">{msg.org}</h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <p className="text-[#5C2E0F] dark:text-amber-100 leading-relaxed whitespace-pre-line text-sm">
                {msg.body}
              </p>

              <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4">
                <Heart className="w-6 h-6 text-red-500 flex-shrink-0" />
                <p className="text-[#8B4513] dark:text-amber-200 font-semibold text-sm italic">
                  "{msg.goal}"
                </p>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D] text-white py-6 rounded-2xl text-lg font-semibold"
              >
                {msg.continueBtn}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}