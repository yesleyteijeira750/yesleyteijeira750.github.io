import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Search, CheckCircle, User, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CheckInSystemPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventType, setEventType] = useState("food_distribution");
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
          description: "This system is only accessible to administrators.",
          variant: "destructive",
        });
        navigate(createPageUrl("Dashboard"));
        return;
      }
      
      setUser(currentUser);
      await loadRecentCheckIns();
    } catch (error) {
      toast({
        title: "⛔ Access Denied",
        description: "Please log in as an administrator.",
        variant: "destructive",
      });
      navigate(createPageUrl("Announcements"));
    }
  };

  const loadRecentCheckIns = async () => {
    setIsLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const checkIns = await base44.entities.CheckIn.filter({ check_in_date: today });
      setRecentCheckIns(checkIns.reverse());
    } catch (error) {
      console.error("Error loading check-ins:", error);
    }
    setIsLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const users = await base44.entities.User.list();
      const results = users.filter(u => 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.barcode_number?.includes(searchTerm)
      );
      setSearchResults(results);

      if (results.length === 0) {
        toast({
          title: "🔍 No Results",
          description: "No users found matching your search."
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to search users.",
        variant: "destructive"
      });
    }
  };

  const handleCheckIn = async (targetUser) => {
    const checkInData = {
      user_email: targetUser.email,
      user_name: targetUser.full_name,
      barcode_number: targetUser.barcode_number || '',
      check_in_date: format(new Date(), 'yyyy-MM-dd'),
      event_type: eventType,
      created_date: new Date().toISOString(),
    };

    // Optimistic UI update
    setRecentCheckIns(prev => [checkInData, ...prev]);
    setSearchTerm("");
    setSearchResults([]);

    toast({
      title: "✅ Check-In Successful!",
      description: `${targetUser.full_name} has been checked in.`
    });

    try {
      await base44.entities.CheckIn.create(checkInData);
      await loadRecentCheckIns(); // Refresh with real data
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to confirm check-in. Please refresh.",
        variant: "destructive"
      });
      await loadRecentCheckIns(); // Revert on error
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#5C2E0F]">Check-In System</h1>
              <p className="text-[#8B4513]">Scan barcodes or search members</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Search & Check-In */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-amber-200">
              <CardHeader className="bg-[#F5EFE6]">
                <CardTitle className="text-[#5C2E0F]">Member Lookup</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Search by name, email, or barcode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSearch}
                      className="bg-[#8B4513] hover:bg-[#5C2E0F]"
                    >
                      <Search className="w-5 h-5" />
                    </Button>
                  </div>

                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food_distribution">Food Distribution</SelectItem>
                      <SelectItem value="volunteer">Volunteer Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  {searchResults.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {searchResults.map(result => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-[#5C2E0F]">{result.full_name}</p>
                              <p className="text-sm text-[#8B4513]">{result.email}</p>
                              {result.barcode_number && (
                                <p className="text-xs text-[#8B4513] font-mono">
                                  ID: {result.barcode_number}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleCheckIn(result)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Check In
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Today's Stats */}
            <Card className="border-amber-200">
              <CardHeader className="bg-[#F5EFE6]">
                <CardTitle className="text-[#5C2E0F]">Today's Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{recentCheckIns.length}</p>
                    <p className="text-sm text-[#8B4513]">Total Check-Ins</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">
                      {recentCheckIns.filter(c => c.event_type === 'food_distribution').length}
                    </p>
                    <p className="text-sm text-[#8B4513]">Food Distribution</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Check-Ins */}
          <div className="lg:col-span-1">
            <Card className="border-amber-200 sticky top-24">
              <CardHeader className="bg-[#F5EFE6]">
                <CardTitle className="text-[#5C2E0F] flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Check-Ins
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {recentCheckIns.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentCheckIns.slice(0, 20).map((checkIn, idx) => (
                      <div key={checkIn.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#5C2E0F] truncate">
                            {checkIn.user_name}
                          </p>
                          <p className="text-xs text-[#8B4513]">
                            {format(new Date(checkIn.created_date), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-[#8B4513] opacity-30 mx-auto mb-3" />
                    <p className="text-[#8B4513]">No check-ins today yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}