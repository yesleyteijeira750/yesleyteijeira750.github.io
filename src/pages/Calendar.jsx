import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [announcements, setAnnouncements] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const [announcementsData, volunteersData] = await Promise.all([
        base44.entities.Announcement.list(),
        base44.entities.Volunteer.list()
      ]);
      setAnnouncements(announcementsData);
      setVolunteers(volunteersData);
    } catch (error) {
      console.error("Error loading events:", error);
    }
    setIsLoading(false);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAnnouncements = announcements.filter(a => a.date === dateStr);
    const dayVolunteers = volunteers.filter(v => v.event_date === dateStr);
    return { announcements: dayAnnouncements, volunteers: dayVolunteers };
  };

  const hasEventsOnDate = (date) => {
    const { announcements, volunteers } = getEventsForDate(date);
    return announcements.length > 0 || volunteers.length > 0;
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : null;

  const categoryColors = {
    food_distribution: "bg-green-100 text-green-800",
    community_event: "bg-blue-100 text-blue-800",
    volunteer: "bg-purple-100 text-purple-800",
    donation_drive: "bg-orange-100 text-orange-800",
    news: "bg-gray-100 text-gray-800"
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl mb-3">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#5C2E0F] mb-2">
            Events Calendar
          </h1>
          <p className="text-[#8B4513] text-lg">
            View all upcoming distributions, events, and volunteer opportunities
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="border-amber-200">
              <CardContent className="p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="border-amber-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-2xl font-bold text-[#5C2E0F]">
                    {format(currentDate, 'MMMM yyyy')}
                  </h2>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="border-amber-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-[#8B4513] py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map(day => {
                    const hasEvents = hasEventsOnDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);

                    return (
                      <button
                        key={day.toString()}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          aspect-square p-2 rounded-lg text-center transition-all
                          ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-[#5C2E0F] dark:text-white'}
                          ${isTodayDate ? 'bg-amber-100 dark:bg-amber-900 font-bold' : ''}
                          ${isSelected ? 'bg-[#8B4513] dark:bg-amber-600 text-white' : 'hover:bg-amber-50 dark:hover:bg-gray-800'}
                          ${hasEvents && !isSelected ? 'border-2 border-[#D2691E] dark:border-amber-500' : 'border border-amber-200 dark:border-gray-700'}
                        `}
                      >
                        <div className="text-sm">{format(day, 'd')}</div>
                        {hasEvents && !isSelected && (
                          <div className="w-1.5 h-1.5 bg-[#D2691E] dark:bg-amber-500 rounded-full mx-auto mt-1"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-amber-200 flex gap-4 text-sm text-[#8B4513]">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-100 rounded"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#D2691E] rounded"></div>
                    <span>Has Events</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events for Selected Date */}
          <div className="lg:col-span-1">
            <Card className="border-amber-200 dark:border-amber-800 sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#5C2E0F] dark:text-white mb-4">
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                </h3>

                {selectedEvents && (selectedEvents.announcements.length > 0 || selectedEvents.volunteers.length > 0) ? (
                  <div className="space-y-3">
                    {selectedEvents.announcements.map(event => (
                      <button
                        key={event.id}
                        onClick={() => navigate(createPageUrl('AnnouncementDetail') + `?id=${event.id}`)}
                        className="w-full text-left p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800 hover:shadow-md transition-shadow"
                      >
                        <Badge className={`${categoryColors[event.category]} mb-2`}>
                          {event.category.replace(/_/g, ' ')}
                        </Badge>
                        <h4 className="font-semibold text-[#5C2E0F] dark:text-white mb-1 flex items-center gap-2">
                          {event.title}
                          <ExternalLink className="w-3 h-3" />
                        </h4>
                        {event.start_time && (
                          <div className="flex items-center gap-1 text-sm text-[#8B4513] dark:text-white">
                            <Clock className="w-3 h-3" />
                            {event.start_time}
                            {event.end_time && ` - ${event.end_time}`}
                          </div>
                        )}
                        {event.address && (
                          <div className="flex items-start gap-1 text-sm text-[#8B4513] dark:text-white mt-1">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{event.address}</span>
                          </div>
                        )}
                      </button>
                    ))}

                    {selectedEvents.volunteers.map(event => {
                      const spotsLeft = event.volunteers_needed - (event.signups?.length || 0);
                      return (
                        <button
                          key={event.id}
                          onClick={() => navigate(createPageUrl('Volunteers'))}
                          className="w-full text-left p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow"
                        >
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mb-2">
                            Volunteer Opportunity
                          </Badge>
                          <h4 className="font-semibold text-[#5C2E0F] dark:text-white mb-1 flex items-center gap-2">
                            {event.event_title}
                            <ExternalLink className="w-3 h-3" />
                          </h4>
                          {event.start_time && (
                            <div className="flex items-center gap-1 text-sm text-[#8B4513] dark:text-white">
                              <Clock className="w-3 h-3" />
                              {event.start_time}
                              {event.end_time && ` - ${event.end_time}`}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm text-[#8B4513] dark:text-white mt-1">
                            <Users className="w-3 h-3" />
                            {event.signups?.length || 0} / {event.volunteers_needed} signed up
                            {spotsLeft > 0 && <span className="text-green-600 dark:text-green-400">({spotsLeft} spots left)</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : selectedDate ? (
                  <p className="text-[#8B4513] dark:text-white text-sm">No events scheduled for this date.</p>
                ) : (
                  <p className="text-[#8B4513] dark:text-white text-sm">Click on a date to see events.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}