import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Megaphone, Shield, Mail, Trash2, Edit, Plus, 
  Heart, Camera, BookOpen, CheckCircle, Star, Eye, Calendar,
  Clock, MapPin, Phone, Globe, User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ResponsiveSelect from "@/components/ui/ResponsiveSelect";
import { SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminPortalPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Data states
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [resources, setResources] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [stories, setStories] = useState([]);

  // Modal states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  // Form state
  const [formData, setFormData] = useState({});

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.role !== "admin") {
        toast({
          title: "⛔ Access Denied",
          description: "This portal is only accessible to administrators.",
          variant: "destructive",
        });
        navigate(createPageUrl("Announcements"));
        return;
      }
      
      setUser(currentUser);
      await loadAllData();
    } catch (error) {
      toast({
        title: "⛔ Access Denied",
        description: "Please log in to access the admin portal.",
        variant: "destructive",
      });
      navigate(createPageUrl("Announcements"));
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [allUsers, allAnnouncements, allResources, allPhotos, allVolunteers, allStories] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Announcement.list("-created_date"),
        base44.entities.Resource.list("-created_date"),
        base44.entities.Photo.list("-created_date"),
        base44.entities.Volunteer.list("-created_date"),
        base44.entities.Story.list("-created_date")
      ]);
      
      setUsers(allUsers);
      setAnnouncements(allAnnouncements);
      setResources(allResources);
      setPhotos(allPhotos);
      setVolunteers(allVolunteers);
      setStories(allStories);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const openEditDialog = (item, type) => {
    setEditingItem(item);
    setEditingType(type);
    setFormData(item || getDefaultFormData(type));
    setShowEditDialog(true);
  };

  const getDefaultFormData = (type) => {
    const defaults = {
      announcement: { title: "", description: "", date: "", category: "news", is_pinned: false, start_time: "", end_time: "", address: "" },
      resource: { title: "", description: "", category: "other", contact_name: "", phone: "", email: "", website: "", address: "", is_verified: false, is_featured: false },
      photo: { title: "", description: "", image_url: "", event_date: "", category: "other" },
      volunteer: { event_title: "", description: "", event_date: "", start_time: "", end_time: "", location: "", volunteers_needed: 5, signups: [] },
      story: { title: "", story_text: "", author_name: "", image_url: "", is_featured: false, is_approved: true },
      user: { barcode_number: "" }
    };
    return defaults[type] || {};
  };

  const handleSave = async () => {
    try {
      const entityMap = {
        announcement: base44.entities.Announcement,
        resource: base44.entities.Resource,
        photo: base44.entities.Photo,
        volunteer: base44.entities.Volunteer,
        story: base44.entities.Story,
        user: base44.entities.User
      };

      if (editingItem?.id) {
        await entityMap[editingType].update(editingItem.id, formData);
        toast({ title: "✅ Updated", description: "Item updated successfully." });
      } else {
        await entityMap[editingType].create(formData);
        toast({ title: "✅ Created", description: "Item created successfully." });
      }

      setShowEditDialog(false);
      setEditingItem(null);
      setEditingType(null);
      setFormData({});
      await loadAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save item.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      const entityMap = {
        announcement: base44.entities.Announcement,
        resource: base44.entities.Resource,
        photo: base44.entities.Photo,
        volunteer: base44.entities.Volunteer,
        story: base44.entities.Story,
        user: base44.entities.User
      };
      
      await entityMap[deleteType].delete(deleteTarget.id);
      
      toast({
        title: "✅ Deleted",
        description: "Item deleted successfully.",
      });
      
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      setDeleteType(null);
      await loadAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    }
  };

  const toggleResourceStatus = async (resource, field) => {
    try {
      await base44.entities.Resource.update(resource.id, {
        [field]: !resource[field]
      });
      toast({ title: "✅ Updated", description: "Resource status updated." });
      await loadAllData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    }
  };

  const toggleStoryApproval = async (story) => {
    try {
      await base44.entities.Story.update(story.id, {
        is_approved: !story.is_approved
      });
      toast({ title: "✅ Updated", description: "Story approval status updated." });
      await loadAllData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-950 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#5C2E0F] dark:text-white">Admin Portal</h1>
              <p className="text-[#8B4513] dark:text-white">Manage all content</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-800 grid grid-cols-3 md:grid-cols-7 h-auto p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white text-xs py-2">
              <Shield className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white text-xs py-2">
              <Users className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white text-xs py-2">
              <Megaphone className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Announcements</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white text-xs py-2">
              <Heart className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white text-xs py-2">
              <Camera className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Photos</span>
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white text-xs py-2">
              <Heart className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Volunteers</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white text-xs py-2">
              <BookOpen className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Stories</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="border-2 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("users")}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <Users className="w-10 h-10 text-[#8B4513] dark:text-amber-400" />
                    <div>
                      <p className="text-3xl font-bold text-[#5C2E0F] dark:text-white">{users.length}</p>
                      <p className="text-sm text-[#8B4513] dark:text-white">Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("announcements")}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <Megaphone className="w-10 h-10 text-[#8B4513] dark:text-amber-400" />
                    <div>
                      <p className="text-3xl font-bold text-[#5C2E0F] dark:text-white">{announcements.length}</p>
                      <p className="text-sm text-[#8B4513] dark:text-white">Announcements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("resources")}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <Heart className="w-10 h-10 text-[#8B4513] dark:text-amber-400" />
                    <div>
                      <p className="text-3xl font-bold text-[#5C2E0F] dark:text-white">{resources.length}</p>
                      <p className="text-sm text-[#8B4513] dark:text-white">Resources</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("photos")}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <Camera className="w-10 h-10 text-[#8B4513] dark:text-amber-400" />
                    <div>
                      <p className="text-3xl font-bold text-[#5C2E0F] dark:text-white">{photos.length}</p>
                      <p className="text-sm text-[#8B4513] dark:text-white">Photos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("volunteers")}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <Heart className="w-10 h-10 text-[#8B4513] dark:text-amber-400" />
                    <div>
                      <p className="text-3xl font-bold text-[#5C2E0F] dark:text-white">{volunteers.length}</p>
                      <p className="text-sm text-[#8B4513] dark:text-white">Volunteers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("stories")}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <BookOpen className="w-10 h-10 text-[#8B4513] dark:text-amber-400" />
                    <div>
                      <p className="text-3xl font-bold text-[#5C2E0F] dark:text-white">{stories.length}</p>
                      <p className="text-sm text-[#8B4513] dark:text-white">Stories</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-[#5C2E0F] dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button onClick={() => navigate(createPageUrl("Announcements"))} className="w-full justify-start bg-[#8B4513] hover:bg-[#5C2E0F]">
                      <Megaphone className="w-4 h-4 mr-2" />
                      Create Announcement
                    </Button>
                    <Button onClick={() => navigate(createPageUrl("CheckInSystem"))} className="w-full justify-start bg-[#8B4513] hover:bg-[#5C2E0F]">
                      <Users className="w-4 h-4 mr-2" />
                      Check-In System
                    </Button>
                    <Button onClick={() => navigate(createPageUrl("Analytics"))} className="w-full justify-start bg-[#8B4513] hover:bg-[#5C2E0F]">
                      <BookOpen className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-[#5C2E0F] dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3 text-sm text-[#8B4513] dark:text-white">
                    <p>• {announcements.length} total announcements</p>
                    <p>• {resources.filter(r => r.is_verified).length} verified resources</p>
                    <p>• {photos.length} gallery photos</p>
                    <p>• {volunteers.reduce((sum, v) => sum + (v.signups?.length || 0), 0)} volunteer signups</p>
                    <p>• {stories.filter(s => s.is_approved).length} approved stories</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#5C2E0F] dark:text-white">Users Management</h2>
            </div>
            <div className="grid gap-4">
              {users.map((u) => (
                <Card key={u.id} className="border-2 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-[#5C2E0F] dark:text-white">{u.full_name}</p>
                          <p className="text-sm text-[#8B4513] dark:text-white">{u.email}</p>
                          <p className="text-xs text-[#8B4513] dark:text-white">Joined: {format(new Date(u.created_date), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-[#8B4513] text-white" : "bg-gray-200 text-gray-800"}`}>
                          {u.role}
                        </div>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(u, "user")}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {u.id !== user?.id && (
                          <Button size="sm" variant="ghost" onClick={() => { setDeleteTarget(u); setDeleteType("user"); setShowDeleteDialog(true); }}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#5C2E0F] dark:text-white">Announcements</h2>
              <Button onClick={() => openEditDialog(null, "announcement")} className="bg-[#8B4513] hover:bg-[#5C2E0F]">
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </div>
            <div className="grid gap-4">
              {announcements.map((item) => (
                <Card key={item.id} className="border-2 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {item.is_pinned && <span className="text-2xl">📌</span>}
                          <h3 className="font-bold text-[#5C2E0F] dark:text-white">{item.title}</h3>
                        </div>
                        <p className="text-sm text-[#8B4513] dark:text-white mb-2">{item.description?.substring(0, 100)}...</p>
                        <div className="flex items-center gap-3 text-xs text-[#8B4513] dark:text-white">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(item.date), "MMM d, yyyy")}</span>
                          {item.start_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.start_time}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(item, "announcement")}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setDeleteTarget(item); setDeleteType("announcement"); setShowDeleteDialog(true); }}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#5C2E0F] dark:text-white">Resources</h2>
              <Button onClick={() => openEditDialog(null, "resource")} className="bg-[#8B4513] hover:bg-[#5C2E0F]">
                <Plus className="w-4 h-4 mr-2" />
                New Resource
              </Button>
            </div>
            <div className="grid gap-4">
              {resources.map((item) => (
                <Card key={item.id} className="border-2 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-[#5C2E0F] dark:text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-[#8B4513] dark:text-white mb-2">{item.description?.substring(0, 100)}...</p>
                        <div className="flex gap-2 mb-2">
                          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-xs rounded">{item.category}</span>
                          {item.is_verified && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded flex items-center gap-1"><CheckCircle className="w-3 h-3" />Verified</span>}
                          {item.is_featured && <span className="px-2 py-1 bg-amber-600 text-white text-xs rounded flex items-center gap-1"><Star className="w-3 h-3" />Featured</span>}
                        </div>
                        <div className="flex gap-3 text-xs text-[#8B4513] dark:text-white">
                          {item.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{item.phone}</span>}
                          {item.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.address}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant={item.is_verified ? "default" : "outline"} onClick={() => toggleResourceStatus(item, "is_verified")}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant={item.is_featured ? "default" : "outline"} onClick={() => toggleResourceStatus(item, "is_featured")}>
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(item, "resource")}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setDeleteTarget(item); setDeleteType("resource"); setShowDeleteDialog(true); }}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#5C2E0F] dark:text-white">Photo Gallery</h2>
              <Button onClick={() => openEditDialog(null, "photo")} className="bg-[#8B4513] hover:bg-[#5C2E0F]">
                <Plus className="w-4 h-4 mr-2" />
                New Photo
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((item) => (
                <Card key={item.id} className="border-2 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-0">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded-t-lg" />
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-[#5C2E0F] dark:text-white mb-1">{item.title}</h3>
                      <p className="text-xs text-[#8B4513] dark:text-white mb-2">{item.event_date && format(new Date(item.event_date), "MMM d, yyyy")}</p>
                      <div className="flex justify-between">
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-xs rounded">{item.category}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(item, "photo")}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setDeleteTarget(item); setDeleteType("photo"); setShowDeleteDialog(true); }}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#5C2E0F] dark:text-white">Volunteer Opportunities</h2>
              <Button onClick={() => openEditDialog(null, "volunteer")} className="bg-[#8B4513] hover:bg-[#5C2E0F]">
                <Plus className="w-4 h-4 mr-2" />
                New Opportunity
              </Button>
            </div>
            <div className="grid gap-4">
              {volunteers.map((item) => (
                <Card key={item.id} className="border-2 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-[#5C2E0F] dark:text-white mb-1">{item.event_title}</h3>
                        <p className="text-sm text-[#8B4513] dark:text-white mb-2">{item.description?.substring(0, 100)}...</p>
                        <div className="flex items-center gap-3 text-xs text-[#8B4513] dark:text-white">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(item.event_date), "MMM d, yyyy")}</span>
                          {item.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{item.signups?.length || 0} / {item.volunteers_needed}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(item, "volunteer")}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setDeleteTarget(item); setDeleteType("volunteer"); setShowDeleteDialog(true); }}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Stories Tab */}
          <TabsContent value="stories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#5C2E0F] dark:text-white">Community Stories</h2>
              <Button onClick={() => openEditDialog(null, "story")} className="bg-[#8B4513] hover:bg-[#5C2E0F]">
                <Plus className="w-4 h-4 mr-2" />
                New Story
              </Button>
            </div>
            <div className="grid gap-4">
              {stories.map((item) => (
                <Card key={item.id} className="border-2 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-[#5C2E0F] dark:text-white">{item.title}</h3>
                          {item.is_featured && <Star className="w-4 h-4 text-amber-600" />}
                        </div>
                        <p className="text-sm text-[#8B4513] dark:text-white mb-2">{item.story_text?.substring(0, 150)}...</p>
                        <p className="text-xs text-[#8B4513] dark:text-white">By: {item.author_name || "Anonymous"}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant={item.is_approved ? "default" : "outline"} onClick={() => toggleStoryApproval(item)} className={item.is_approved ? "bg-green-600 hover:bg-green-700" : ""}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(item, "story")}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setDeleteTarget(item); setDeleteType("story"); setShowDeleteDialog(true); }}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#F5EFE6] dark:bg-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#5C2E0F] dark:text-white">
              {editingItem ? "Edit" : "Create"} {editingType?.charAt(0).toUpperCase() + editingType?.slice(1)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingType === "user" && (
              <div>
                <Label>Barcode Number</Label>
                <Input value={formData.barcode_number || ""} onChange={(e) => setFormData({...formData, barcode_number: e.target.value})} />
              </div>
            )}
            
            {editingType === "announcement" && (
              <>
                <div>
                  <Label>Title*</Label>
                  <Input value={formData.title || ""} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <Label>Description*</Label>
                  <Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date*</Label>
                    <Input type="date" value={formData.date || ""} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <ResponsiveSelect value={formData.category || "news"} onValueChange={(val) => setFormData({...formData, category: val})}>
                      <SelectItem value="food_distribution">Food Distribution</SelectItem>
                      <SelectItem value="community_event">Community Event</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="donation_drive">Donation Drive</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                    </ResponsiveSelect>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input type="time" value={formData.start_time || ""} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input type="time" value={formData.end_time || ""} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={formData.address || ""} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_pinned || false} onCheckedChange={(val) => setFormData({...formData, is_pinned: val})} />
                  <Label>Pin to top</Label>
                </div>
              </>
            )}

            {editingType === "resource" && (
              <>
                <div>
                  <Label>Title*</Label>
                  <Input value={formData.title || ""} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <Label>Description*</Label>
                  <Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
                </div>
                <div>
                  <Label>Category</Label>
                  <ResponsiveSelect value={formData.category || "other"} onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="employment">Employment</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </ResponsiveSelect>
                </div>
                <div>
                  <Label>Contact Name</Label>
                  <Input value={formData.contact_name || ""} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input value={formData.phone || ""} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={formData.email || ""} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={formData.website || ""} onChange={(e) => setFormData({...formData, website: e.target.value})} />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={formData.address || ""} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_verified || false} onCheckedChange={(val) => setFormData({...formData, is_verified: val})} />
                    <Label>Verified</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_featured || false} onCheckedChange={(val) => setFormData({...formData, is_featured: val})} />
                    <Label>Featured</Label>
                  </div>
                </div>
              </>
            )}

            {editingType === "photo" && (
              <>
                <div>
                  <Label>Title*</Label>
                  <Input value={formData.title || ""} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <Label>Image URL*</Label>
                  <Input value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event Date</Label>
                    <Input type="date" value={formData.event_date || ""} onChange={(e) => setFormData({...formData, event_date: e.target.value})} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <ResponsiveSelect value={formData.category || "other"} onValueChange={(val) => setFormData({...formData, category: val})}>
                      <SelectItem value="distribution">Distribution</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="facility">Facility</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </ResponsiveSelect>
                  </div>
                </div>
              </>
            )}

            {editingType === "volunteer" && (
              <>
                <div>
                  <Label>Event Title*</Label>
                  <Input value={formData.event_title || ""} onChange={(e) => setFormData({...formData, event_title: e.target.value})} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Event Date*</Label>
                    <Input type="date" value={formData.event_date || ""} onChange={(e) => setFormData({...formData, event_date: e.target.value})} />
                  </div>
                  <div>
                    <Label>Start Time</Label>
                    <Input type="time" value={formData.start_time || ""} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input type="time" value={formData.end_time || ""} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={formData.location || ""} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
                <div>
                  <Label>Volunteers Needed*</Label>
                  <Input type="number" value={formData.volunteers_needed || 5} onChange={(e) => setFormData({...formData, volunteers_needed: parseInt(e.target.value)})} />
                </div>
              </>
            )}

            {editingType === "story" && (
              <>
                <div>
                  <Label>Title*</Label>
                  <Input value={formData.title || ""} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <Label>Story Text*</Label>
                  <Textarea value={formData.story_text || ""} onChange={(e) => setFormData({...formData, story_text: e.target.value})} rows={6} />
                </div>
                <div>
                  <Label>Author Name</Label>
                  <Input value={formData.author_name || ""} onChange={(e) => setFormData({...formData, author_name: e.target.value})} placeholder="Leave blank for Anonymous" />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_featured || false} onCheckedChange={(val) => setFormData({...formData, is_featured: val})} />
                    <Label>Featured</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_approved !== false} onCheckedChange={(val) => setFormData({...formData, is_approved: val})} />
                    <Label>Approved</Label>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0F]">
                {editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#F5EFE6] dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#5C2E0F] dark:text-white">
              Delete {deleteType?.charAt(0).toUpperCase() + deleteType?.slice(1)}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#8B4513] dark:text-white">
              This will permanently delete this item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#8B4513] text-[#8B4513] hover:bg-amber-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}