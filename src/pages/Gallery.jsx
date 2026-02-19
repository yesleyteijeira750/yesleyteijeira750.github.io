import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Plus } from "lucide-react";
import { motion } from "framer-motion";
import PhotoCarousel from "@/components/gallery/PhotoCarousel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ResponsiveSelect from "@/components/ui/ResponsiveSelect";
import { SelectItem } from "@/components/ui/select";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import ImageUploader from "@/components/uploads/ImageUploader";

export default function GalleryPage() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  const startY = React.useRef(0);
  const isPulling = React.useRef(false);
  const [formData, setFormData] = useState({ title: '', image_url: '', event_date: '', category: 'other', description: '' });

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const handleTouchStart = (e) => { if (window.scrollY === 0) { startY.current = e.touches[0].clientY; isPulling.current = true; } };
    const handleTouchMove = (e) => { if (!isPulling.current) return; const d = e.touches[0].clientY - startY.current; if (d > 0 && d < 150) setPullDistance(d); };
    const handleTouchEnd = async () => { if (pullDistance > 80 && !isRefreshing) { setIsRefreshing(true); await loadData(); setIsRefreshing(false); } setPullDistance(0); isPulling.current = false; };
    document.addEventListener('touchstart', handleTouchStart); document.addEventListener('touchmove', handleTouchMove); document.addEventListener('touchend', handleTouchEnd);
    return () => { document.removeEventListener('touchstart', handleTouchStart); document.removeEventListener('touchmove', handleTouchMove); document.removeEventListener('touchend', handleTouchEnd); };
  }, [pullDistance, isRefreshing]);

  const loadData = async () => {
    setIsLoading(true);
    try { setUser(await base44.auth.me()); } catch { setUser(null); }
    try { setPhotos(await base44.entities.Photo.list('-created_date')); } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const handleMultipleUpload = (urls) => {
    setSelectedImages(urls);
    setCurrentImageIndex(0);
    setFormData({ ...formData, image_url: urls[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedImages.length > 1) {
      for (const url of selectedImages) await base44.entities.Photo.create({ ...formData, image_url: url });
      toast({ title: `✅ ${t('gallery.photosAdded')}`, description: t('gallery.photosAddedDesc').replace('{count}', selectedImages.length) });
    } else {
      await base44.entities.Photo.create(formData);
      toast({ title: `✅ ${t('gallery.photoAdded')}`, description: t('gallery.photoAddedDesc') });
    }
    setShowForm(false);
    setFormData({ title: '', image_url: '', event_date: '', category: 'other', description: '' });
    setSelectedImages([]);
    setCurrentImageIndex(0);
    loadData();
  };

  const filteredPhotos = categoryFilter === "all" ? photos : photos.filter(p => p.category === categoryFilter);

  // Group photos by title (batch uploads share same title)
  const photoGroups = useMemo(() => {
    const groups = [];
    const map = new Map();
    filteredPhotos.forEach(photo => {
      const key = photo.title || photo.id;
      if (!map.has(key)) {
        map.set(key, []);
        groups.push(key);
      }
      map.get(key).push(photo);
    });
    return groups.map(key => ({ title: key, photos: map.get(key) }));
  }, [filteredPhotos]);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 pb-24">
      {pullDistance > 0 && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[60] transition-opacity" style={{ opacity: Math.min(pullDistance / 80, 1) }}>
          <div className={`bg-white dark:bg-card rounded-full p-3 shadow-lg border-2 border-amber-300 dark:border-amber-700 ${isRefreshing ? 'animate-spin' : ''}`}>
            <motion.div animate={{ rotate: isRefreshing ? 360 : pullDistance * 3 }} transition={{ duration: isRefreshing ? 1 : 0, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}><Camera className="w-5 h-5 text-[#8B4513] dark:text-amber-400" /></motion.div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl mb-3"><Camera className="w-8 h-8 text-white" /></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#5C2E0F] mb-2">{t('gallery.title')}</h1>
          <p className="text-[#8B4513] text-lg">{t('gallery.subtitle')}</p>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <ResponsiveSelect value={categoryFilter} onValueChange={setCategoryFilter} placeholder={t('gallery.allPhotos')} label={t('gallery.filterLabel')} triggerClassName="w-48 border-amber-300">
            <SelectItem value="all">{t('gallery.allPhotos')}</SelectItem>
            <SelectItem value="distribution">{t('gallery.distribution')}</SelectItem>
            <SelectItem value="volunteer">{t('gallery.volunteerEvents')}</SelectItem>
            <SelectItem value="event">{t('gallery.communityEvents')}</SelectItem>
            <SelectItem value="facility">{t('gallery.facility')}</SelectItem>
            <SelectItem value="other">{t('gallery.other')}</SelectItem>
          </ResponsiveSelect>
          {isAdmin && (
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]">
              <Plus className="w-5 h-5 mr-2" />{t('gallery.addPhoto')}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto" /></div>
        ) : photoGroups.length > 0 ? (
          <div className="space-y-8">
            {photoGroups.map((group) => (
              <div key={group.title}>
                <PhotoCarousel photos={group.photos} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-amber-200"><CardContent className="p-12 text-center">
            <Camera className="w-16 h-16 text-[#8B4513] opacity-30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#5C2E0F] mb-2">{t('gallery.noPhotos')}</h3>
            <p className="text-[#8B4513]">{t('gallery.checkBack')}</p>
          </CardContent></Card>
        )}

        {/* Upload Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-[#F5EFE6] max-w-2xl">
            <DialogHeader><DialogTitle className="text-[#5C2E0F]">{t('gallery.dialogTitle')}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formData.image_url ? (
                <div className="space-y-3 rounded-xl border-2 border-amber-300 dark:border-amber-700 p-4">
                  <div className="relative">
                    <img src={formData.image_url} alt="Preview" className="max-h-48 w-full object-contain mx-auto rounded-lg" />
                    {selectedImages.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {selectedImages.length}
                      </div>
                    )}
                  </div>
                  {selectedImages.length > 1 && (
                    <div className="flex justify-center gap-1.5 flex-wrap">
                      {selectedImages.map((url, i) => (
                        <button key={i} type="button" onClick={() => { setCurrentImageIndex(i); setFormData(fd => ({ ...fd, image_url: selectedImages[i] })); }}
                          className={`w-10 h-10 rounded overflow-hidden border-2 transition-all ${i === currentImageIndex ? 'border-[#8B4513]' : 'border-transparent opacity-60'}`}>
                          <img src={url} className="w-full h-full object-cover" alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                  <Button type="button" variant="outline" className="w-full" onClick={() => { setFormData({ ...formData, image_url: '' }); setSelectedImages([]); setCurrentImageIndex(0); }}>{t('gallery.changeImages')}</Button>
                </div>
              ) : (
                <ImageUploader multiple value="" onChange={(url) => { setFormData({ ...formData, image_url: url }); setSelectedImages([url]); }} onMultipleUpload={handleMultipleUpload} />
              )}
              <Input placeholder={t('gallery.photoTitle')} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input type="date" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} />
                <ResponsiveSelect value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })} placeholder={t('gallery.selectCat')} label={t('gallery.categoryLabel')}>
                  <SelectItem value="distribution">{t('gallery.distribution')}</SelectItem>
                  <SelectItem value="volunteer">{t('gallery.volunteerEvent')}</SelectItem>
                  <SelectItem value="event">{t('gallery.communityEvent')}</SelectItem>
                  <SelectItem value="facility">{t('gallery.facility')}</SelectItem>
                  <SelectItem value="other">{t('gallery.other')}</SelectItem>
                </ResponsiveSelect>
              </div>
              <Textarea placeholder={t('gallery.description')} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">{t('common.cancel')}</Button>
                <Button type="submit" disabled={!formData.image_url || !formData.title} className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0F]">
                  {selectedImages.length > 1 ? t('gallery.addPhotosBtn').replace('{count}', selectedImages.length) : t('gallery.addPhotoBtn')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}