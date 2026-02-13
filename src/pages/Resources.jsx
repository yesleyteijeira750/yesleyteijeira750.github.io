import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Globe, MapPin, Plus, Search, Briefcase, Home, Heart, GraduationCap, DollarSign, Scale, Star, CheckCircle, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import ResponsiveSelect from "@/components/ui/ResponsiveSelect";
import { SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ResourceMarker from '@/components/resources/ResourceMarker';
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useAutoTranslate } from "@/components/i18n/useAutoTranslate";

export default function ResourcesPage() {
  const { t } = useLanguage();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const { toast } = useToast();
  const allTexts = resources.flatMap(r => [r.title, r.description, r.contact_name].filter(Boolean));
  const { tt } = useAutoTranslate(allTexts);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { filterResources(); }, [resources, searchTerm, categoryFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try { setUser(await base44.auth.me()); } catch { setUser(null); }
    try { const [r, rv] = await Promise.all([base44.entities.Resource.list(), base44.entities.ResourceReview.list()]); setResources(r); setReviews(rv); } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const filterResources = () => {
    let filtered = [...resources];
    if (searchTerm) filtered = filtered.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    if (categoryFilter !== "all") filtered = filtered.filter(r => r.category === categoryFilter);
    filtered.sort((a, b) => { if (a.is_featured && !b.is_featured) return -1; if (!a.is_featured && b.is_featured) return 1; if (a.is_verified && !b.is_verified) return -1; if (!a.is_verified && b.is_verified) return 1; return 0; });
    setFilteredResources(filtered);
  };

  const handleSubmitReview = async () => {
    if (!user) { toast({ title: t('resources.loginRequired'), description: t('resources.loginRequiredDesc'), variant: "destructive" }); return; }
    if (!reviewForm.comment.trim()) { toast({ title: t('resources.commentRequired'), description: t('resources.commentRequiredDesc'), variant: "destructive" }); return; }
    try {
      await base44.entities.ResourceReview.create({ resource_id: selectedResource.id, user_name: user.full_name, user_email: user.email, rating: reviewForm.rating, comment: reviewForm.comment });
      toast({ title: t('resources.reviewSubmitted'), description: t('resources.reviewSubmittedDesc') });
      setShowReviewDialog(false); setReviewForm({ rating: 5, comment: "" }); loadData();
    } catch { toast({ title: t('common.error'), description: t('resources.reviewError'), variant: "destructive" }); }
  };

  const getResourceReviews = (id) => reviews.filter(r => r.resource_id === id && r.is_approved);
  const getAverageRating = (id) => { const rr = getResourceReviews(id); if (!rr.length) return 0; return (rr.reduce((a, r) => a + r.rating, 0) / rr.length).toFixed(1); };
  const resourcesWithAddresses = filteredResources.filter(r => r.address);

  const categoryIcons = { housing: Home, employment: Briefcase, healthcare: Heart, education: GraduationCap, financial: DollarSign, legal: Scale };
  const categoryColors = { housing: "bg-blue-100 text-blue-800", employment: "bg-green-100 text-green-800", healthcare: "bg-red-100 text-red-800", education: "bg-purple-100 text-purple-800", financial: "bg-yellow-100 text-yellow-800", legal: "bg-gray-100 text-gray-800", other: "bg-amber-100 text-amber-800" };
  const categoryLabels = { housing: t('resources.housing'), employment: t('resources.employment'), healthcare: t('resources.healthcare'), education: t('resources.education'), financial: t('resources.financialAid'), legal: t('resources.legalServices'), other: t('resources.other') };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 dark:bg-gradient-to-br dark:from-gray-900 dark:via-amber-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl mb-3"><Heart className="w-8 h-8 text-white" /></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#5C2E0F] dark:text-white mb-2">{t('resources.title')}</h1>
          <p className="text-[#8B4513] dark:text-white text-lg">{t('resources.subtitle')}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]/50 w-5 h-5" />
            <Input placeholder={t('resources.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-amber-300 dark:border-amber-700" />
          </div>
          <ResponsiveSelect value={categoryFilter} onValueChange={setCategoryFilter} placeholder={t('resources.allCategories')} label={t('resources.allCategories')} triggerClassName="w-full md:w-48 border-amber-300 dark:border-amber-700">
            <SelectItem value="all">{t('resources.allCategories')}</SelectItem>
            <SelectItem value="housing">{t('resources.housing')}</SelectItem>
            <SelectItem value="employment">{t('resources.employment')}</SelectItem>
            <SelectItem value="healthcare">{t('resources.healthcare')}</SelectItem>
            <SelectItem value="education">{t('resources.education')}</SelectItem>
            <SelectItem value="financial">{t('resources.financialAid')}</SelectItem>
            <SelectItem value="legal">{t('resources.legalServices')}</SelectItem>
            <SelectItem value="other">{t('resources.other')}</SelectItem>
          </ResponsiveSelect>
          {resourcesWithAddresses.length > 0 && (
            <Button variant="outline" onClick={() => setShowMapDialog(true)} className="border-amber-300 dark:border-amber-700"><MapPin className="w-4 h-4 mr-2" />{t('resources.viewMap')}</Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto" /></div>
        ) : filteredResources.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => {
              const CategoryIcon = categoryIcons[resource.category] || Heart;
              const resourceReviews = getResourceReviews(resource.id);
              const avgRating = getAverageRating(resource.id);
              return (
                <Card key={resource.id} className="border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800">
                    <div className="flex items-start justify-between"><div className="flex-1">
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <Badge className={categoryColors[resource.category]}><CategoryIcon className="w-3 h-3 mr-1" />{categoryLabels[resource.category] || resource.category}</Badge>
                        {resource.is_verified && <Badge className="bg-green-600 text-white"><CheckCircle className="w-3 h-3 mr-1" />{t('resources.verified')}</Badge>}
                        {resource.is_featured && <Badge className="bg-amber-600 text-white"><Star className="w-3 h-3 mr-1" />{t('resources.featured')}</Badge>}
                      </div>
                      <CardTitle className="text-[#5C2E0F] dark:text-white">{tt(resource.title)}</CardTitle>
                      {resourceReviews.length > 0 && <div className="flex items-center gap-1 mt-2"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><span className="text-sm font-medium text-[#8B4513] dark:text-white">{avgRating}</span><span className="text-sm text-[#8B4513] dark:text-white">({resourceReviews.length} {t('resources.reviews')})</span></div>}
                    </div></div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-[#8B4513] dark:text-white mb-4">{tt(resource.description)}</p>
                    <div className="space-y-2">
                      {resource.contact_name && <div className="text-sm text-[#8B4513] dark:text-white"><strong>{t('resources.contactLabel')}</strong> {tt(resource.contact_name)}</div>}
                      {resource.phone && <a href={`tel:${resource.phone}`} className="flex items-center gap-2 text-sm text-[#8B4513] dark:text-white hover:text-[#5C2E0F]"><Phone className="w-4 h-4" />{resource.phone}</a>}
                      {resource.email && <a href={`mailto:${resource.email}`} className="flex items-center gap-2 text-sm text-[#8B4513] dark:text-white hover:text-[#5C2E0F]"><Mail className="w-4 h-4" />{resource.email}</a>}
                      {resource.website && <a href={resource.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#8B4513] dark:text-white hover:text-[#5C2E0F]"><Globe className="w-4 h-4" />{t('resources.visitWebsite')}</a>}
                      {resource.address && <div className="flex items-start gap-2 text-sm text-[#8B4513] dark:text-white"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{resource.address}</span></div>}
                    </div>
                    {resourceReviews.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                        <h4 className="text-sm font-semibold text-[#5C2E0F] dark:text-white mb-2">{t('resources.recentReviews')}</h4>
                        <div className="space-y-2">{resourceReviews.slice(0, 2).map(review => (
                          <div key={review.id} className="text-sm">
                            <div className="flex items-center gap-1 mb-1">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}<span className="text-xs text-[#8B4513] dark:text-white ml-1">- {review.user_name}</span></div>
                            <p className="text-[#8B4513] dark:text-white line-clamp-2">{review.comment}</p>
                          </div>
                        ))}</div>
                      </div>
                    )}
                    <Button onClick={() => { setSelectedResource(resource); setShowReviewDialog(true); }} variant="outline" className="w-full mt-4 border-amber-300 dark:border-amber-700"><MessageSquare className="w-4 h-4 mr-2" />{t('resources.leaveReview')}</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-amber-200 dark:border-amber-800"><CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-[#8B4513] dark:text-amber-400 opacity-30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#5C2E0F] dark:text-white mb-2">{t('resources.noResults')}</h3>
            <p className="text-[#8B4513] dark:text-white">{searchTerm || categoryFilter !== "all" ? t('resources.tryAdjusting') : t('resources.comingSoon')}</p>
          </CardContent></Card>
        )}
      </div>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="bg-[#F5EFE6] dark:bg-card">
          <DialogHeader><DialogTitle className="text-[#5C2E0F] dark:text-white">{t('resources.reviewTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><p className="text-sm text-[#8B4513] dark:text-white mb-2">{t('resources.rating')}</p>
              <div className="flex gap-2">{[1,2,3,4,5].map(rating => <button key={rating} onClick={() => setReviewForm({...reviewForm, rating})} className="transition-transform hover:scale-110"><Star className={`w-8 h-8 ${rating <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} /></button>)}</div>
            </div>
            <div><p className="text-sm text-[#8B4513] dark:text-white mb-2">{t('resources.yourReview')}</p>
              <Textarea value={reviewForm.comment} onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})} placeholder={t('resources.reviewPlaceholder')} rows={4} className="border-amber-300 dark:border-amber-700" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)} className="flex-1">{t('common.cancel')}</Button>
              <Button onClick={handleSubmitReview} className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0F] dark:bg-amber-600 dark:hover:bg-amber-700">{t('resources.submitReview')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="bg-[#F5EFE6] dark:bg-card max-w-4xl">
          <DialogHeader><DialogTitle className="text-[#5C2E0F] dark:text-white">{t('resources.resourceLocations')}</DialogTitle></DialogHeader>
          <div className="h-[500px] rounded-lg overflow-hidden">
            <MapContainer center={[26.9342, -81.7623]} zoom={10} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
              {resourcesWithAddresses.map(resource => <ResourceMarker key={resource.id} resource={resource} />)}
            </MapContainer>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}