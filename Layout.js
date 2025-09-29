
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users,
  BarChart3,
  Settings,
  Moon,
  Sun,
  Search,
  Bell,
  User as UserIcon,
  UserCog,
  Shield,
  BellRing, // Added BellRing icon
  LogOut // Added LogOut icon
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Removed AvatarImage
import { Badge } from "@/components/ui/badge";
import { User } from "@/entities/User";
import { Notification } from "@/entities/Notification";
import NotificationPanel from "./components/notifications/NotificationPanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  {
    title: "Contacts",
    url: createPageUrl("Contacts"),
    icon: Users,
  },
  {
    title: "Pipeline",
    url: createPageUrl("Pipeline"),
    icon: BarChart3,
  },
  {
    title: "Tâches", // Added Tâches navigation item
    url: createPageUrl("Taches"),
    icon: BellRing,
  }
];

const bottomNavigationItems = [ // Added bottomNavigationItems
    {
        title: "Réglages",
        url: createPageUrl("Settings"),
        icon: Settings,
    }
];

const adminNavigationItems = [
  {
    title: "Gestion Utilisateurs",
    url: createPageUrl("UserManagement"),
    icon: UserCog,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.log("User not authenticated");
    }
  };

  const loadNotifications = React.useCallback(async () => {
    if (!user) return;

    try {
      const userNotifications = await Notification.filter(
        { user_id: user.id },
        "-created_date",
        20
      );
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    }
  }, [user]);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications();

      const notificationInterval = setInterval(loadNotifications, 30000);

      return () => clearInterval(notificationInterval);
    }
  }, [user, loadNotifications]);

  useEffect(() => {
    // Simplified dark mode logic based on user preferences
    const isDarkMode = user?.preferences?.dark_mode || false;
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user]);

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark');

    if (user) {
      try {
        await User.updateMyUserData({
          preferences: {
            ...user.preferences,
            dark_mode: newDarkMode
          }
        });
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des préférences:", error);
      }
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { read: true });
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await Notification.update(notification.id, { read: true });
      }
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des notifications:", error);
    }
  };

  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <style>{`
        :root {
          --primary-50: #eff6ff;
          --primary-100: #dbeafe;
          --primary-500: #3b82f6;
          --primary-600: #2563eb;
          --primary-700: #1d4ed8;
        }
        .dark {
          --background: #0f172a;
          --foreground: #f1f5f9;
          --card: #1e293b;
          --card-foreground: #f1f5f9;
          --border: #334155;
        }
      `}</style>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800">
          <Sidebar className="border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <SidebarHeader className="border-b border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">CRM Enterprise</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Plateforme collaborative</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-4 flex flex-col justify-between"> {/* Added flex-col justify-between */}
              <div>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher..."
                      className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                    />
                  </div>
                </div>

                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-2">
                    Navigation
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {navigationItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={`mb-2 rounded-xl transition-all duration-200 ${
                              location.pathname === item.url
                                ? 'bg-blue-50 text-blue-700 shadow-sm border-blue-200 dark:bg-blue-900/20 dark:text-blue-300'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                              <item.icon className="w-5 h-5" />
                              <span className="font-medium">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                {isAdmin && (
                  <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-2 flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      Administration
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {adminNavigationItems.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              className={`mb-2 rounded-xl transition-all duration-200 ${
                                location.pathname === item.url
                                  ? 'bg-orange-50 text-orange-700 shadow-sm border-orange-200 dark:bg-orange-900/20 dark:text-orange-300'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                              }`}
                            >
                              <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                )}
              </div>

              <SidebarGroup> {/* Added new SidebarGroup for bottom navigation */}
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-2">
                  Système
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {bottomNavigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`mb-2 rounded-xl transition-all duration-200 ${
                            location.pathname === item.url
                              ? 'bg-blue-50 text-blue-700 shadow-sm border-blue-200 dark:bg-blue-900/20 dark:text-blue-300'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200 dark:border-slate-700 p-4">
              {/* Content moved to header or dropdown */}
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 px-6 py-3"> {/* Updated header styling and positioning */}
              <div className="flex items-center justify-between"> {/* Added justify-between */}
                <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-xl transition-colors duration-200 md:hidden" />
                <div className="flex-1"></div> {/* Spacer */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDarkMode}
                    className="rounded-xl"
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} {/* Icon size updated */}
                  </Button>

                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl"
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <Bell className="w-5 h-5" /> {/* Icon size updated */}
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0"> {/* Badge position updated */}
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </Button>

                    {showNotifications && (
                      <NotificationPanel
                        notifications={notifications}
                        onClose={() => setShowNotifications(false)}
                        onMarkAsRead={markNotificationAsRead}
                        onMarkAllAsRead={markAllAsRead}
                      />
                    )}
                  </div>

                  {user && (
                    <DropdownMenu> {/* Added DropdownMenu for user */}
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 p-1 pr-2 rounded-full">
                           <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-500 text-white text-sm">
                              {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('') : 'U'}
                            </AvatarFallback>
                          </Avatar>
                           <div className="hidden md:block text-left">
                            <p className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                              {user.full_name || 'Utilisateur'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                            </p>
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                           <Link to={createPageUrl("Settings")}><Settings className="w-4 h-4 mr-2" />Réglages</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                          <LogOut className="w-4 h-4 mr-2" />
                          Déconnexion
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
