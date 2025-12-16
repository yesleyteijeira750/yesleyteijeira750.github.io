import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Calendar, CheckCircle, Heart, Bell } from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCheckIns: 0,
    totalAnnouncements: 0,
    totalVolunteers: 0,
    usersWithBarcodes: 0
  });
  const [checkInData, setCheckInData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.role !== "admin") {
        toast({
          title: "⛔ Access Denied",
          description: "Analytics is only accessible to administrators.",
          variant: "destructive",
        });
        navigate(createPageUrl("Dashboard"));
        return;
      }
      
      setUser(currentUser);
      await loadAnalytics();
    } catch (error) {
      toast({
        title: "⛔ Access Denied",
        description: "Please log in as an administrator.",
        variant: "destructive",
      });
      navigate(createPageUrl("Announcements"));
    }
  };

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [users, checkIns, announcements, volunteers] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.CheckIn.list(),
        base44.entities.Announcement.list(),
        base44.entities.Volunteer.list()
      ]);

      setStats({
        totalUsers: users.length,
        totalCheckIns: checkIns.length,
        totalAnnouncements: announcements.length,
        totalVolunteers: volunteers.length,
        usersWithBarcodes: users.filter(u => u.barcode_number).length
      });

      // Prepare chart data for last 7 days
      const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
      });

      const chartData = last7Days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const count = checkIns.filter(c => c.check_in_date === dateStr).length;
        return {
          date: format(day, 'MMM d'),
          checkIns: count
        };
      });

      setCheckInData(chartData);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#5C2E0F]">Analytics Dashboard</h1>
              <p className="text-[#8B4513]">Overview of your organization's impact</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B4513] mb-1">Total Members</p>
                  <p className="text-3xl font-bold text-[#5C2E0F]">{stats.totalUsers}</p>
                  <p className="text-xs text-[#8B4513] mt-1">
                    {stats.usersWithBarcodes} with ID cards
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B4513] mb-1">Total Check-Ins</p>
                  <p className="text-3xl font-bold text-[#5C2E0F]">{stats.totalCheckIns}</p>
                  <p className="text-xs text-[#8B4513] mt-1">All time</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B4513] mb-1">Announcements</p>
                  <p className="text-3xl font-bold text-[#5C2E0F]">{stats.totalAnnouncements}</p>
                  <p className="text-xs text-[#8B4513] mt-1">Published</p>
                </div>
                <Bell className="w-12 h-12 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B4513] mb-1">Volunteer Events</p>
                  <p className="text-3xl font-bold text-[#5C2E0F]">{stats.totalVolunteers}</p>
                  <p className="text-xs text-[#8B4513] mt-1">Opportunities</p>
                </div>
                <Heart className="w-12 h-12 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B4513] mb-1">Avg. Daily Check-Ins</p>
                  <p className="text-3xl font-bold text-[#5C2E0F]">
                    {checkInData.length > 0 
                      ? Math.round(checkInData.reduce((sum, d) => sum + d.checkIns, 0) / checkInData.length)
                      : 0}
                  </p>
                  <p className="text-xs text-[#8B4513] mt-1">Last 7 days</p>
                </div>
                <Calendar className="w-12 h-12 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B4513] mb-1">Engagement Rate</p>
                  <p className="text-3xl font-bold text-[#5C2E0F]">
                    {stats.totalUsers > 0 
                      ? Math.round((stats.totalCheckIns / stats.totalUsers) * 100) / 100
                      : 0}
                  </p>
                  <p className="text-xs text-[#8B4513] mt-1">Check-ins per member</p>
                </div>
                <TrendingUp className="w-12 h-12 text-[#8B4513] opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Check-In Trend Chart */}
        <Card className="border-amber-200">
          <CardHeader className="bg-[#F5EFE6]">
            <CardTitle className="text-[#5C2E0F]">Check-In Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={checkInData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
                <XAxis dataKey="date" stroke="#8B4513" />
                <YAxis stroke="#8B4513" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#F5EFE6', 
                    border: '1px solid #D2691E',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="checkIns" fill="#8B4513" name="Check-Ins" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}