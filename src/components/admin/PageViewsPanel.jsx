import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Users, Calendar } from "lucide-react";

export default function PageViewsPanel() {
  const [views, setViews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadViews(); }, []);

  const loadViews = async () => {
    setIsLoading(true);
    const allViews = await base44.entities.PageView.list("-created_date", 500);
    setViews(allViews);
    setIsLoading(false);
  };

  const today = new Date();
  const getDateStr = (daysAgo) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  const todayStr = getDateStr(0);
  const yesterdayStr = getDateStr(1);
  const twoDaysAgoStr = getDateStr(2);

  const viewsByDay = [
    { label: "Today", date: todayStr, views: views.filter(v => v.view_date === todayStr) },
    { label: "Yesterday", date: yesterdayStr, views: views.filter(v => v.view_date === yesterdayStr) },
    { label: "2 Days Ago", date: twoDaysAgoStr, views: views.filter(v => v.view_date === twoDaysAgoStr) },
  ];

  // Unique viewers per day
  const uniqueViewers = (dayViews) => {
    const seen = new Set();
    return dayViews.filter(v => { if (seen.has(v.user_email)) return false; seen.add(v.user_email); return true; });
  };

  if (isLoading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {viewsByDay.map(day => (
          <Card key={day.date} className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueViewers(day.views).length}</p>
              <p className="text-xs text-gray-500">{day.label}</p>
              <p className="text-[10px] text-gray-400">{day.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {viewsByDay.map(day => {
        const viewers = uniqueViewers(day.views);
        if (viewers.length === 0) return null;
        return (
          <div key={day.date}>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {day.label} — {viewers.length} unique visitor{viewers.length !== 1 ? "s" : ""}
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
              {viewers.map((v, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{(v.user_name || v.user_email)?.[0]?.toUpperCase() || "?"}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{v.user_name || "Unknown"}</p>
                    <p className="text-xs text-gray-500 truncate">{v.user_email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}