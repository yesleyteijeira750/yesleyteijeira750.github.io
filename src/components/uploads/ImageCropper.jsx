import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCw, ZoomIn, Crop, Check, X } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ImageCropper({ imageSrc, onCrop, onCancel }) {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { imgRef.current = img; setImgLoaded(true); };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (!imgLoaded || !imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    const size = Math.min(canvas.width, canvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const aspectRatio = img.width / img.height;
    let drawW, drawH;
    if (aspectRatio > 1) { drawH = size; drawW = size * aspectRatio; }
    else { drawW = size; drawH = size / aspectRatio; }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Draw crop overlay
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    const cropSize = size * 0.85;
    const cropX = (canvas.width - cropSize) / 2;
    const cropY = (canvas.height - cropSize) / 2;
    
    ctx.fillRect(0, 0, canvas.width, cropY);
    ctx.fillRect(0, cropY + cropSize, canvas.width, canvas.height - cropY - cropSize);
    ctx.fillRect(0, cropY, cropX, cropSize);
    ctx.fillRect(cropX + cropSize, cropY, canvas.width - cropX - cropSize, cropSize);

    // Crop border
    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropSize, cropSize);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cropX + (cropSize * i) / 3, cropY);
      ctx.lineTo(cropX + (cropSize * i) / 3, cropY + cropSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cropX, cropY + (cropSize * i) / 3);
      ctx.lineTo(cropX + cropSize, cropY + (cropSize * i) / 3);
      ctx.stroke();
    }
  }, [imgLoaded, zoom, rotation, pan]);

  const handlePointerDown = (e) => {
    setDragging(true);
    const point = e.touches ? e.touches[0] : e;
    setDragStart({ x: point.clientX - pan.x, y: point.clientY - pan.y });
  };

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    const point = e.touches ? e.touches[0] : e;
    setPan({ x: point.clientX - dragStart.x, y: point.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handlePointerUp = () => setDragging(false);

  const handleCrop = () => {
    if (!imgRef.current) return;
    const canvas = canvasRef.current;
    const size = Math.min(canvas.width, canvas.height);
    const cropSize = size * 0.85;
    const cropX = (canvas.width - cropSize) / 2;
    const cropY = (canvas.height - cropSize) / 2;

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = 800;
    outputCanvas.height = 800;
    const outCtx = outputCanvas.getContext('2d');
    outCtx.drawImage(canvas, cropX, cropY, cropSize, cropSize, 0, 0, 800, 800);

    outputCanvas.toBlob((blob) => {
      if (blob) onCrop(blob);
    }, 'image/jpeg', 0.85);
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-sm font-medium text-[#5C2E0F] dark:text-white flex items-center justify-center gap-2">
        <Crop className="w-4 h-4" /> Crop & Adjust Image
      </div>
      <div
        ref={containerRef}
        className="relative bg-gray-900 rounded-xl overflow-hidden touch-none select-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <canvas ref={canvasRef} width={400} height={400} className="w-full aspect-square cursor-grab active:cursor-grabbing" />
      </div>

      <div className="space-y-3 px-1">
        <div className="flex items-center gap-3">
          <ZoomIn className="w-4 h-4 text-[#8B4513] dark:text-amber-400 flex-shrink-0" />
          <Slider value={[zoom]} min={0.5} max={3} step={0.05} onValueChange={([v]) => setZoom(v)} className="flex-1" />
          <span className="text-xs text-[#8B4513] dark:text-amber-300 w-10 text-right">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <RotateCw className="w-4 h-4 text-[#8B4513] dark:text-amber-400 flex-shrink-0" />
          <Slider value={[rotation]} min={-180} max={180} step={1} onValueChange={([v]) => setRotation(v)} className="flex-1" />
          <span className="text-xs text-[#8B4513] dark:text-amber-300 w-10 text-right">{rotation}°</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-amber-300"><X className="w-4 h-4 mr-1" />{t('common.cancel')}</Button>
        <Button type="button" onClick={handleCrop} className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0F] text-white"><Check className="w-4 h-4 mr-1" /> Apply Crop</Button>
      </div>
    </div>
  );
}