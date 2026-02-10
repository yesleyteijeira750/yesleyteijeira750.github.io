import React from "react";
import { motion } from "framer-motion";
import { Phone, Mail, Globe, MapPin, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#D2691E] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6"><Phone className="w-10 h-10" /></div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">{t('contact.heroTitle')}</h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">{t('contact.heroSubtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-2 border-amber-200 shadow-xl h-full">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-xl flex items-center justify-center"><Phone className="w-6 h-6 text-white" /></div>
                  <h2 className="text-2xl font-bold text-[#5C2E0F]">{t('contact.generalContact')}</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3"><Globe className="w-5 h-5 text-[#8B4513] mt-1 flex-shrink-0" /><div><p className="text-sm font-semibold text-[#5C2E0F] mb-1">{t('contact.website')}</p><a href="https://bountifulblessingsofcharlottecountyinc.org/" target="_blank" rel="noopener noreferrer" className="text-[#8B4513] hover:underline break-all">bountifulblessingsofcharlottecountyinc.org</a></div></div>
                  <div className="flex items-start gap-3"><Mail className="w-5 h-5 text-[#8B4513] mt-1 flex-shrink-0" /><div><p className="text-sm font-semibold text-[#5C2E0F] mb-1">{t('contact.email')}</p><a href="mailto:aguilesa@gmail.com" className="text-[#8B4513] hover:underline">aguilesa@gmail.com</a></div></div>
                  <div className="flex items-start gap-3"><Phone className="w-5 h-5 text-[#8B4513] mt-1 flex-shrink-0" /><div><p className="text-sm font-semibold text-[#5C2E0F] mb-1">{t('contact.phone')}</p><a href="tel:+19418838439" className="text-[#8B4513] hover:underline">+1 (941) 883-8439</a></div></div>
                </div>
                <div className="mt-6"><Button onClick={() => window.location.href = 'tel:+19418838439'} className="w-full bg-gradient-to-r from-[#8B4513] to-[#D2691E]"><Phone className="w-4 h-4 mr-2" />{t('contact.callNow')}</Button></div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-2 border-amber-200 shadow-xl h-full">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-xl flex items-center justify-center"><MessageCircle className="w-6 h-6 text-white" /></div>
                  <h2 className="text-2xl font-bold text-[#5C2E0F]">{t('contact.appSupport')}</h2>
                </div>
                <p className="text-[#8B4513] mb-6">{t('contact.appSupportDesc')}</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3"><Phone className="w-5 h-5 text-[#8B4513] mt-1 flex-shrink-0" /><div><p className="text-sm font-semibold text-[#5C2E0F] mb-1">{t('contact.appSupportPhone')}</p><a href="tel:+19413102786" className="text-[#8B4513] hover:underline">+1 (941) 310-2786</a></div></div>
                  <div className="flex items-start gap-3"><Mail className="w-5 h-5 text-[#8B4513] mt-1 flex-shrink-0" /><div><p className="text-sm font-semibold text-[#5C2E0F] mb-1">{t('contact.appSupportEmail')}</p><a href="mailto:yesleyteijeira750@gmail.com" className="text-[#8B4513] hover:underline break-all">yesleyteijeira750@gmail.com</a></div></div>
                </div>
                <div className="mt-6"><Button onClick={() => window.location.href = 'tel:+19413102786'} className="w-full bg-gradient-to-r from-[#8B4513] to-[#D2691E]"><Phone className="w-4 h-4 mr-2" />{t('contact.callAppSupport')}</Button></div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-2 border-amber-200 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6"><MapPin className="w-8 h-8 text-[#8B4513]" /><h2 className="text-2xl font-bold text-[#5C2E0F]">{t('contact.visitUs')}</h2></div>
              <p className="text-lg text-[#8B4513] mb-6">{t('contact.visitUsDesc')}</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <p className="text-[#8B4513]"><strong className="text-[#5C2E0F]">{t('contact.proTip')}</strong> {t('contact.proTipDesc')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0"><Phone className="w-6 h-6 text-red-600" /></div>
            <div>
              <h3 className="text-xl font-bold text-red-900 mb-2">{t('contact.emergencyTitle')}</h3>
              <p className="text-red-800 mb-4">{t('contact.emergencyDesc')}</p>
              <a href="tel:+19418838439" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"><Phone className="w-5 h-5" />{t('contact.callEmergency')} (941) 883-8439</a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}