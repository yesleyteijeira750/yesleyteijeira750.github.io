import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ResponsiveSelect from "@/components/ui/ResponsiveSelect";
import { SelectItem } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Image as ImageIcon, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function AnnouncementForm({ announcement, onSubmit, onCancel }) {
  const { t } = useLanguage();
  const [formData, setFormData] = React.useState(
    announcement || { title: "", date: "", start_time: "", end_time: "", description: "", category: "news", image_url: "", is_pinned: false, address: "", reminder_sent: false }
  );
  const [uploading, setUploading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast({ title: t('announcementForm.invalidFile'), description: t('announcementForm.invalidFileDesc'), variant: "destructive" }); return; }
    if (file.size > 10 * 1024 * 1024) { toast({ title: t('announcementForm.fileTooLarge'), description: t('announcementForm.fileTooLargeDesc'), variant: "destructive" }); return; }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
      toast({ title: `✅ ${t('announcementForm.uploaded')}`, description: t('announcementForm.uploadedDesc') });
    } catch (error) {
      toast({ title: t('announcementForm.uploadFailed'), description: t('announcementForm.uploadFailedDesc'), variant: "destructive" });
    } finally { setUploading(false); e.target.value = ''; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    try { await onSubmit(formData); } catch (error) {
      toast({ title: t('common.error'), description: t('announcementForm.saveError'), variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  return (
    <Card className="border-amber-200 shadow-lg">
      <CardHeader className="border-b border-amber-200 bg-[#F5EFE6]">
        <CardTitle className="text-2xl text-[#5C2E0F]">{announcement ? t('announcementForm.editTitle') : t('announcementForm.createTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[#5C2E0F]">{t('announcementForm.titleLabel')}</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder={t('announcementForm.titlePlaceholder')} required className="border-amber-300 focus:border-[#8B4513]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-[#5C2E0F]">{t('announcementForm.dateLabel')}</Label>
              <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required className="border-amber-300 focus:border-[#8B4513]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[#5C2E0F]">{t('announcementForm.categoryLabel')}</Label>
              <ResponsiveSelect value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} placeholder={t('announcementForm.selectCategory')} label={t('announcementForm.categoryLabel')} triggerClassName="border-amber-300 focus:border-[#8B4513]">
                <SelectItem value="food_distribution">{t('announcements.food_distribution')}</SelectItem>
                <SelectItem value="community_event">{t('announcements.community_event')}</SelectItem>
                <SelectItem value="volunteer">{t('announcements.volunteerOpportunity')}</SelectItem>
                <SelectItem value="donation_drive">{t('announcements.donation_drive')}</SelectItem>
                <SelectItem value="news">{t('announcements.news')}</SelectItem>
              </ResponsiveSelect>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="text-[#5C2E0F] flex items-center gap-2"><Clock className="w-4 h-4" />{t('announcementForm.startTime')}</Label>
              <Input id="start_time" type="time" value={formData.start_time || ""} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="border-amber-300 focus:border-[#8B4513]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time" className="text-[#5C2E0F] flex items-center gap-2"><Clock className="w-4 h-4" />{t('announcementForm.endTime')}</Label>
              <Input id="end_time" type="time" value={formData.end_time || ""} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="border-amber-300 focus:border-[#8B4513]" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-[#5C2E0F]">{t('announcementForm.addressLabel')}</Label>
            <Input id="address" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder={t('announcementForm.addressPlaceholder')} className="border-amber-300 focus:border-[#8B4513]" />
            <p className="text-xs text-[#8B4513]/70">{t('announcementForm.addressHint')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#5C2E0F]">{t('announcementForm.descLabel')}</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={t('announcementForm.descPlaceholder')} rows={6} required className="border-amber-300 focus:border-[#8B4513] resize-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#5C2E0F]">{t('announcementForm.featuredImage')}</Label>
            {formData.image_url ? (
              <div className="relative">
                <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-amber-300" />
                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => setFormData({ ...formData, image_url: "" })}><X className="w-4 h-4" /></Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center hover:border-[#8B4513] transition-colors bg-[#F5EFE6]/30">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="file-upload" disabled={uploading} />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  {uploading ? (<><Loader2 className="w-8 h-8 text-[#8B4513] animate-spin" /><span className="text-sm text-[#8B4513]">{t('announcementForm.uploading')}</span></>) : (<><ImageIcon className="w-8 h-8 text-[#8B4513]" /><span className="text-sm text-[#8B4513]">{t('announcementForm.clickUpload')}</span><span className="text-xs text-[#8B4513]/70">{t('announcementForm.fileHint')}</span></>)}
                </label>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between p-4 bg-[#F5EFE6] rounded-lg border border-amber-200">
            <div className="flex flex-col gap-1">
              <Label htmlFor="pinned" className="cursor-pointer text-[#5C2E0F]">{t('announcementForm.pinLabel')}</Label>
              <span className="text-xs text-[#8B4513]">{t('announcementForm.pinHint')}</span>
            </div>
            <Switch id="pinned" checked={formData.is_pinned} onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })} />
          </div>
          {formData.start_time && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900"><strong>ℹ️</strong> {t('announcementForm.timeNote')}</p>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-amber-300 hover:bg-amber-100 text-[#8B4513]" disabled={isSubmitting}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isSubmitting || uploading} className="flex-1 bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D] text-white">
              {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('announcementForm.saving')}</>) : announcement ? t('announcementForm.updateBtn') : t('announcementForm.createBtn')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}