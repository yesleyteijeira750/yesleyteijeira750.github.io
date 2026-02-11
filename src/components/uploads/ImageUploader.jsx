import React, { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image as ImageIcon, Crop, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import ImageCropper from "./ImageCropper";

export default function ImageUploader({ value, onChange, multiple = false, onMultipleUpload }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);

  const validateFiles = (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) {
      toast({ title: "Invalid file type", description: "Please upload image files (PNG, JPG, etc.)", variant: "destructive" });
      return [];
    }
    const validFiles = imageFiles.filter(f => f.size <= 10 * 1024 * 1024);
    if (validFiles.length < imageFiles.length) {
      toast({ title: "Some files too large", description: "Files over 10MB were skipped", variant: "destructive" });
    }
    return validFiles;
  };

  const processFile = (file) => {
    if (!multiple) {
      // Show cropper for single upload
      const url = URL.createObjectURL(file);
      setCropSrc(url);
      setPendingFile(file);
    } else {
      uploadFiles([file]);
    }
  };

  const processFiles = (files) => {
    const valid = validateFiles(files);
    if (!valid.length) return;
    if (multiple) {
      uploadFiles(valid);
    } else {
      processFile(valid[0]);
    }
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    setTotalFiles(files.length);
    setUploadedCount(0);
    setProgress(0);

    const urls = [];
    for (let i = 0; i < files.length; i++) {
      setProgress(Math.round(((i) / files.length) * 100));
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: files[i] });
        urls.push(file_url);
        setUploadedCount(i + 1);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      } catch {
        toast({ title: "Upload error", description: `Failed to upload file ${i + 1}`, variant: "destructive" });
      }
    }

    if (urls.length > 0) {
      if (multiple && onMultipleUpload) {
        onMultipleUpload(urls);
      } else {
        onChange(urls[0]);
      }
      toast({ title: `✅ Uploaded!`, description: `${urls.length} image(s) uploaded successfully.` });
    }

    setUploading(false);
    setProgress(0);
    setTotalFiles(0);
    setUploadedCount(0);
  };

  const handleCropDone = async (blob) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setPendingFile(null);
    const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
    await uploadFiles([file]);
  };

  const handleCropCancel = () => {
    // Upload original file without cropping
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    if (pendingFile) uploadFiles([pendingFile]);
    setPendingFile(null);
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files?.length) processFiles(files);
    e.target.value = '';
  };

  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files?.length) processFiles(files);
  }, [multiple]);

  // Cropper mode
  if (cropSrc) {
    return (
      <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-card p-4">
        <ImageCropper imageSrc={cropSrc} onCrop={handleCropDone} onCancel={handleCropCancel} />
      </div>
    );
  }

  // Has value — show preview
  if (value) {
    return (
      <div className="relative group rounded-xl overflow-hidden border-2 border-amber-300 dark:border-amber-700">
        <img src={value} alt="Preview" className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <Button
            type="button" variant="destructive" size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange("")}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Upload state
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !uploading && fileInputRef.current?.click()}
      className={`
        relative rounded-xl border-2 border-dashed transition-all cursor-pointer
        ${isDragOver
          ? 'border-[#8B4513] bg-amber-100 dark:bg-amber-900/30 scale-[1.02] shadow-lg'
          : 'border-amber-300 dark:border-amber-700 bg-[#F5EFE6]/30 dark:bg-amber-950/10 hover:border-[#8B4513] hover:bg-amber-50 dark:hover:bg-amber-900/20'
        }
        ${uploading ? 'pointer-events-none' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        capture={multiple ? undefined : "environment"}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      <div className="p-8 flex flex-col items-center gap-3">
        {uploading ? (
          <>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#E5D5C0" strokeWidth="4" />
                <circle
                  cx="32" cy="32" r="28" fill="none" stroke="#8B4513" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[#8B4513]">{progress}%</span>
              </div>
            </div>
            <div className="w-full max-w-xs">
              <Progress value={progress} className="h-2" />
            </div>
            <p className="text-sm font-medium text-[#8B4513] dark:text-amber-300">
              {t('announcementForm.uploading')} {totalFiles > 1 ? `(${uploadedCount}/${totalFiles})` : ''}
            </p>
          </>
        ) : isDragOver ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[#8B4513]/10 flex items-center justify-center animate-pulse">
              <Upload className="w-8 h-8 text-[#8B4513]" />
            </div>
            <p className="text-base font-semibold text-[#8B4513]">Drop image(s) here</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-[#8B4513] dark:text-amber-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#8B4513] dark:text-amber-300">
                {t('announcementForm.clickUpload')}
              </p>
              <p className="text-xs text-[#8B4513]/60 dark:text-amber-400/60 mt-1">
                or drag & drop • PNG, JPG up to 10MB
              </p>
              {!multiple && (
                <p className="text-xs text-[#8B4513]/50 dark:text-amber-400/50 mt-1 flex items-center justify-center gap-1">
                  <Crop className="w-3 h-3" /> Crop & resize before uploading
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}