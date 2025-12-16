import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Plus, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    event_date: '',
    category: 'other',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
    }
    
    try {
      const data = await base44.entities.Photo.list('-created_date');
      setPhotos(data);
    } catch (error) {
      console.error("Error loading photos:", error);
    }
    
    setIsLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "⚠️ Invalid File",
        description: "Please upload an image file.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
      toast({
        title: "✅ Image Uploaded",
        description: "Your image has been uploaded successfully."
      });
    } catch (error) {
      toast({
        title: "❌ Upload Failed",
        description: "Failed to upload image.",
        variant: "destructive"
      });
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.Photo.create(formData);
      toast({
        title: "✅ Photo Added!",
        description: "Your photo has been added to the gallery."
      });
      setShowForm(false);
      setFormData({
        title: '',
        image_url: '',
        event_date: '',
        category: 'other',
        description: ''
      });
      loadData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to add photo.",
        variant: "destructive"
      });
    }
  };

  const filteredPhotos = categoryFilter === "all" 
    ? photos 
    : photos.filter(p => p.category === categoryFilter);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl mb-3">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#5C2E0F] mb-2">
            Photo Gallery
          </h1>
          <p className="text-[#8B4513] text-lg">
            Moments from our community events and distributions
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 border-amber-300">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Photos</SelectItem>
              <SelectItem value="distribution">Food Distribution</SelectItem>
              <SelectItem value="volunteer">Volunteer Events</SelectItem>
              <SelectItem value="event">Community Events</SelectItem>
              <SelectItem value="facility">Our Facility</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          {user?.role === 'admin' && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Photo
            </Button>
          )}
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto" />
          </div>
        ) : filteredPhotos.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map(photo => (
              <Card key={photo.id} className="border-amber-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-[#5C2E0F] mb-1">{photo.title}</h3>
                  {photo.event_date && (
                    <p className="text-sm text-[#8B4513] mb-2">
                      {format(new Date(photo.event_date), 'MMMM d, yyyy')}
                    </p>
                  )}
                  {photo.description && (
                    <p className="text-sm text-[#8B4513]">{photo.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-amber-200">
            <CardContent className="p-12 text-center">
              <Camera className="w-16 h-16 text-[#8B4513] opacity-30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#5C2E0F] mb-2">No Photos Yet</h3>
              <p className="text-[#8B4513]">Check back soon for photos from our events!</p>
            </CardContent>
          </Card>
        )}

        {/* Upload Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-[#F5EFE6] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#5C2E0F]">Add Photo to Gallery</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center">
                {formData.image_url ? (
                  <div className="space-y-3">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Upload className="w-12 h-12 text-[#8B4513] mx-auto mb-3" />
                    <p className="text-[#8B4513]">
                      {uploading ? 'Uploading...' : 'Click to upload image'}
                    </p>
                  </label>
                )}
              </div>

              <Input
                placeholder="Photo Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distribution">Food Distribution</SelectItem>
                    <SelectItem value="volunteer">Volunteer Event</SelectItem>
                    <SelectItem value="event">Community Event</SelectItem>
                    <SelectItem value="facility">Facility</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.image_url || !formData.title}
                  className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0F]"
                >
                  Add Photo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}