import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Edit, Trash2, Pin, Shield } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

import ShareButton from "../components/announcements/ShareButton";
import AnnouncementForm from "../components/announcements/AnnouncementForm";

const categoryConfig = {
  food_distribution: {
    label: "Food Distribution",
    color: "bg-green-100 text-green-700 border-green-200"
  },
  community_event: {
    label: "Community Event",
    color: "bg-blue-100 text-blue-700 border-blue-200"
  },
  volunteer: {
    label: "Volunteer Opportunity",
    color: "bg-purple-100 text-purple-700 border-purple-200"
  },
  donation_drive: {
    label: "Donation Drive",
    color: "bg-amber-100 text-amber-700 border-amber-200"
  },
  news: {
    label: "News & Updates",
    color: "bg-orange-100 text-orange-700 border-orange-200"
  }
};

export default function AnnouncementDetailPage() {
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (!id) {
      navigate(createPageUrl("Announcements"));
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }

    try {
      const announcements = await base44.entities.Announcement.list();
      const found = announcements.find((a) => a.id === id);
      
      if (found) {
        setAnnouncement(found);
      } else {
        navigate(createPageUrl("Announcements"));
      }
    } catch (error) {
      console.error("Error loading announcement:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load announcement details. Please try again.",
        variant: "destructive",
      });
      navigate(createPageUrl("Announcements"));
    }
    
    setIsLoading(false);
  };

  const handleEditClick = () => {
    if (user?.role === 'admin') {
      setIsEditing(true);
    } else {
      toast({
        title: "⛔ Access Denied",
        description: "Only administrators can edit announcements.",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async (data) => {
    try {
      await base44.entities.Announcement.update(announcement.id, data);
      setIsEditing(false);
      toast({
        title: "✅ Announcement updated!",
        description: "The announcement has been updated successfully.",
      });
      loadData();
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast({
        title: "❌ Error",
        description: "Failed to update announcement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = () => {
    if (user?.role === 'admin') {
      setShowConfirmDialog(true);
    } else {
      toast({
        title: "⛔ Access Denied",
        description: "Only administrators can delete announcements.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDialog(false);
    
    try {
      await base44.entities.Announcement.delete(announcement.id);
      toast({
        title: "✅ Announcement deleted",
        description: "The announcement has been removed successfully.",
      });
      navigate(createPageUrl("Announcements"));
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "❌ Error",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const config = announcement ? categoryConfig[announcement.category] || categoryConfig.news : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]" />
      </div>
    );
  }

  if (!announcement) {
    return null;
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnnouncementForm
          announcement={announcement}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Header Image */}
      {announcement.image_url && (
        <div className="relative w-full h-[40vh] sm:h-[50vh] bg-gradient-to-br from-amber-100 to-[#F5EFE6]">
          <img
            src={announcement.image_url}
            alt={announcement.title}
            className="w-full h-full object-contain sm:object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`bg-white rounded-2xl shadow-2xl border border-amber-200 p-6 sm:p-12 ${
            announcement.image_url ? "-mt-20 sm:-mt-32 relative z-10" : "mt-12"
          }`}
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Announcements"))}
            className="mb-6 -ml-2 text-[#8B4513] hover:text-[#5C2E0F] hover:bg-amber-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Announcements
          </Button>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge variant="outline" className={`${config.color} border font-medium text-sm px-3 py-1`}>
              {config.label}
            </Badge>
            {announcement.is_pinned && (
              <Badge className="bg-[#8B4513] text-white border-none">
                <Pin className="w-3 h-3 mr-1 fill-white" />
                Pinned
              </Badge>
            )}
            <div className="flex items-center gap-2 text-[#8B4513] text-sm ml-auto">
              <Calendar className="w-4 h-4" />
              {format(parseISO(announcement.date + "T00:00:00"), "MMMM d, yyyy")}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#5C2E0F] mb-6 leading-tight break-words">
            {announcement.title}
          </h1>

          {/* Meta Info with Admin Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-6 mb-8 border-b border-amber-200">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#8B4513]">
                Posted on {format(new Date(announcement.created_date), "MMMM d, yyyy")}
              </span>
            </div>
            {announcement.created_by && (
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white border-none">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
                <span className="text-sm text-[#8B4513]">
                  Posted by {announcement.created_by}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-[#8B4513] leading-relaxed whitespace-pre-wrap text-base sm:text-lg break-words">
              {announcement.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-8 border-t border-amber-200">
            <ShareButton announcement={announcement} />

            {user?.role === 'admin' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleEditClick}
                  className="gap-2 border-amber-300 hover:bg-amber-100 hover:text-[#5C2E0F]"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleDeleteClick}
                  className="gap-2 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-[#F5EFE6]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#5C2E0F]">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8B4513]">
              This will permanently delete the announcement. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#8B4513] text-[#8B4513] hover:bg-amber-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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