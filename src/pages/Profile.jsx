import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  LogOut, 
  Moon, 
  Sun, 
  Monitor, 
  Globe, 
  Shield,
  FileText,
  Trash2,
  Mail,
  Calendar as CalendarIcon,
  Info,
  Phone,
  Heart,
  BookOpen,
  Camera,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { motion } from "framer-motion";

const translations = {
  en: {
    profile: "Profile",
    settings: "Settings",
    account: "Account Information",
    name: "Name",
    email: "Email",
    role: "Role",
    admin: "Administrator",
    user: "User",
    appearance: "Appearance",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    language: "Language",
    english: "English",
    spanish: "Spanish",
    creole: "Creole",
    russian: "Russian",
    navigation: "Navigation",
    calendar: "Calendar",
    about: "About Us",
    contact: "Contact",
    volunteers: "Volunteer Opportunities",
    stories: "Stories",
    reviews: "Reviews",
    privacy: "Privacy Policy",
    dangerZone: "Danger Zone",
    deleteAccount: "Delete Account",
    deleteWarning: "This action cannot be undone. This will permanently delete your account.",
    logout: "Logout",
    cancel: "Cancel",
    confirm: "Confirm",
    loginPrompt: "Please log in to view your profile"
  },
  es: {
    profile: "Perfil",
    settings: "Configuración",
    account: "Información de Cuenta",
    name: "Nombre",
    email: "Correo",
    role: "Rol",
    admin: "Administrador",
    user: "Usuario",
    appearance: "Apariencia",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
    language: "Idioma",
    english: "Inglés",
    spanish: "Español",
    creole: "Criollo",
    russian: "Ruso",
    navigation: "Navegación",
    calendar: "Calendario",
    about: "Acerca de Nosotros",
    contact: "Contacto",
    volunteers: "Oportunidades de Voluntariado",
    stories: "Historias",
    reviews: "Reseñas",
    privacy: "Política de Privacidad",
    dangerZone: "Zona de Peligro",
    deleteAccount: "Eliminar Cuenta",
    deleteWarning: "Esta acción no se puede deshacer. Esto eliminará permanentemente su cuenta.",
    logout: "Cerrar Sesión",
    cancel: "Cancelar",
    confirm: "Confirmar",
    loginPrompt: "Por favor inicie sesión para ver su perfil"
  },
  ht: {
    profile: "Pwofil",
    settings: "Paramèt",
    account: "Enfòmasyon Kont",
    name: "Non",
    email: "Imèl",
    role: "Wòl",
    admin: "Administratè",
    user: "Itilizatè",
    appearance: "Aparans",
    theme: "Tèm",
    light: "Klè",
    dark: "Fènwa",
    system: "Sistèm",
    language: "Lang",
    english: "Anglè",
    spanish: "Panyòl",
    creole: "Kreyòl",
    russian: "Ris",
    navigation: "Navigasyon",
    calendar: "Kalandriye",
    about: "Konsènan Nou",
    contact: "Kontak",
    volunteers: "Opòtinite Volontè",
    stories: "Istwa",
    reviews: "Revizyon",
    privacy: "Politik Konfidansyalite",
    dangerZone: "Zòn Danje",
    deleteAccount: "Efase Kont",
    deleteWarning: "Aksyon sa a pa ka ranvèse. Sa ap efase kont ou pou tout tan.",
    logout: "Dekonekte",
    cancel: "Anile",
    confirm: "Konfime",
    loginPrompt: "Tanpri konekte pou wè pwofil ou"
  },
  ru: {
    profile: "Профиль",
    settings: "Настройки",
    account: "Информация об аккаунте",
    name: "Имя",
    email: "Эл. почта",
    role: "Роль",
    admin: "Администратор",
    user: "Пользователь",
    appearance: "Внешний вид",
    theme: "Тема",
    light: "Светлая",
    dark: "Темная",
    system: "Системная",
    language: "Язык",
    english: "Английский",
    spanish: "Испанский",
    creole: "Креольский",
    russian: "Русский",
    navigation: "Навигация",
    calendar: "Календарь",
    about: "О нас",
    contact: "Контакты",
    volunteers: "Волонтерство",
    stories: "Истории",
    reviews: "Отзывы",
    privacy: "Политика конфиденциальности",
    dangerZone: "Опасная зона",
    deleteAccount: "Удалить аккаунт",
    deleteWarning: "Это действие нельзя отменить. Ваш аккаунт будет удален навсегда.",
    logout: "Выйти",
    cancel: "Отмена",
    confirm: "Подтвердить",
    loginPrompt: "Пожалуйста, войдите, чтобы просмотреть свой профиль"
  }
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const t = translations[language];

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Not logged in:", error);
      setUser(null);
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
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) {
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
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    window.location.reload(); // Reload to apply language everywhere
  };

  const handleDeleteAccount = async () => {
    try {
      await base44.asServiceRole.entities.User.delete(user.id);
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      setTimeout(() => {
        base44.auth.logout();
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const menuItems = [
    { icon: CalendarIcon, label: t.calendar, path: "Calendar" },
    { icon: Info, label: t.about, path: "AboutUs" },
    { icon: Phone, label: t.contact, path: "Contact" },
    { icon: Heart, label: t.volunteers, path: "Volunteers" },
    { icon: BookOpen, label: t.stories, path: "Stories" },
    { icon: Info, label: t.reviews, path: "Reviews" },
    { icon: FileText, label: t.privacy, path: "PrivacyPolicy" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] dark:border-amber-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-amber-200 dark:border-amber-800">
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 text-[#8B4513] dark:text-amber-400 opacity-30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#5C2E0F] dark:text-white mb-2">
              {t.loginPrompt}
            </h3>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
              className="mt-4 bg-[#8B4513] hover:bg-[#5C2E0F] dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[#8B4513] to-[#D2691E] dark:from-amber-600 dark:to-amber-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {user.full_name?.[0] || "U"}
                  </span>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[#5C2E0F] dark:text-white mb-1">
                    {user.full_name}
                  </h1>
                  <p className="text-[#8B4513] dark:text-amber-300">{user.email}</p>
                  {user.role === "admin" && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-gradient-to-r from-[#8B4513] to-[#D2691E] dark:from-amber-600 dark:to-amber-800 px-3 py-1 rounded-full">
                        <Shield className="w-3 h-3" />
                        {t.admin}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800">
            <CardTitle className="text-[#5C2E0F] dark:text-white">{t.settings}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Appearance */}
            <div>
              <h3 className="text-sm font-medium text-[#5C2E0F] dark:text-white mb-3 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                {t.appearance}
              </h3>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="border-amber-300 dark:border-amber-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      {t.light}
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      {t.dark}
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      {t.system}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div>
              <h3 className="text-sm font-medium text-[#5C2E0F] dark:text-white mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t.language}
              </h3>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="border-amber-300 dark:border-amber-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 {t.english}</SelectItem>
                  <SelectItem value="es">🇪🇸 {t.spanish}</SelectItem>
                  <SelectItem value="ht">🇭🇹 {t.creole}</SelectItem>
                  <SelectItem value="ru">🇷🇺 {t.russian}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800">
            <CardTitle className="text-[#5C2E0F] dark:text-white">{t.navigation}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(createPageUrl(item.path))}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-[#8B4513] dark:text-amber-400" />
                      <span className="text-[#5C2E0F] dark:text-white font-medium">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#8B4513] dark:text-amber-400" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-gray-800"
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t.logout}
        </Button>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="bg-red-50 dark:bg-red-950">
            <CardTitle className="text-red-700 dark:text-red-400">{t.dangerZone}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-[#8B4513] dark:text-amber-300 mb-4">
              {t.deleteWarning}
            </p>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t.deleteAccount}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#5C2E0F] dark:text-white">
              {t.deleteAccount}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#8B4513] dark:text-amber-300">
              {t.deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:border-amber-700 dark:text-white">
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              {t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}