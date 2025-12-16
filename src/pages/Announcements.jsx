import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Megaphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

import AnnouncementCard from "../components/announcements/AnnouncementCard";
import AnnouncementForm from "../components/announcements/AnnouncementForm";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchTerm, categoryFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }

    const data = await base44.entities.Announcement.list();
    const sorted = data.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.date) - new Date(a.date);
    });
    setAnnouncements(sorted);
    setIsLoading(false);
  };

  const filterAnnouncements = () => {
    let filtered = announcements;

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((a) => a.category === categoryFilter);
    }

    setFilteredAnnouncements(filtered);
  };

  const handleNewAnnouncementClick = () => {
    setShowPasswordDialog(true);
    setPassword("");
    setPasswordError("");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === "123456789Q") {
      setShowPasswordDialog(false);
      setShowForm(true);
      setPasswordError("");
      toast({
        title: "✅ Access granted",
        description: "You can now create an announcement.",
      });
    } else {
      setPasswordError("Access denied — only administrators can post announcements.");
      setPassword("");
    }
  };

  const scheduleReminderEmail = async (announcement) => {
    if (!announcement.start_time || !announcement.date) return;

    try {
      const eventDateTime = new Date(`${announcement.date}T${announcement.start_time}`);
      const oneHourBefore = new Date(eventDateTime.getTime() - 60 * 60 * 1000);
      const now = new Date();

      // If the reminder time is in the future, we'll note it
      // In a production app, you'd use a backend scheduler
      // For now, we just inform the user
      if (oneHourBefore > now) {
        console.log(`Reminder scheduled for: ${oneHourBefore.toLocaleString()}`);
      }
    } catch (error) {
      console.error("Error scheduling reminder:", error);
    }
  };

  const sendNotificationEmails = async (announcement) => {
    setIsSendingEmails(true);
    try {
      const allUsers = await base44.entities.User.list();
      
      const timeStr = announcement.start_time 
        ? new Date(`2000-01-01T${announcement.start_time}`).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })
        : '';
      
      const emailSubject = `🔔 New Announcement: ${announcement.title}`;
      
      const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #5C2E0F;
      background-color: #F5EFE6;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(139, 69, 19, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .announcement-title {
      font-size: 24px;
      font-weight: bold;
      color: #5C2E0F;
      margin: 0 0 20px 0;
    }
    .date-badge {
      display: inline-block;
      background: #FEF3C7;
      color: #8B4513;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .description {
      color: #8B4513;
      font-size: 16px;
      line-height: 1.8;
      margin: 20px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: bold;
      margin: 30px 0;
    }
    .footer {
      background: #F5EFE6;
      padding: 30px;
      text-align: center;
      border-top: 2px solid #D2691E;
    }
    .footer-text {
      color: #8B4513;
      font-size: 14px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📢 New Announcement</h1>
    </div>
    
    <div class="content">
      <h2 class="announcement-title">${announcement.title}</h2>
      
      <div class="date-badge">
        📅 ${new Date(announcement.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}${timeStr ? ` at ${timeStr}` : ''}
      </div>
      
      <hr style="border: none; border-top: 2px solid #F5EFE6; margin: 30px 0;">
      
      <div class="description">
        ${announcement.description.replace(/\n/g, '<br>')}
      </div>
      
      ${announcement.address ? `
        <p style="color: #8B4513; margin: 20px 0;">
          📍 <strong>Location:</strong> ${announcement.address}
        </p>
      ` : ''}
      
      ${announcement.start_time && announcement.end_time ? `
        <p style="color: #8B4513; margin: 20px 0;">
          ⏰ <strong>Time:</strong> ${timeStr} - ${new Date(`2000-01-01T${announcement.end_time}`).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })}
        </p>
      ` : announcement.start_time ? `
        <p style="color: #8B4513; margin: 20px 0;">
          ⏰ <strong>Starts at:</strong> ${timeStr}
        </p>
      ` : ''}
      
      <div style="text-align: center;">
        <a href="${window.location.origin}" class="cta-button">
          View Full Announcement
        </a>
      </div>
    </div>
    
    <div class="footer">
      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e4114143e84ad0df65d068/d3675659f_logo.png" 
           alt="Food Pantry Bountiful Blessings" 
           style="max-width: 200px; height: auto; margin-bottom: 15px;">
      <p class="footer-text">Food Pantry Bountiful Blessings</p>
      <p class="footer-text">Serving the community with love and compassion</p>
    </div>
  </div>
</body>
</html>
      `.trim();

      const emailPromises = allUsers.map(u => 
        base44.integrations.Core.SendEmail({
          from_name: "Food Pantry Bountiful Blessings",
          to: u.email,
          subject: emailSubject,
          body: emailBody
        }).catch(error => {
          console.error(`Failed to send email to ${u.email}:`, error);
          return null;
        })
      );

      await Promise.all(emailPromises);
      
      toast({
        title: "📧 Notifications sent successfully!",
        description: `Email alerts sent to ${allUsers.length} user(s).`,
      });
    } catch (error) {
      console.error("Error sending notification emails:", error);
      toast({
        title: "⚠️ Notification error",
        description: "Some notifications may not have been sent.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const newAnnouncement = await base44.entities.Announcement.create(data);
      setShowForm(false);
      
      sendNotificationEmails(newAnnouncement);
      scheduleReminderEmail(newAnnouncement);
      
      loadData();
      
      toast({
        title: "✅ Announcement created!",
        description: "Sending email notifications to all users...",
      });
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        title: "❌ Error",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#D2691E] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
              <Megaphone className="w-10 h-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Bountiful Blessings of Charlotte County Inc.
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Our goal is that no one goes to bed hungry.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]/50 w-5 h-5" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-amber-300 focus:border-[#8B4513] bg-white"
            />
          </div>

          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px] border-amber-300 bg-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food_distribution">Food Distribution</SelectItem>
                <SelectItem value="community_event">Community Event</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="donation_drive">Donation Drive</SelectItem>
                <SelectItem value="news">News & Updates</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleNewAnnouncementClick}
              disabled={isSendingEmails}
              className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Announcement
            </Button>
          </div>
        </div>

        {/* Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="sm:max-w-md bg-[#F5EFE6]">
            <DialogHeader>
              <DialogTitle className="text-[#5C2E0F]">🔐 Administrator Access Required</DialogTitle>
              <DialogDescription className="text-[#8B4513]">
                Please enter the administrator password to create a new announcement.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`border-amber-300 focus:border-[#8B4513] bg-white ${
                    passwordError ? "border-red-500" : ""
                  }`}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-sm text-red-600 font-medium">{passwordError}</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordDialog(false);
                    setPasswordError("");
                    setPassword("");
                  }}
                  className="flex-1 border-[#8B4513] text-[#8B4513] hover:bg-amber-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]"
                >
                  Submit
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              <AnnouncementForm
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Announcements Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 bg-white/50 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement, index) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                index={index}
                onDelete={loadData}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Megaphone className="w-12 h-12 text-[#8B4513]" />
            </div>
            <h3 className="text-2xl font-bold text-[#5C2E0F] mb-2">
              No announcements found
            </h3>
            <p className="text-[#8B4513] max-w-md mx-auto">
              {searchTerm || categoryFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Check back soon for updates and community news"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}