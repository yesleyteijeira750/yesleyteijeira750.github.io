import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Megaphone, Shield, Mail, Trash2, CreditCard, Edit, Save, X } from "lucide-react";
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
      const [allUsers, allAnnouncements] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Announcement.list("-created_date")
      ]);
      
      setUsers(allUsers);
      setAnnouncements(allAnnouncements);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "❌ Error",
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
        title: "✅ Announcement deleted",
        description: `"${deleteTarget.title}" has been removed.`,
      });
      setDeleteTarget(null);
      setDeleteType(null);
      await loadData();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "❌ Error",
        description: "Failed to delete announcement. Please try again.",
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#5C2E0F]">Admin Portal</h1>
              <p className="text-[#8B4513]">Manage users and announcements</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B4513] mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-[#5C2E0F]">{users.length}</p>
                </div>
                <Users className="w-10 h-10 text-[#8B4513] opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B4513] mb-1">Announcements</p>
                  <p className="text-3xl font-bold text-[#5C2E0F]">{announcements.length}</p>
                </div>
                <Megaphone className="w-10 h-10 text-[#8B4513] opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B4513] mb-1">With Barcodes</p>
                  <p className="text-3xl font-bold text-[#5C2E0F]">
                    {users.filter(u => u.barcode_number && u.barcode_number.trim() !== '').length}
                  </p>
                </div>
                <CreditCard className="w-10 h-10 text-[#8B4513] opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-[#F5EFE6] border border-amber-200">
            <TabsTrigger value="users" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Users & Barcodes
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
              <Megaphone className="w-4 h-4 mr-2" />
              Announcements
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border-amber-200">
              <CardHeader className="bg-[#F5EFE6] border-b border-amber-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#5C2E0F]">User Management & Barcode Assignment</CardTitle>
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
            <Card className="border-amber-200">
              <CardHeader className="bg-[#F5EFE6] border-b border-amber-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#5C2E0F]">Announcement Management</CardTitle>
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
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#F5EFE6]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#5C2E0F]">
              Delete {deleteType === "user" ? "User" : "Announcement"}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#8B4513]">
              {deleteType === "user" 
                ? `This will permanently delete ${deleteTarget?.full_name}. This action cannot be undone.`
                : `This will permanently delete "${deleteTarget?.title}". This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#8B4513] text-[#8B4513] hover:bg-amber-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteType === "user" ? handleDeleteUser : handleDeleteAnnouncement}
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