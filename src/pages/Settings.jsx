import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Trash2, Moon, Sun, Monitor, User } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [theme, setTheme] = useState("system");
  const { toast } = useToast();

  useEffect(() => {
    loadUser();
    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      base44.auth.redirectToLogin(window.location.pathname);
    }
    setIsLoading(false);
  };

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    toast({
      title: "✅ Theme updated",
      description: `Appearance set to ${newTheme}`,
    });
  };

  const handleDeleteAccount = async () => {
    try {
      await base44.entities.User.delete(user.id);
      toast({
        title: "✅ Account deleted",
        description: "Your account has been permanently deleted.",
      });
      setTimeout(() => {
        base44.auth.logout();
      }, 1500);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] dark:border-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] dark:from-[#D2691E] dark:to-[#8B4513] rounded-2xl mb-3">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#5C2E0F] dark:text-amber-100 mb-2">
              Settings
            </h1>
            <p className="text-[#8B4513] dark:text-amber-200/80">
              Manage your account preferences
            </p>
          </div>

          {/* Account Info */}
          <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-white dark:bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#5C2E0F] dark:text-amber-100">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-[#8B4513]/60 dark:text-amber-200/60">Name</p>
                <p className="font-medium text-[#5C2E0F] dark:text-amber-100">{user?.full_name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-[#8B4513]/60 dark:text-amber-200/60">Email</p>
                <p className="font-medium text-[#5C2E0F] dark:text-amber-100">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-[#8B4513]/60 dark:text-amber-200/60">Role</p>
                <p className="font-medium text-[#5C2E0F] dark:text-amber-100 capitalize">{user?.role}</p>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-white dark:bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#5C2E0F] dark:text-amber-100">
                <Moon className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription className="dark:text-amber-200/60">
                Choose how the app looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={theme} onValueChange={handleThemeChange}>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Sun className="w-4 h-4" />
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Moon className="w-4 h-4" />
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Monitor className="w-4 h-4" />
                    System
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription className="dark:text-red-300/60">
                Irreversible actions that will permanently affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#F5EFE6] dark:bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#5C2E0F] dark:text-amber-100">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#8B4513] dark:text-amber-200/80">
              This action cannot be undone. This will permanently delete your account and remove all
              your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#8B4513] text-[#8B4513] hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}