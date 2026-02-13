import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";

const variants = {
  enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

export default function PhotoCarousel({ photos }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((idx, dir) => {
    setDirection(dir);
    setCurrent(idx);
  }, []);

  const goNext = useCallback(() => {
    goTo((current + 1) % photos.length, 1);
  }, [current, photos.length, goTo]);

  const goPrev = useCallback(() => {
    goTo(current === 0 ? photos.length - 1 : current - 1, -1);
  }, [current, photos.length, goTo]);

  // Auto-play every 5 seconds
  useEffect(() => {
    if (paused || photos.length <= 1) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [paused, goNext, photos.length]);

  // Swipe support
  const [touchStart, setTouchStart] = useState(null);
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext(); else goPrev();
    }
    setTouchStart(null);
  };

  if (!photos.length) return null;
  const photo = photos[current];

  return (
    <Card
      className="border-amber-200 dark:border-amber-800 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative aspect-[16/10] sm:aspect-video bg-gray-900 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={photo.id}
            src={photo.image_url}
            alt={photo.title}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {/* Photo info */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 text-white z-10">
          <h3 className="text-lg sm:text-xl font-bold drop-shadow-lg">{photo.title}</h3>
          {photo.event_date && (
            <p className="text-sm text-white/80 mt-1">{format(parseISO(photo.event_date + "T00:00:00"), 'MMMM d, yyyy')}</p>
          )}
          {photo.description && (
            <p className="text-sm text-white/70 mt-1 line-clamp-2">{photo.description}</p>
          )}
        </div>

        {/* Arrows */}
        {photos.length > 1 && (
          <>
            <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors z-10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors z-10">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Counter */}
        {photos.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full z-10">
            {current + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Dots */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-1.5 py-3 bg-white dark:bg-card">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-[#8B4513]' : 'w-2 h-2 bg-amber-300 dark:bg-amber-700 hover:bg-amber-400'}`}
            />
          ))}
        </div>
      )}
    </Card>
  );
}