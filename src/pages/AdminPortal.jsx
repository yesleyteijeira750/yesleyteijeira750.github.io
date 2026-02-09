import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Megaphone, Shield, Mail, Trash2, CreditCard, Edit, Save, X, Heart, Camera, BookOpen, CheckCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function AdminPortalPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [resources, setResources] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingBarcode, setEditingBarcode] = useState("");
  const { toast } = useToast();

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
      await loadData();
    } catch (error) {
      toast({
        title: "⛔ Access Denied",
        description: "Please log in to access the admin portal.",
        variant: "destructive",
      });
      navigate(createPageUrl("Announcements"));
    }
  };

  const loadData = async () => {
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
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    
    try {
      await base44.entities.User.delete(deleteTarget.id);
      toast({
        title: "✅ User deleted",
        description: `${deleteTarget.full_name} has been removed.`,
      });
      setDeleteTarget(null);
      setDeleteType(null);
      await loadData();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "❌ Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!deleteTarget) return;
    
    try {
      await base44.entities.Announcement.delete(deleteTarget.id);
      toast({
        title: "Announcement deleted",
        description: `"${deleteTarget.title}" has been removed.`,
      });
      setDeleteTarget(null);
      setDeleteType(null);
      await loadData();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContent = async () => {
    if (!deleteTarget) return;
    
    try {
      const entityMap = {
        resource: base44.entities.Resource,
        photo: base44.entities.Photo,
        volunteer: base44.entities.Volunteer,
        story: base44.entities.Story
      };
      
      await entityMap[deleteType].delete(deleteTarget.id);
      toast({
        title: "Deleted",
        description: `Content has been removed.`,
      });
      setDeleteTarget(null);
      setDeleteType(null);
      await loadData();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleResourceStatus = async (resource, field) => {
    try {
      await base44.entities.Resource.update(resource.id, {
        [field]: !resource[field]
      });
      toast({
        title: "Updated",
        description: `Resource ${field} status updated.`,
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update resource.",
        variant: "destructive",
      });
    }
  };

  const handleSendInvite = () => {
    toast({
      title: "📧 Invite Users",
      description: "To invite new users, go to Dashboard → Users → Invite User",
    });
  };

  const startEditingBarcode = (userId, currentBarcode) => {
    setEditingUserId(userId);
    setEditingBarcode(currentBarcode || "");
  };

  const cancelEditingBarcode = () => {
    setEditingUserId(null);
    setEditingBarcode("");
  };

  const saveBarcode = async (userId) => {
    try {
      await base44.entities.User.update(userId, {
        barcode_number: editingBarcode.trim()
      });
      
      toast({
        title: "✅ Barcode Updated",
        description: "User barcode number has been saved successfully.",
      });
      
      setEditingUserId(null);
      setEditingBarcode("");
      await loadData();
    } catch (error) {
      console.error("Error updating barcode:", error);
      toast({
        title: "❌ Error",
        description: "Failed to update barcode. Please try again.",
        variant: "destructive",
      });
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-950 dark:to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#5C2E0F] dark:text-white">Admin Portal</h1>
              <p className="text-[#8B4513] dark:text-white">Manage all content and users</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Users className="w-6 h-6 text-[#8B4513] dark:text-amber-400" />
                  <Badge variant="secondary" className="text-xs">{users.length}</Badge>
                </div>
                <p className="text-xs text-[#8B4513] dark:text-white font-medium">Users</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Megaphone className="w-6 h-6 text-[#8B4513] dark:text-amber-400" />
                  <Badge variant="secondary" className="text-xs">{announcements.length}</Badge>
                </div>
                <p className="text-xs text-[#8B4513] dark:text-white font-medium">Announcements</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Heart className="w-6 h-6 text-[#8B4513] dark:text-amber-400" />
                  <Badge variant="secondary" className="text-xs">{resources.length}</Badge>
                </div>
                <p className="text-xs text-[#8B4513] dark:text-white font-medium">Resources</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Camera className="w-6 h-6 text-[#8B4513] dark:text-amber-400" />
                  <Badge variant="secondary" className="text-xs">{photos.length}</Badge>
                </div>
                <p className="text-xs text-[#8B4513] dark:text-white font-medium">Photos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Heart className="w-6 h-6 text-[#8B4513] dark:text-amber-400" />
                  <Badge variant="secondary" className="text-xs">{volunteers.length}</Badge>
                </div>
                <p className="text-xs text-[#8B4513] dark:text-white font-medium">Volunteers</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <BookOpen className="w-6 h-6 text-[#8B4513] dark:text-amber-400" />
                  <Badge variant="secondary" className="text-xs">{stories.length}</Badge>
                </div>
                <p className="text-xs text-[#8B4513] dark:text-white font-medium">Stories</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-[#F5EFE6] border border-amber-200 grid grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="users" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
              <Megaphone className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Announcements</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
              <Camera className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Photos</span>
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Volunteers</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800 border-b border-amber-200 dark:border-amber-800">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#5C2E0F] dark:text-white">User Management & Barcode Assignment</CardTitle>
                  <Button
                    onClick={handleSendInvite}
                    className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Invite User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Barcode Number</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.full_name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge className={u.role === "admin" ? "bg-[#8B4513]" : "bg-gray-500"}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {editingUserId === u.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingBarcode}
                                  onChange={(e) => setEditingBarcode(e.target.value)}
                                  placeholder="Enter barcode..."
                                  className="w-40"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() => saveBarcode(u.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={cancelEditingBarcode}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">
                                  {u.barcode_number || '—'}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditingBarcode(u.id, u.barcode_number)}
                                  className="text-[#8B4513] hover:text-[#5C2E0F]"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(u.created_date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            {u.id !== user?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteTarget(u);
                                  setDeleteType("user");
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800 border-b border-amber-200 dark:border-amber-800">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#5C2E0F] dark:text-white">Announcement Management</CardTitle>
                  <Button
                    onClick={() => navigate(createPageUrl("Announcements"))}
                    className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]"
                  >
                    <Megaphone className="w-4 h-4 mr-2" />
                    Create New
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {announcements.map((announcement) => (
                        <TableRow key={announcement.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {announcement.is_pinned && "📌 "}
                            {announcement.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {announcement.category.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(announcement.date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(announcement.created_date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteTarget(announcement);
                                setDeleteType("announcement");
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800 border-b border-amber-200 dark:border-amber-800">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#5C2E0F] dark:text-white">Resource Management</CardTitle>
                  <Button
                    onClick={() => navigate(createPageUrl("Resources"))}
                    className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    View Resources
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resources.map((resource) => (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {resource.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{resource.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={resource.is_verified ? "default" : "outline"}
                                onClick={() => handleToggleResourceStatus(resource, 'is_verified')}
                                className={resource.is_verified ? "bg-green-600 hover:bg-green-700" : ""}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {resource.is_verified ? "Verified" : "Verify"}
                              </Button>
                              <Button
                                size="sm"
                                variant={resource.is_featured ? "default" : "outline"}
                                onClick={() => handleToggleResourceStatus(resource, 'is_featured')}
                                className={resource.is_featured ? "bg-amber-600 hover:bg-amber-700" : ""}
                              >
                                <Star className="w-3 h-3 mr-1" />
                                {resource.is_featured ? "Featured" : "Feature"}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteTarget(resource);
                                setDeleteType("resource");
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800 border-b border-amber-200 dark:border-amber-800">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#5C2E0F] dark:text-white">Photo Gallery Management</CardTitle>
                  <Button
                    onClick={() => navigate(createPageUrl("Gallery"))}
                    className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    View Gallery
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {photos.map((photo) => (
                        <TableRow key={photo.id}>
                          <TableCell className="font-medium">{photo.title}</TableCell>
                          <TableCell><Badge variant="outline">{photo.category}</Badge></TableCell>
                          <TableCell>{photo.event_date ? format(new Date(photo.event_date), "MMM d, yyyy") : "—"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteTarget(photo);
                                setDeleteType("photo");
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers">
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800 border-b border-amber-200 dark:border-amber-800">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#5C2E0F] dark:text-white">Volunteer Opportunities Management</CardTitle>
                  <Button
                    onClick={() => navigate(createPageUrl("Volunteers"))}
                    className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    View Opportunities
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Signups</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {volunteers.map((volunteer) => (
                        <TableRow key={volunteer.id}>
                          <TableCell className="font-medium">{volunteer.event_title}</TableCell>
                          <TableCell>{format(new Date(volunteer.event_date), "MMM d, yyyy")}</TableCell>
                          <TableCell>{volunteer.signups?.length || 0} / {volunteer.volunteers_needed}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteTarget(volunteer);
                                setDeleteType("volunteer");
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stories Tab */}
          <TabsContent value="stories">
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800 border-b border-amber-200 dark:border-amber-800">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#5C2E0F] dark:text-white">Stories Management</CardTitle>
                  <Button
                    onClick={() => navigate(createPageUrl("Stories"))}
                    className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Stories
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stories.map((story) => (
                        <TableRow key={story.id}>
                          <TableCell className="font-medium max-w-xs truncate">{story.title}</TableCell>
                          <TableCell>{story.author_name || "Anonymous"}</TableCell>
                          <TableCell>
                            {story.is_approved ? (
                              <Badge className="bg-green-600">Approved</Badge>
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteTarget(story);
                                setDeleteType("story");
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#F5EFE6] dark:bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#5C2E0F] dark:text-white">
              Delete {deleteType?.charAt(0).toUpperCase() + deleteType?.slice(1)}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#8B4513] dark:text-white">
              This will permanently delete this content. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#8B4513] text-[#8B4513] hover:bg-amber-100 dark:border-amber-700 dark:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={
                deleteType === "user" ? handleDeleteUser : 
                deleteType === "announcement" ? handleDeleteAnnouncement : 
                handleDeleteContent
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}