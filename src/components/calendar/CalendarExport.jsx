import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function CalendarExport({ event }) {
  const { t } = useLanguage();

  const formatDateForGoogle = (date, time) => {
    const d = new Date(`${date}T${time || '00:00'}`);
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const getGoogleCalendarUrl = () => {
    const title = event.event_title || event.title;
    const date = event.event_date || event.date;
    const startTime = event.start_time || '09:00';
    const endTime = event.end_time || '10:00';
    const location = event.location || event.address || '';
    const description = event.description || '';

    const start = formatDateForGoogle(date, startTime);
    const end = formatDateForGoogle(date, endTime);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
  };

  const downloadICS = () => {
    const title = event.event_title || event.title;
    const date = event.event_date || event.date;
    const startTime = event.start_time || '09:00';
    const endTime = event.end_time || '10:00';
    const location = event.location || event.address || '';
    const description = event.description || '';

    const start = formatDateForGoogle(date, startTime);
    const end = formatDateForGoogle(date, endTime);

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BountifulBlessings//EN
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border-amber-300 text-[#8B4513] hover:bg-amber-100 gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('calendar.addToCalendar')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(getGoogleCalendarUrl(), '_blank'); }}>
          <Calendar className="w-4 h-4 mr-2" /> Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); downloadICS(); }}>
          <Download className="w-4 h-4 mr-2" /> iCal / Outlook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}