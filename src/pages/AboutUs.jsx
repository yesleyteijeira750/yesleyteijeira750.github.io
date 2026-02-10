import React from "react";
import { motion } from "framer-motion";
import { Heart, Users, HandHeart, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function AboutUsPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#D2691E] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6"><Heart className="w-10 h-10 fill-white" /></div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">{t('about.heroTitle')}</h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">{t('about.heroSubtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
          <Card className="border-2 border-amber-200 shadow-xl"><CardContent className="p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-[#5C2E0F] mb-6">{t('about.missionTitle')}</h2>
            <p className="text-lg text-[#8B4513] leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: t('about.missionIntro') }} />
            <p className="text-xl font-semibold text-[#5C2E0F] mt-4 mb-4">{t('about.missionQuote')}</p>
            <p className="text-lg text-[#8B4513] leading-relaxed">{t('about.missionText')}</p>
          </CardContent></Card>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Heart, title: t('about.compassion'), desc: t('about.compassionDesc'), delay: 0.3, fill: true },
            { icon: Users, title: t('about.community'), desc: t('about.communityDesc'), delay: 0.4 },
            { icon: HandHeart, title: t('about.service'), desc: t('about.serviceDesc'), delay: 0.5 },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: item.delay }}>
              <Card className="border-amber-200 hover:shadow-xl transition-shadow h-full"><CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className={`w-8 h-8 text-white ${item.fill ? 'fill-white' : ''}`} />
                </div>
                <h3 className="text-xl font-bold text-[#5C2E0F] mb-3">{item.title}</h3>
                <p className="text-[#8B4513]">{item.desc}</p>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-2 border-amber-200 shadow-xl"><CardContent className="p-8 sm:p-12">
            <div className="flex items-center gap-3 mb-6"><Target className="w-8 h-8 text-[#8B4513]" /><h2 className="text-3xl font-bold text-[#5C2E0F]">{t('about.whatWeDo')}</h2></div>
            <div className="space-y-4 text-lg text-[#8B4513]">
              <p className="flex items-start gap-3"><span className="text-2xl">🍎</span><span><strong>{t('about.foodDist')}</strong> {t('about.foodDistDesc')}</span></p>
              <p className="flex items-start gap-3"><span className="text-2xl">🤝</span><span><strong>{t('about.commEvents')}</strong> {t('about.commEventsDesc')}</span></p>
              <p className="flex items-start gap-3"><span className="text-2xl">💝</span><span><strong>{t('about.volOpp')}</strong> {t('about.volOppDesc')}</span></p>
              <p className="flex items-start gap-3"><span className="text-2xl">📦</span><span><strong>{t('about.donDrives')}</strong> {t('about.donDrivesDesc')}</span></p>
            </div>
          </CardContent></Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-12 text-center bg-gradient-to-r from-[#8B4513] to-[#D2691E] rounded-2xl p-8 sm:p-12 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-4">{t('about.joinUs')}</h2>
          <p className="text-xl mb-6 opacity-90">{t('about.joinUsDesc')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+19418838439" className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#8B4513] rounded-xl font-semibold hover:bg-amber-100 transition-colors">📞 {t('about.callUs')} (941) 883-8439</a>
            <a href="mailto:aguilesa@gmail.com" className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#8B4513] rounded-xl font-semibold hover:bg-amber-100 transition-colors">📧 {t('about.emailUs')}</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}