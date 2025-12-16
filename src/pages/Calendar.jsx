import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [announcements, setAnnouncements] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
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
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const announcements = announcements.filter(a => a.date === dateStr);
    const volunteers = volunteers.filter(v => v.event_date === dateStr);
    return { announcements, volunteers };
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
                  {daysInMonth.map(day => {
                    const hasEvents = hasEventsOnDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                      <button
                        key={day.toString()}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          aspect-square p-2 rounded-lg text-center transition-all
                          ${!isSameMonth(day, currentDate) ? 'text-gray-300' : 'text-[#5C2E0F]'}
                          ${isTodayDate ? 'bg-amber-100 font-bold' : ''}
                          ${isSelected ? 'bg-[#8B4513] text-white' : 'hover:bg-amber-50'}
                          ${hasEvents && !isSelected ? 'border-2 border-[#D2691E]' : 'border border-amber-200'}
                        `}
                      >
                        <div className="text-sm">{format(day, 'd')}</div>
                        {hasEvents && !isSelected && (
                          <div className="w-1.5 h-1.5 bg-[#D2691E] rounded-full mx-auto mt-1"></div>
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
            <Card className="border-amber-200 sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#5C2E0F] mb-4">
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                </h3>

                {selectedEvents && (selectedEvents.announcements.length > 0 || selectedEvents.volunteers.length > 0) ? (
                  <div className="space-y-4">
                    {selectedEvents.announcements.map(event => (
                      <div key={event.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <Badge className={`${categoryColors[event.category]} mb-2`}>
                          {event.category.replace(/_/g, ' ')}
                        </Badge>
                        <h4 className="font-semibold text-[#5C2E0F] mb-1">{event.title}</h4>
                        {event.start_time && (
                          <div className="flex items-center gap-1 text-sm text-[#8B4513]">
                            <Clock className="w-3 h-3" />
                            {event.start_time}
                            {event.end_time && ` - ${event.end_time}`}
                          </div>
                        )}
                        {event.address && (
                          <div className="flex items-center gap-1 text-sm text-[#8B4513] mt-1">
                            <MapPin className="w-3 h-3" />
                            {event.address}
                          </div>
                        )}
                      </div>
                    ))}

                    {selectedEvents.volunteers.map(event => (
                      <div key={event.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <Badge className="bg-purple-100 text-purple-800 mb-2">
                          Volunteer Opportunity
                        </Badge>
                        <h4 className="font-semibold text-[#5C2E0F] mb-1">{event.event_title}</h4>
                        {event.start_time && (
                          <div className="flex items-center gap-1 text-sm text-[#8B4513]">
                            <Clock className="w-3 h-3" />
                            {event.start_time}
                            {event.end_time && ` - ${event.end_time}`}
                          </div>
                        )}
                        <div className="text-sm text-[#8B4513] mt-1">
                          {event.signups?.length || 0} / {event.volunteers_needed} volunteers
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <p className="text-[#8B4513] text-sm">No events scheduled for this date.</p>
                ) : (
                  <p className="text-[#8B4513] text-sm">Click on a date to see events.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}