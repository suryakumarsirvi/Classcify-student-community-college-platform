import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bell,
  BookOpen,
  Calendar,
  Compass,
  Globe,
  HelpCircle,
  LayoutDashboard,
  LogOutIcon,
  Menu,
  MessageSquare,
  Moon,
  PanelLeft,
  Settings,
  Sun,
  Users,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link, useLocation } from "react-router-dom";
import useAuth from "@/contexts/AuthContext.jsx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminSidebar = ({ isExpanded, toggle }) => {
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });

  // Get active path from localStorage or current location
  const [activePath, setActivePath] = useState(() => {
    return localStorage.getItem("adminActivePath") || location.pathname;
  });

  // Update localStorage when path changes
  useEffect(() => {
    localStorage.setItem("adminActivePath", location.pathname);
    setActivePath(location.pathname);
  }, [location.pathname]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUser(profileData);
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart,
      path: "/admin/dashboard/analytics",
    },
    {
      id: "explore",
      label: "Explore",
      icon: Compass,
      path: "explore",
    },
    {
      id: "staffroom",
      label: "Staffroom",
      icon: Users,
      path: "/admin/dashboard/staffroom",
    },
    {
      id: "classroom",
      label: "Classroom",
      icon: BookOpen,
      path: "/admin/dashboard/classroom",
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      path: "/admin/dashboard/messages",
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/";
  };

  return (
    <TooltipProvider className="relative">
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? 260 : 65 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-screen bg-white border-r shadow-md flex flex-col z-50"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          {isExpanded && (
            <motion.span className="text-lg font-semibold">
              Admin Panel
            </motion.span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="rounded-lg hover:bg-zinc-100"
          >
            {isExpanded
              ? <X className="w-5 h-5" />
              : <PanelLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Sidebar Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-300">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <motion.button
                    initial={false}
                    animate={{
                      backgroundColor: activeItem === item.id
                        ? "rgba(224, 231, 255, 1)"
                        : "rgba(224, 231, 255, 0)",
                    }}
                    onClick={() => setActiveItem(item.id)}
                    className={cn(
                      "flex items-center gap-3 w-full cursor-pointer p-3 rounded-lg text-zinc-700",
                      activeItem === item.id
                        ? "text-indigo-700 font-semibold"
                        : "hover:bg-zinc-100",
                      isExpanded ? "justify-start" : "justify-center",
                    )}
                  >
                    <Link
                      to={item.path}
                      className="flex items-center gap-3 w-full"
                    >
                      <Icon className="w-5 h-5" />
                      {isExpanded && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-sm font-medium"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </Link>
                  </motion.button>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>
        <div className="flex justify-end items-center p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage
                  src={user?.avatar}
                  alt="Profile"
                />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="absolute bottom-0 left-5 w-56 shadow-lg"
            >
              <DropdownMenuItem className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                Manage Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3">
                <Globe className="w-4 h-4" />
                Language
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-3"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode
                  ? <Sun className="w-4 h-4 text-yellow-500" />
                  : <Moon className="w-4 h-4 text-gray-500" />}
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-3 text-red-700 hover:bg-red-900 cursor-pointer"
                onClick={() => setLogoutDialogOpen(true)}
              >
                <LogOutIcon className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Logout</DialogTitle>
              </DialogHeader>
              <p className="text-gray-600">Are you sure you want to logout?</p>
              <DialogFooter className="flex justify-end">
                <Button
                  className="cursor-pointer"
                  variant="ghost"
                  onClick={() => setLogoutDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="hover:bg-red-700 bg-red-500 cursor-pointer"
                  variant="destructive"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.aside>

      {/* Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback>{profileData.name?.[0]}</AvatarFallback>
                </Avatar>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProfileData(prev => ({
                          ...prev,
                          avatar: reader.result
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData(prev => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData(prev => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsProfileOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default AdminSidebar;
