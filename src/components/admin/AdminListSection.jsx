import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, CheckCircle, Star, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminListSection({ title, items, type, onAdd, onEdit, onDelete, onToggle, renderExtra }) {
  const [search, setSearch] = React.useState("");

  const getSearchable = (item) => {
    return [item.title, item.event_title, item.full_name, item.email, item.description, item.story_text, item.author_name, item.contact_name].filter(Boolean).join(" ").toLowerCase();
  };

  const filtered = items.filter(item => !search || getSearchable(item).includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 w-48 h-9 text-sm" />
          </div>
          {onAdd && (
            <Button onClick={onAdd} size="sm" className="bg-[#8B4513] hover:bg-[#5C2E0F]">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500">{filtered.length} items</p>

      <div className="space-y-2">
        {filtered.map((item) => (
          <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                {(item.image_url) && (
                  <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                )}
                {/* User avatar */}
                {type === "user" && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B4513] to-[#D2691E] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{(item.full_name || "U")[0]}</span>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {item.title || item.event_title || item.full_name || "Untitled"}
                    </p>
                    {item.is_pinned && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">📌 Pinned</Badge>}
                    {item.is_featured && <Badge className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0">⭐ Featured</Badge>}
                    {item.is_verified && <Badge className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0">✓ Verified</Badge>}
                    {item.is_approved === false && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Pending</Badge>}
                    {type === "user" && <Badge variant={item.role === "admin" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">{item.role}</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.description?.substring(0, 80) || item.story_text?.substring(0, 80) || item.email || ""}
                  </p>
                  {(item.date || item.event_date) && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {(() => { try { return format(parseISO((item.date || item.event_date) + "T00:00:00"), "MMM d, yyyy"); } catch { return item.date || item.event_date; } })()}
                    </p>
                  )}
                  {item.category && <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-1">{item.category}</Badge>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {renderExtra && renderExtra(item)}
                  {onEdit && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
                      <Edit className="w-3.5 h-3.5 text-gray-500" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(item)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-8 text-gray-400 text-sm">No items found.</p>
        )}
      </div>
    </div>
  );
}