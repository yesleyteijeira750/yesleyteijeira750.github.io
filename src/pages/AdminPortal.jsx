import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Megaphone, Shield, Trash2, Plus, Heart, Camera, BookOpen, CheckCircle, Star, User, CheckSquare, Square, X, Eye, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ResponsiveSelect from "@/components/ui/ResponsiveSelect";
import { SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminListSection from "@/components/admin/AdminListSection";
import PageViewsPanel from "@/components/admin/PageViewsPanel";
import AccessCodesPanel from "@/components/admin/AccessCodesPanel";

export default function AdminPortalPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [resources, setResources] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [stories, setStories] = useState([]);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [formData, setFormData] = useState({});

  // Bulk photo delete
  const [photoSelectionMode, setPhotoSelectionMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => { checkAdminAccess(); }, []);

  const checkAdminAccess = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== "admin") { navigate(createPageUrl("Announcements")); return; }
      setUser(currentUser);
      await loadAllData();
    } catch { navigate(createPageUrl("Announcements")); }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    const [u, a, r, p, v, s] = await Promise.all([
      base44.entities.User.list(), base44.entities.Announcement.list("-created_date"),
      base44.entities.Resource.list("-created_date"), base44.entities.Photo.list("-created_date"),
      base44.entities.Volunteer.list("-created_date"), base44.entities.Story.list("-created_date")
    ]);
    setUsers(u); setAnnouncements(a); setResources(r); setPhotos(p); setVolunteers(v); setStories(s);
    setIsLoading(false);
  };

  const getDefaults = (type) => ({
    announcement: { title: "", description: "", date: "", category: "news", is_pinned: false, start_time: "", end_time: "", address: "" },
    resource: { title: "", description: "", category: "other", contact_name: "", phone: "", email: "", website: "", address: "", is_verified: false, is_featured: false },
    photo: { title: "", description: "", image_url: "", event_date: "", category: "other" },
    volunteer: { event_title: "", description: "", event_date: "", start_time: "", end_time: "", location: "", volunteers_needed: 5, signups: [] },
    story: { title: "", story_text: "", author_name: "", image_url: "", is_featured: false, is_approved: true },
    user: { barcode_number: "" }
  }[type] || {});

  const openEdit = (item, type) => { setEditingItem(item); setEditingType(type); setFormData(item || getDefaults(type)); setShowEditDialog(true); };
  const openDelete = (item, type) => { setDeleteTarget(item); setDeleteType(type); setShowDeleteDialog(true); };

  const entityMap = { announcement: base44.entities.Announcement, resource: base44.entities.Resource, photo: base44.entities.Photo, volunteer: base44.entities.Volunteer, story: base44.entities.Story, user: base44.entities.User };

  const handleSave = async () => {
    if (editingItem?.id) {
      await entityMap[editingType].update(editingItem.id, formData);
      toast({ title: "✅ Updated" });
    } else {
      await entityMap[editingType].create(formData);
      toast({ title: "✅ Created" });
    }
    setShowEditDialog(false); setEditingItem(null); setEditingType(null); setFormData({});
    await loadAllData();
  };

  const handleDelete = async () => {
    await entityMap[deleteType].delete(deleteTarget.id);
    toast({ title: "✅ Deleted" });
    setShowDeleteDialog(false); setDeleteTarget(null); setDeleteType(null);
    await loadAllData();
  };

  const toggleField = async (entity, type, field) => {
    await entityMap[type].update(entity.id, { [field]: !entity[field] });
    toast({ title: "✅ Updated" });
    await loadAllData();
  };

  const togglePhotoSelection = (id) => {
    setSelectedPhotoIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkDeletePhotos = async () => {
    setIsBulkDeleting(true);
    for (const id of selectedPhotoIds) {
      await base44.entities.Photo.delete(id);
    }
    toast({ title: "✅ Deleted", description: `${selectedPhotoIds.size} photo(s) deleted.` });
    setSelectedPhotoIds(new Set());
    setPhotoSelectionMode(false);
    setShowBulkDeleteDialog(false);
    setIsBulkDeleting(false);
    await loadAllData();
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]" /></div>;

  const overviewStats = {
    users: users.length, announcements: announcements.length, resources: resources.length,
    photos: photos.length, volunteers: volunteers.length, stories: stories.length,
    verifiedResources: resources.filter(r => r.is_verified).length,
    volunteerSignups: volunteers.reduce((s, v) => s + (v.signups?.length || 0), 0),
    approvedStories: stories.filter(s => s.is_approved).length,
    setTab: setActiveTab,
  };

  const tabs = [
    { value: "overview", icon: Shield, label: "Overview" },
    { value: "users", icon: Users, label: "Users" },
    { value: "announcements", icon: Megaphone, label: "Posts" },
    { value: "resources", icon: Heart, label: "Resources" },
    { value: "photos", icon: Camera, label: "Photos" },
    { value: "volunteers", icon: Users, label: "Volunteers" },
    { value: "stories", icon: BookOpen, label: "Stories" },
    { value: "views", icon: Eye, label: "Views" },
    { value: "codes", icon: Key, label: "Codes" },
  ];

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
            <p className="text-sm text-gray-500">Manage all content</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 inline-flex h-auto p-1 gap-0.5 min-w-max">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs px-3 py-2 rounded-lg gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value="overview"><AdminOverview stats={overviewStats} /></TabsContent>

          <TabsContent value="users">
            <AdminListSection title="Users" items={users} type="user"
              onEdit={(item) => openEdit(item, "user")}
              onDelete={(item) => item.id !== user?.id ? openDelete(item, "user") : null}
            />
          </TabsContent>

          <TabsContent value="announcements">
            <AdminListSection title="Announcements" items={announcements} type="announcement"
              onAdd={() => openEdit(null, "announcement")}
              onEdit={(item) => openEdit(item, "announcement")}
              onDelete={(item) => openDelete(item, "announcement")}
            />
          </TabsContent>

          <TabsContent value="resources">
            <AdminListSection title="Resources" items={resources} type="resource"
              onAdd={() => openEdit(null, "resource")}
              onEdit={(item) => openEdit(item, "resource")}
              onDelete={(item) => openDelete(item, "resource")}
              renderExtra={(item) => (
                <div className="flex gap-1">
                  <Button variant={item.is_verified ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => toggleField(item, "resource", "is_verified")}>
                    <CheckCircle className="w-3 h-3" />
                  </Button>
                  <Button variant={item.is_featured ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => toggleField(item, "resource", "is_featured")}>
                    <Star className="w-3 h-3" />
                  </Button>
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="photos">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Photos ({photos.length})</h2>
                <div className="flex gap-2">
                  {photoSelectionMode ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => {
                        const allSelected = photos.every(p => selectedPhotoIds.has(p.id));
                        if (allSelected) { setSelectedPhotoIds(new Set()); }
                        else { setSelectedPhotoIds(new Set(photos.map(p => p.id))); }
                      }}>
                        {photos.every(p => selectedPhotoIds.has(p.id)) ? <CheckSquare className="w-4 h-4 mr-1" /> : <Square className="w-4 h-4 mr-1" />}
                        All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setPhotoSelectionMode(false); setSelectedPhotoIds(new Set()); }}>
                        <X className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                      {selectedPhotoIds.size > 0 && (
                        <Button variant="destructive" size="sm" onClick={() => setShowBulkDeleteDialog(true)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Delete {selectedPhotoIds.size}
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setPhotoSelectionMode(true)} className="text-[#8B4513]">
                        <CheckSquare className="w-4 h-4 mr-1" /> Select
                      </Button>
                      <Button size="sm" onClick={() => openEdit(null, "photo")} className="bg-[#8B4513] hover:bg-[#5C2E0F]">
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {photoSelectionMode ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {photos.map(photo => (
                    <button key={photo.id} onClick={() => togglePhotoSelection(photo.id)}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 transition-all"
                      style={{ borderColor: selectedPhotoIds.has(photo.id) ? '#8B4513' : 'transparent' }}>
                      <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover" />
                      <div className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center ${selectedPhotoIds.has(photo.id) ? 'bg-[#8B4513] text-white' : 'bg-black/40 text-white'}`}>
                        {selectedPhotoIds.has(photo.id) ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">
                        {photo.title}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <AdminListSection title="" items={photos} type="photo"
                  onEdit={(item) => openEdit(item, "photo")}
                  onDelete={(item) => openDelete(item, "photo")}
                />
              )}
            </div>

            {/* Bulk Delete Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedPhotoIds.size} photo(s)?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDeletePhotos} disabled={isBulkDeleting} className="bg-red-600 hover:bg-red-700">
                    {isBulkDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>

          <TabsContent value="volunteers">
            <AdminListSection title="Volunteer Opportunities" items={volunteers} type="volunteer"
              onAdd={() => openEdit(null, "volunteer")}
              onEdit={(item) => openEdit(item, "volunteer")}
              onDelete={(item) => openDelete(item, "volunteer")}
            />
          </TabsContent>

          <TabsContent value="stories">
            <AdminListSection title="Stories" items={stories} type="story"
              onAdd={() => openEdit(null, "story")}
              onEdit={(item) => openEdit(item, "story")}
              onDelete={(item) => openDelete(item, "story")}
              renderExtra={(item) => (
                <Button variant={item.is_approved ? "default" : "ghost"} size="icon" className={`h-7 w-7 ${item.is_approved ? 'bg-green-600 hover:bg-green-700' : ''}`} onClick={() => toggleField(item, "story", "is_approved")}>
                  <CheckCircle className="w-3 h-3" />
                </Button>
              )}
            />
          </TabsContent>

          <TabsContent value="views">
            <PageViewsPanel />
          </TabsContent>

          <TabsContent value="codes">
            <AccessCodesPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white dark:bg-gray-900 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Create"} {editingType?.charAt(0).toUpperCase() + editingType?.slice(1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingType === "user" && (
              <div><Label>Barcode Number</Label><Input value={formData.barcode_number || ""} onChange={e => setFormData({...formData, barcode_number: e.target.value})} /></div>
            )}
            {editingType === "announcement" && (
              <>
                <div><Label>Title*</Label><Input value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                <div><Label>Description*</Label><Textarea value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date*</Label><Input type="date" value={formData.date || ""} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                  <div><Label>Category</Label><ResponsiveSelect value={formData.category || "news"} onValueChange={v => setFormData({...formData, category: v})}><SelectItem value="food_distribution">Food Distribution</SelectItem><SelectItem value="community_event">Community Event</SelectItem><SelectItem value="volunteer">Volunteer</SelectItem><SelectItem value="donation_drive">Donation Drive</SelectItem><SelectItem value="news">News</SelectItem></ResponsiveSelect></div>
                </div>
                <div className="grid grid-cols-2 gap-3"><div><Label>Start Time</Label><Input type="time" value={formData.start_time || ""} onChange={e => setFormData({...formData, start_time: e.target.value})} /></div><div><Label>End Time</Label><Input type="time" value={formData.end_time || ""} onChange={e => setFormData({...formData, end_time: e.target.value})} /></div></div>
                <div><Label>Address</Label><Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                <div><Label>Image URL</Label><Input value={formData.image_url || ""} onChange={e => setFormData({...formData, image_url: e.target.value})} /></div>
                <div className="flex items-center gap-2"><Switch checked={formData.is_pinned || false} onCheckedChange={v => setFormData({...formData, is_pinned: v})} /><Label>Pin to top</Label></div>
              </>
            )}
            {editingType === "resource" && (
              <>
                <div><Label>Title*</Label><Input value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                <div><Label>Description*</Label><Textarea value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} /></div>
                <div><Label>Category</Label><ResponsiveSelect value={formData.category || "other"} onValueChange={v => setFormData({...formData, category: v})}><SelectItem value="housing">Housing</SelectItem><SelectItem value="employment">Employment</SelectItem><SelectItem value="healthcare">Healthcare</SelectItem><SelectItem value="education">Education</SelectItem><SelectItem value="financial">Financial</SelectItem><SelectItem value="legal">Legal</SelectItem><SelectItem value="other">Other</SelectItem></ResponsiveSelect></div>
                <div><Label>Contact Name</Label><Input value={formData.contact_name || ""} onChange={e => setFormData({...formData, contact_name: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-3"><div><Label>Phone</Label><Input value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} /></div><div><Label>Email</Label><Input type="email" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} /></div></div>
                <div><Label>Website</Label><Input value={formData.website || ""} onChange={e => setFormData({...formData, website: e.target.value})} /></div>
                <div><Label>Address</Label><Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                <div className="flex gap-4"><div className="flex items-center gap-2"><Switch checked={formData.is_verified || false} onCheckedChange={v => setFormData({...formData, is_verified: v})} /><Label>Verified</Label></div><div className="flex items-center gap-2"><Switch checked={formData.is_featured || false} onCheckedChange={v => setFormData({...formData, is_featured: v})} /><Label>Featured</Label></div></div>
              </>
            )}
            {editingType === "photo" && (
              <>
                <div><Label>Title*</Label><Input value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                <div><Label>Image URL*</Label><Input value={formData.image_url || ""} onChange={e => setFormData({...formData, image_url: e.target.value})} /></div>
                <div><Label>Description</Label><Textarea value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} /></div>
                <div className="grid grid-cols-2 gap-3"><div><Label>Event Date</Label><Input type="date" value={formData.event_date || ""} onChange={e => setFormData({...formData, event_date: e.target.value})} /></div><div><Label>Category</Label><ResponsiveSelect value={formData.category || "other"} onValueChange={v => setFormData({...formData, category: v})}><SelectItem value="distribution">Distribution</SelectItem><SelectItem value="volunteer">Volunteer</SelectItem><SelectItem value="event">Event</SelectItem><SelectItem value="facility">Facility</SelectItem><SelectItem value="other">Other</SelectItem></ResponsiveSelect></div></div>
              </>
            )}
            {editingType === "volunteer" && (
              <>
                <div><Label>Event Title*</Label><Input value={formData.event_title || ""} onChange={e => setFormData({...formData, event_title: e.target.value})} /></div>
                <div><Label>Description</Label><Textarea value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} /></div>
                <div className="grid grid-cols-3 gap-3"><div><Label>Date*</Label><Input type="date" value={formData.event_date || ""} onChange={e => setFormData({...formData, event_date: e.target.value})} /></div><div><Label>Start</Label><Input type="time" value={formData.start_time || ""} onChange={e => setFormData({...formData, start_time: e.target.value})} /></div><div><Label>End</Label><Input type="time" value={formData.end_time || ""} onChange={e => setFormData({...formData, end_time: e.target.value})} /></div></div>
                <div><Label>Location</Label><Input value={formData.location || ""} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
                <div><Label>Volunteers Needed*</Label><Input type="number" value={formData.volunteers_needed || 5} onChange={e => setFormData({...formData, volunteers_needed: parseInt(e.target.value)})} /></div>
              </>
            )}
            {editingType === "story" && (
              <>
                <div><Label>Title*</Label><Input value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                <div><Label>Story Text*</Label><Textarea value={formData.story_text || ""} onChange={e => setFormData({...formData, story_text: e.target.value})} rows={6} /></div>
                <div><Label>Author Name</Label><Input value={formData.author_name || ""} onChange={e => setFormData({...formData, author_name: e.target.value})} placeholder="Leave blank for Anonymous" /></div>
                <div><Label>Image URL</Label><Input value={formData.image_url || ""} onChange={e => setFormData({...formData, image_url: e.target.value})} /></div>
                <div className="flex gap-4"><div className="flex items-center gap-2"><Switch checked={formData.is_featured || false} onCheckedChange={v => setFormData({...formData, is_featured: v})} /><Label>Featured</Label></div><div className="flex items-center gap-2"><Switch checked={formData.is_approved !== false} onCheckedChange={v => setFormData({...formData, is_approved: v})} /><Label>Approved</Label></div></div>
              </>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0F]">{editingItem ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteType}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}