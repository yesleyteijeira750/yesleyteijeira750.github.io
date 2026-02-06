import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export default function ResponsiveSelect({ 
  value, 
  onValueChange, 
  placeholder, 
  children, 
  triggerClassName,
  label 
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    const options = React.Children.toArray(children);
    
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={triggerClassName || "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"}
        >
          <span>{value ? options.find(opt => opt.props.value === value)?.props.children || placeholder : placeholder}</span>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50">
            <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
        </button>
        
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="bg-white dark:bg-card">
            <DrawerHeader>
              <DrawerTitle className="text-[#5C2E0F] dark:text-white">
                {label || "Select an option"}
              </DrawerTitle>
            </DrawerHeader>
            <div className="p-4 pb-8 space-y-2">
              {options.map((option) => (
                <button
                  key={option.props.value}
                  onClick={() => {
                    onValueChange(option.props.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    value === option.props.value
                      ? "bg-amber-200 dark:bg-amber-900 text-[#5C2E0F] dark:text-white font-medium"
                      : "hover:bg-amber-100 dark:hover:bg-gray-800 text-[#8B4513] dark:text-white"
                  }`}
                >
                  {option.props.children}
                </button>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  );
}