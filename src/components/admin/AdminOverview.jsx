import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Megaphone, Heart, Camera, BookOpen, BarChart3, ClipboardCheck, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminOverview({ stats }) {
  const navigate = useNavigate();

  const cards = [
    { label: "Users", count: stats.users, icon: Users, color: "from-blue-500 to-blue-600", tab: "users" },
    { label: "Announcements", count: stats.announcements, icon: Megaphone, color: "from-orange-500 to-orange-600", tab: "announcements" },
    { label: "Resources", count: stats.resources, icon: Heart, color: "from-pink-500 to-pink-600", tab: "resources" },
    { label: "Photos", count: stats.photos, icon: Camera, color: "from-emerald-500 to-emerald-600", tab: "photos" },
    { label: "Volunteers", count: stats.volunteers, icon: Users, color: "from-purple-500 to-purple-600", tab: "volunteers" },
    { label: "Stories", count: stats.stories, icon: BookOpen, color: "from-amber-500 to-amber-600", tab: "stories" },
  ];

  const quickActions = [
    { label: "New Announcement", icon: Megaphone, page: "Announcements" },
    { label: "Check-In System", icon: ClipboardCheck, page: "CheckInSystem" },
    { label: "View Analytics", icon: BarChart3, page: "Analytics" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button key={c.label} onClick={() => stats.setTab(c.tab)} className="text-left">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{c.label}</p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#8B4513]" /> Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <Button key={a.label} variant="outline" onClick={() => navigate(createPageUrl(a.page))} className="w-full justify-start border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                    <Icon className="w-4 h-4 mr-2 text-[#8B4513]" /> {a.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#8B4513]" /> Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Verified Resources</span><span className="font-semibold text-gray-900 dark:text-white">{stats.verifiedResources}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Signups</span><span className="font-semibold text-gray-900 dark:text-white">{stats.volunteerSignups}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Approved Stories</span><span className="font-semibold text-gray-900 dark:text-white">{stats.approvedStories}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Gallery Photos</span><span className="font-semibold text-gray-900 dark:text-white">{stats.photos}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}