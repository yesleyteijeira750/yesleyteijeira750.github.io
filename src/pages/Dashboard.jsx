import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Heart, TrendingUp, Bell, User, CreditCard, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [checkInsData, announcementsData] = await Promise.all([
        base44.entities.CheckIn.filter({ user_email: currentUser.email }),
        base44.entities.Announcement.list()
      ]);

      setCheckIns(checkInsData);

      const today = new Date();
      const upcoming = announcementsData.filter(a => new Date(a.date) >= today).slice(0, 5);
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error("Error loading data:", error);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md border-amber-200">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-[#5C2E0F] mb-4">Login Required</h2>
            <p className="text-[#8B4513]">Please log in to view your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#5C2E0F] mb-2">
            Welcome back, {user.full_name}! 👋
          </h1>
          <p className="text-[#8B4513] text-lg">
            Here's your activity overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B4513] mb-1">Total Visits</p>
                  <p className="text-3xl font-bold text-[#5C2E0F]">{checkIns.length}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B4513] mb-1">Member Since</p>
                  <p className="text-lg font-bold text-[#5C2E0F]">
                    {format(new Date(user.created_date), 'MMM yyyy')}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-[#8B4513] opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B4513] mb-1">Upcoming Events</p>
                  <p className="text-3xl font-bold text-[#5C2E0F]">{upcomingEvents.length}</p>
                </div>
                <Bell className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B4513] mb-1">Member ID</p>
                  <p className="text-lg font-mono font-bold text-[#5C2E0F]">
                    {user.barcode_number || 'Not Set'}
                  </p>
                </div>
                <CreditCard className="w-10 h-10 text-[#8B4513] opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Check-ins */}
          <Card className="border-amber-200">
            <CardHeader className="bg-[#F5EFE6]">
              <CardTitle className="text-[#5C2E0F]">Recent Check-ins</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {checkIns.length > 0 ? (
                <div className="space-y-3">
                  {checkIns.slice(0, 5).map((checkIn, idx) => (
                    <div key={checkIn.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-[#5C2E0F]">{checkIn.event_type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-[#8B4513]">
                          {format(new Date(checkIn.check_in_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-[#8B4513] opacity-30 mx-auto mb-3" />
                  <p className="text-[#8B4513]">No check-ins yet</p>
                  <p className="text-sm text-[#8B4513]/70">Visit us at our next event!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-amber-200">
            <CardHeader className="bg-[#F5EFE6]">
              <CardTitle className="text-[#5C2E0F]">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <Link
                      key={event.id}
                      to={createPageUrl(`AnnouncementDetail?id=${event.id}`)}
                      className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      <Bell className="w-5 h-5 text-[#8B4513] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-[#5C2E0F]">{event.title}</p>
                        <p className="text-sm text-[#8B4513]">
                          {format(new Date(event.date), 'MMM d, yyyy')}
                          {event.start_time && ` • ${event.start_time}`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-[#8B4513] opacity-30 mx-auto mb-3" />
                  <p className="text-[#8B4513]">No upcoming events</p>
                  <p className="text-sm text-[#8B4513]/70">Check back soon!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="border-amber-200">
            <CardHeader className="bg-[#F5EFE6]">
              <CardTitle className="text-[#5C2E0F]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to={createPageUrl("MyCard")}>
                  <Button className="w-full bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]">
                    <CreditCard className="w-4 h-4 mr-2" />
                    View My ID Card
                  </Button>
                </Link>
                <Link to={createPageUrl("Calendar")}>
                  <Button variant="outline" className="w-full border-[#8B4513] text-[#8B4513] hover:bg-amber-100">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Calendar
                  </Button>
                </Link>
                <Link to={createPageUrl("Volunteers")}>
                  <Button variant="outline" className="w-full border-[#8B4513] text-[#8B4513] hover:bg-amber-100">
                    <Heart className="w-4 h-4 mr-2" />
                    Volunteer
                  </Button>
                </Link>
                <Link to={createPageUrl("Resources")}>
                  <Button variant="outline" className="w-full border-[#8B4513] text-[#8B4513] hover:bg-amber-100">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Resources
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}