import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Users, MapPin, Clock, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [signupData, setSignupData] = useState({ phone: '' });
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    event_title: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    description: '',
    volunteers_needed: 5
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling.current) return;
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;
      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 80 && !isRefreshing) {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
      }
      setPullDistance(0);
      isPulling.current = false;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const data = await base44.entities.Volunteer.list('-event_date');
      const upcoming = data.filter(v => new Date(v.event_date) >= new Date());
      setVolunteers(upcoming);
    } catch (error) {
      console.error("Error loading volunteers:", error);
      setUser(null);
    }
    setIsLoading(false);
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.Volunteer.create(formData);
      toast({
        title: "✅ Volunteer opportunity created!",
        description: "Your event has been posted."
      });
      setShowForm(false);
      setFormData({
        event_title: '',
        event_date: '',
        start_time: '',
        end_time: '',
        location: '',
        description: '',
        volunteers_needed: 5
      });
      loadData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to create event.",
        variant: "destructive"
      });
    }
  };

  const handleSignup = async () => {
    if (!user) {
      toast({
        title: "⛔ Login Required",
        description: "Please log in to sign up for volunteer opportunities.",
        variant: "destructive"
      });
      return;
    }

    if (!signupData.phone) {
      toast({
        title: "⚠️ Phone Required",
        description: "Please enter your phone number.",
        variant: "destructive"
      });
      return;
    }

    try {
      const existingSignups = selectedEvent.signups || [];
      
      if (existingSignups.some(s => s.user_email === user.email)) {
        toast({
          title: "ℹ️ Already Signed Up",
          description: "You're already registered for this event.",
        });
        return;
      }

      const updatedSignups = [
        ...existingSignups,
        {
          user_email: user.email,
          user_name: user.full_name,
          phone: signupData.phone
        }
      ];

      await base44.entities.Volunteer.update(selectedEvent.id, {
        signups: updatedSignups
      });

      toast({
        title: "✅ Signed Up!",
        description: "Thank you for volunteering! We'll contact you soon."
      });

      setShowSignupDialog(false);
      setSignupData({ phone: '' });
      loadData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to sign up.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 pb-24">
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 transition-opacity"
          style={{ opacity: Math.min(pullDistance / 80, 1) }}
        >
          <div className={`bg-white dark:bg-card rounded-full p-3 shadow-lg border-2 border-amber-300 dark:border-amber-700 ${isRefreshing ? 'animate-spin' : ''}`}>
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : pullDistance * 3 }}
              transition={{ duration: isRefreshing ? 1 : 0, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
            >
              <Heart className="w-5 h-5 text-[#8B4513] dark:text-amber-400" />
            </motion.div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl mb-3">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#5C2E0F] mb-2">
            Volunteer Opportunities
          </h1>
          <p className="text-[#8B4513] text-lg">
            Join us in serving our community
          </p>
        </div>

        {/* Create Button */}
        {user?.role === 'admin' && (
          <div className="mb-6 flex justify-end">
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Opportunity
            </Button>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <Card className="border-amber-200 mb-6">
            <CardHeader className="bg-[#F5EFE6]">
              <CardTitle className="text-[#5C2E0F]">New Volunteer Opportunity</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitEvent} className="space-y-4">
                <Input
                  placeholder="Event Title"
                  value={formData.event_title}
                  onChange={(e) => setFormData({ ...formData, event_title: e.target.value })}
                  required
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Volunteers Needed"
                    value={formData.volunteers_needed}
                    onChange={(e) => setFormData({ ...formData, volunteers_needed: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    type="time"
                    placeholder="Start Time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                  <Input
                    type="time"
                    placeholder="End Time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#8B4513] hover:bg-[#5C2E0F]">
                    Create Opportunity
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Volunteer Opportunities */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto" />
          </div>
        ) : volunteers.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {volunteers.map(event => {
              const signedUp = event.signups?.length || 0;
              const spotsLeft = event.volunteers_needed - signedUp;
              const isFull = spotsLeft <= 0;
              const userSignedUp = user && event.signups?.some(s => s.user_email === user.email);

              return (
                <Card key={event.id} className="border-amber-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-[#F5EFE6]">
                    <CardTitle className="text-[#5C2E0F]">{event.event_title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-[#8B4513]">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(event.event_date), 'MMMM d, yyyy')}</span>
                        {event.start_time && <span>• {event.start_time}</span>}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-2 text-[#8B4513]">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[#8B4513]">
                        <Users className="w-4 h-4" />
                        <span>
                          {signedUp} / {event.volunteers_needed} volunteers
                          {!isFull && <span className="text-green-600 ml-1">({spotsLeft} spots left)</span>}
                          {isFull && <span className="text-red-600 ml-1">(Full)</span>}
                        </span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-[#8B4513] mb-4">{event.description}</p>
                    )}

                    {userSignedUp ? (
                      <Button disabled className="w-full bg-green-600">
                        ✓ You're Signed Up
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowSignupDialog(true);
                        }}
                        disabled={isFull || !user}
                        className="w-full bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]"
                      >
                        {!user ? 'Login to Sign Up' : isFull ? 'Event Full' : 'Sign Up to Volunteer'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-amber-200">
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-[#8B4513] opacity-30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#5C2E0F] mb-2">No Opportunities Yet</h3>
              <p className="text-[#8B4513]">Check back soon for volunteer opportunities!</p>
            </CardContent>
          </Card>
        )}

        {/* Signup Dialog */}
        <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
          <DialogContent className="bg-[#F5EFE6]">
            <DialogHeader>
              <DialogTitle className="text-[#5C2E0F]">Sign Up to Volunteer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-[#8B4513]">
                You're signing up for: <strong>{selectedEvent?.event_title}</strong>
              </p>
              <Input
                type="tel"
                placeholder="Your phone number"
                value={signupData.phone}
                onChange={(e) => setSignupData({ phone: e.target.value })}
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowSignupDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSignup} className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0F]">
                  Confirm Sign Up
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}