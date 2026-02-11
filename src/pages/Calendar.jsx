import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, List, LayoutGrid } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, isBefore, isAfter, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import EventCard from "@/components/calendar/EventCard";

export default function CalendarPage() {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [announcements, setAnnouncements] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("calendar"); // calendar | list

  useEffect(() => { loadEvents(); }, []);

  // Real-time subscriptions
  useEffect(() => {
    const unsubAnnouncements = base44.entities.Announcement.subscribe((event) => {
      if (event.type === 'create') {
        setAnnouncements(prev => [event.data, ...prev]);
      } else if (event.type === 'update') {
        setAnnouncements(prev => prev.map(a => a.id === event.id ? event.data : a));
      } else if (event.type === 'delete') {
        setAnnouncements(prev => prev.filter(a => a.id !== event.id));
      }
    });
    const unsubVolunteers = base44.entities.Volunteer.subscribe((event) => {
      if (event.type === 'create') {
        setVolunteers(prev => [event.data, ...prev]);
      } else if (event.type === 'update') {
        setVolunteers(prev => prev.map(v => v.id === event.id ? event.data : v));
      } else if (event.type === 'delete') {
        setVolunteers(prev => prev.filter(v => v.id !== event.id));
      }
    });
    return () => { unsubAnnouncements(); unsubVolunteers(); };
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    const [a, v] = await Promise.all([
      base44.entities.Announcement.list(),
      base44.entities.Volunteer.list()
    ]);
    setAnnouncements(a);
    setVolunteers(v);
    setIsLoading(false);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = useMemo(() => {
    return [t('calendar.sun'), t('calendar.mon'), t('calendar.tue'), t('calendar.wed'), t('calendar.thu'), t('calendar.fri'), t('calendar.sat')];
  }, [t]);

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    let dayAnnouncements = announcements.filter(a => a.date === dateStr);
    let dayVolunteers = volunteers.filter(v => v.event_date === dateStr);
    if (typeFilter === "announcements") dayVolunteers = [];
    if (typeFilter === "volunteers") dayAnnouncements = [];
    if (typeFilter === "food_distribution") { dayAnnouncements = dayAnnouncements.filter(a => a.category === "food_distribution"); dayVolunteers = []; }
    if (typeFilter === "community_event") { dayAnnouncements = dayAnnouncements.filter(a => a.category === "community_event"); dayVolunteers = []; }
    return { announcements: dayAnnouncements, volunteers: dayVolunteers };
  };

  const hasEventsOnDate = (date) => {
    const { announcements: a, volunteers: v } = getEventsForDate(date);
    return a.length > 0 || v.length > 0;
  };

  const getEventCountForDate = (date) => {
    const { announcements: a, volunteers: v } = getEventsForDate(date);
    return a.length + v.length;
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : null;
  const totalSelectedEvents = selectedEvents ? selectedEvents.announcements.length + selectedEvents.volunteers.length : 0;

  // List view: upcoming events for next 30 days
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const futureDate = addDays(today, 30);
    const events = [];
    announcements.forEach(a => {
      const d = new Date(a.date);
      if (!isBefore(d, today) && !isAfter(d, futureDate)) {
        if (typeFilter === "all" || typeFilter === "announcements" || typeFilter === a.category) {
          events.push({ ...a, _type: 'announcement', _date: d });
        }
      }
    });
    volunteers.forEach(v => {
      const d = new Date(v.event_date);
      if (!isBefore(d, today) && !isAfter(d, futureDate)) {
        if (typeFilter === "all" || typeFilter === "volunteers") {
          events.push({ ...v, _type: 'volunteer', _date: d });
        }
      }
    });
    events.sort((a, b) => a._date - b._date);
    return events;
  }, [announcements, volunteers, typeFilter]);

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]" /></div>
  );

  return (
    <div className="min-h-screen py-6 px-3 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl mb-3">
            <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#5C2E0F] dark:text-white mb-1">{t('calendar.title')}</h1>
          <p className="text-[#8B4513] dark:text-amber-200 text-sm sm:text-lg">{t('calendar.subtitle')}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] sm:w-[200px] border-amber-300 dark:border-amber-700 text-sm">
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('calendar.allEvents')}</SelectItem>
              <SelectItem value="announcements">{t('calendar.announcementsOnly')}</SelectItem>
              <SelectItem value="volunteers">{t('calendar.volunteersOnly')}</SelectItem>
              <SelectItem value="food_distribution">{t('announcements.food_distribution')}</SelectItem>
              <SelectItem value="community_event">{t('announcements.community_event')}</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border border-amber-300 dark:border-amber-700 rounded-lg overflow-hidden ml-auto">
            <button onClick={() => setViewMode('calendar')} className={`p-2 ${viewMode === 'calendar' ? 'bg-amber-200 dark:bg-amber-800' : 'bg-white dark:bg-card'}`}>
              <LayoutGrid className="w-4 h-4 text-[#8B4513] dark:text-amber-400" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-amber-200 dark:bg-amber-800' : 'bg-white dark:bg-card'}`}>
              <List className="w-4 h-4 text-[#8B4513] dark:text-amber-400" />
            </button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="grid lg:grid-cols-5 gap-4">
            {/* Calendar Grid */}
            <div className="lg:col-span-3">
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="border-amber-300 dark:border-amber-700 h-9 w-9">
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="text-center">
                      <h2 className="text-lg sm:text-2xl font-bold text-[#5C2E0F] dark:text-white">{format(currentDate, 'MMMM yyyy')}</h2>
                      {!isToday(currentDate) && (
                        <button onClick={goToToday} className="text-xs text-[#8B4513] dark:text-amber-400 hover:underline mt-0.5">{t('calendar.today')}</button>
                      )}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="border-amber-300 dark:border-amber-700 h-9 w-9">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-xs font-semibold text-[#8B4513] dark:text-amber-300 py-1.5">{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map(day => {
                      const hasEvents = hasEventsOnDate(day);
                      const eventCount = getEventCountForDate(day);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isTodayDate = isToday(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);

                      return (
                        <button
                          key={day.toString()}
                          onClick={() => setSelectedDate(day)}
                          className={`
                            aspect-square rounded-xl text-center transition-all relative flex flex-col items-center justify-center min-h-[40px] sm:min-h-[48px]
                            ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-700' : 'text-[#5C2E0F] dark:text-white'}
                            ${isTodayDate && !isSelected ? 'bg-amber-100 dark:bg-amber-900/50 font-bold ring-2 ring-amber-400' : ''}
                            ${isSelected ? 'bg-[#8B4513] dark:bg-amber-600 text-white shadow-lg scale-105' : 'hover:bg-amber-50 dark:hover:bg-gray-800 active:scale-95'}
                          `}
                        >
                          <span className="text-sm sm:text-base leading-none">{format(day, 'd')}</span>
                          {hasEvents && (
                            <div className="flex gap-0.5 mt-0.5">
                              {eventCount <= 3 ? (
                                [...Array(Math.min(eventCount, 3))].map((_, i) => (
                                  <div key={i} className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#D2691E] dark:bg-amber-400'}`} />
                                ))
                              ) : (
                                <span className={`text-[9px] font-bold ${isSelected ? 'text-white/90' : 'text-[#D2691E] dark:text-amber-400'}`}>{eventCount}</span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-800 flex flex-wrap gap-3 text-xs text-[#8B4513] dark:text-amber-300">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-100 dark:bg-amber-900/50 rounded ring-1 ring-amber-400" />{t('calendar.today')}</div>
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#D2691E] dark:bg-amber-400 rounded-full" />{t('calendar.hasEvents')}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Date Events */}
            <div className="lg:col-span-2">
              <Card className="border-amber-200 dark:border-amber-800 lg:sticky lg:top-24">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#5C2E0F] dark:text-white">
                      {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : t('calendar.selectDate')}
                    </h3>
                    {totalSelectedEvents > 0 && (
                      <Badge className="bg-[#8B4513] text-white">{totalSelectedEvents} {t('calendar.events')}</Badge>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {totalSelectedEvents > 0 ? (
                      <motion.div key={selectedDate?.toString()} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {selectedEvents.announcements.map(event => (
                          <EventCard key={event.id} event={event} type="announcement" />
                        ))}
                        {selectedEvents.volunteers.map(event => (
                          <EventCard key={event.id} event={event} type="volunteer" />
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                        <CalendarIcon className="w-12 h-12 text-[#8B4513]/20 dark:text-amber-400/20 mx-auto mb-3" />
                        <p className="text-sm text-[#8B4513] dark:text-amber-200">
                          {selectedDate ? t('calendar.noEventsOnDate') : t('calendar.clickDate')}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* List View */
          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-bold text-[#5C2E0F] dark:text-white mb-4">
                {t('calendar.upcomingEvents')} <Badge className="bg-[#8B4513] text-white ml-2">{upcomingEvents.length}</Badge>
              </h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event, i) => {
                    const prevDate = i > 0 ? format(upcomingEvents[i - 1]._date, 'yyyy-MM-dd') : null;
                    const curDate = format(event._date, 'yyyy-MM-dd');
                    const showDateHeader = curDate !== prevDate;
                    return (
                      <React.Fragment key={`${event._type}-${event.id}`}>
                        {showDateHeader && (
                          <div className="flex items-center gap-2 pt-2">
                            <div className={`text-sm font-bold px-3 py-1 rounded-full ${isToday(event._date) ? 'bg-amber-200 dark:bg-amber-800 text-[#5C2E0F] dark:text-white' : 'bg-gray-100 dark:bg-gray-800 text-[#8B4513] dark:text-amber-200'}`}>
                              {isToday(event._date) ? t('calendar.today') : format(event._date, 'EEE, MMM d')}
                            </div>
                            <div className="flex-1 h-px bg-amber-200 dark:bg-amber-800" />
                          </div>
                        )}
                        <EventCard event={event} type={event._type === 'announcement' ? 'announcement' : 'volunteer'} />
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-[#8B4513]/20 mx-auto mb-4" />
                  <p className="text-[#8B4513] dark:text-amber-200">{t('calendar.noUpcoming')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}