import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Plus, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ResponsiveSelect from "@/components/ui/ResponsiveSelect";
import { SelectItem } from "@/components/ui/select";
import { format } from "date-fns";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function GalleryPage() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
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

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) { toast({ title: `⚠️ ${t('gallery.invalidFiles')}`, description: t('gallery.invalidFilesDesc'), variant: "destructive" }); return; }
    setUploading(true);
    try {
      const urls = [];
      for (const file of imageFiles) { const { file_url } = await base44.integrations.Core.UploadFile({ file }); urls.push(file_url); }
      setSelectedImages(urls); setCurrentImageIndex(0); setFormData({ ...formData, image_url: urls[0] });
      toast({ title: `✅ ${t('gallery.uploaded')}`, description: t('gallery.uploadedDesc').replace('{count}', urls.length) });
    } catch { toast({ title: `❌ ${t('gallery.uploadFailed')}`, description: t('gallery.uploadFailedDesc'), variant: "destructive" }); }
    setUploading(false);
  };

  useEffect(() => {
    if (selectedImages.length > 1) {
      const interval = setInterval(() => { setCurrentImageIndex(prev => { const next = (prev + 1) % selectedImages.length; setFormData(fd => ({ ...fd, image_url: selectedImages[next] })); return next; }); }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedImages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedImages.length > 1) {
        for (const url of selectedImages) await base44.entities.Photo.create({ ...formData, image_url: url });
        toast({ title: `✅ ${t('gallery.photosAdded')}`, description: t('gallery.photosAddedDesc').replace('{count}', selectedImages.length) });
      } else {
        await base44.entities.Photo.create(formData);
        toast({ title: `✅ ${t('gallery.photoAdded')}`, description: t('gallery.photoAddedDesc') });
      }
      setShowForm(false); setFormData({ title: '', image_url: '', event_date: '', category: 'other', description: '' }); setSelectedImages([]); setCurrentImageIndex(0); loadData();
    } catch { toast({ title: `❌ ${t('gallery.addError')}`, description: t('gallery.addErrorDesc'), variant: "destructive" }); }
  };

  const filteredPhotos = categoryFilter === "all" ? photos : photos.filter(p => p.category === categoryFilter);

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
        <div className="flex justify-between items-center mb-6">
          <ResponsiveSelect value={categoryFilter} onValueChange={setCategoryFilter} placeholder={t('gallery.allPhotos')} label={t('gallery.filterLabel')} triggerClassName="w-48 border-amber-300">
            <SelectItem value="all">{t('gallery.allPhotos')}</SelectItem>
            <SelectItem value="distribution">{t('gallery.distribution')}</SelectItem>
            <SelectItem value="volunteer">{t('gallery.volunteerEvents')}</SelectItem>
            <SelectItem value="event">{t('gallery.communityEvents')}</SelectItem>
            <SelectItem value="facility">{t('gallery.facility')}</SelectItem>
            <SelectItem value="other">{t('gallery.other')}</SelectItem>
          </ResponsiveSelect>
          {user?.role === 'admin' && (
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]"><Plus className="w-5 h-5 mr-2" />{t('gallery.addPhoto')}</Button>
          )}
        </div>
        {isLoading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto" /></div>
        ) : filteredPhotos.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map(photo => (
              <Card key={photo.id} className="border-amber-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative overflow-hidden"><img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover" /></div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-[#5C2E0F] mb-1">{photo.title}</h3>
                  {photo.event_date && <p className="text-sm text-[#8B4513] mb-2">{format(new Date(photo.event_date), 'MMMM d, yyyy')}</p>}
                  {photo.description && <p className="text-sm text-[#8B4513]">{photo.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-amber-200"><CardContent className="p-12 text-center"><Camera className="w-16 h-16 text-[#8B4513] opacity-30 mx-auto mb-4" /><h3 className="text-xl font-bold text-[#5C2E0F] mb-2">{t('gallery.noPhotos')}</h3><p className="text-[#8B4513]">{t('gallery.checkBack')}</p></CardContent></Card>
        )}

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-[#F5EFE6] max-w-2xl">
            <DialogHeader><DialogTitle className="text-[#5C2E0F]">{t('gallery.dialogTitle')}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center">
                {formData.image_url ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <img src={formData.image_url} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                      {selectedImages.length > 1 && <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">{currentImageIndex + 1} / {selectedImages.length}</div>}
                    </div>
                    {selectedImages.length > 1 && <p className="text-sm text-[#8B4513]">{t('gallery.previewInfo')}</p>}
                    <Button type="button" variant="outline" onClick={() => { setFormData({...formData, image_url: ''}); setSelectedImages([]); setCurrentImageIndex(0); }}>{t('gallery.changeImages')}</Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" multiple capture="environment" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                    <Upload className="w-12 h-12 text-[#8B4513] mx-auto mb-3" />
                    <p className="text-[#8B4513] font-medium mb-1">{uploading ? t('gallery.uploading') : t('gallery.tapUpload')}</p>
                    <p className="text-sm text-[#8B4513]/70">{t('gallery.selectMultiple')}</p>
                  </label>
                )}
              </div>
              <Input placeholder={t('gallery.photoTitle')} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input type="date" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} />
                <ResponsiveSelect value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})} placeholder={t('gallery.selectCategory')} label={t('gallery.categoryLabel')}>
                  <SelectItem value="distribution">{t('gallery.distribution')}</SelectItem>
                  <SelectItem value="volunteer">{t('gallery.volunteerEvent')}</SelectItem>
                  <SelectItem value="event">{t('gallery.communityEvent')}</SelectItem>
                  <SelectItem value="facility">{t('gallery.facility')}</SelectItem>
                  <SelectItem value="other">{t('gallery.other')}</SelectItem>
                </ResponsiveSelect>
              </div>
              <Textarea placeholder={t('gallery.description')} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
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