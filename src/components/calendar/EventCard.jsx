import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CalendarExport from "./CalendarExport";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function EventCard({ event, type }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const isAnnouncement = type === 'announcement';
  const title = isAnnouncement ? event.title : event.event_title;

  const categoryConfig = {
    food_distribution: { label: t('announcements.food_distribution'), color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    community_event: { label: t('announcements.community_event'), color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    volunteer: { label: t('announcements.volunteer'), color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
    donation_drive: { label: t('announcements.donation_drive'), color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
    news: { label: t('announcements.news'), color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
  };

  const formatTime = (time) => {
    if (!time) return '';
    try { return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); } catch { return time; }
  };

  const handleClick = () => {
    if (isAnnouncement) navigate(createPageUrl(`AnnouncementDetail?id=${event.id}`));
    else navigate(createPageUrl('Volunteers'));
  };

  const spotsLeft = !isAnnouncement ? event.volunteers_needed - (event.signups?.length || 0) : 0;
  const config = isAnnouncement ? categoryConfig[event.category] || categoryConfig.news : { label: t('calendar.volunteerOpp'), color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" };

  return (
    <div
      onClick={handleClick}
      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer active:scale-[0.98] ${
        isAnnouncement
          ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 hover:shadow-md hover:border-amber-300'
          : 'bg-purple-50/80 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 hover:shadow-md hover:border-purple-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge className={`${config.color} text-xs`}>{config.label}</Badge>
        <CalendarExport event={event} />
      </div>
      <h4 className="font-semibold text-[#5C2E0F] dark:text-white mb-2 flex items-center gap-2 text-base">
        {title}
        <ExternalLink className="w-3 h-3 text-[#8B4513]/40 flex-shrink-0" />
      </h4>
      <div className="space-y-1.5">
        {(event.start_time || event.end_time) && (
          <div className="flex items-center gap-1.5 text-sm text-[#8B4513] dark:text-amber-200">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formatTime(event.start_time)}{event.start_time && event.end_time && ' – '}{formatTime(event.end_time)}</span>
          </div>
        )}
        {(event.address || event.location) && (
          <div className="flex items-start gap-1.5 text-sm text-[#8B4513] dark:text-amber-200">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{event.address || event.location}</span>
          </div>
        )}
        {!isAnnouncement && (
          <div className="flex items-center gap-1.5 text-sm text-[#8B4513] dark:text-amber-200">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {event.signups?.length || 0} / {event.volunteers_needed} {t('volunteers.volunteers')}
              {spotsLeft > 0 && <span className="text-green-600 dark:text-green-400 ml-1">({spotsLeft} {t('volunteers.spotsLeft')})</span>}
              {spotsLeft <= 0 && <span className="text-red-500 ml-1">({t('volunteers.full')})</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}