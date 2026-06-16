import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
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
import { NavLink } from "react-router";
import {
  BookOpen,
  Compass,
  Globe,
  HelpCircle,
  LayoutDashboard,
  LayoutDashboardIcon,
  ListTodo,
  LogOutIcon,
  MessageSquare,
  Moon,
  PanelLeft,
  Plus,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { NotionLogoIcon } from "@radix-ui/react-icons";
import useAuth from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useSocket from "@/hooks/useSocket";
import { MessageAPI } from "@/api/message.api";
import api from "@/api/axios";

const StudentSidebar = ({ isExpanded, toggle }) => {
  const { user, updateUser } = useAuth();
  const socket = useSocket();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || `${user.personal?.firstName || ""} ${user.personal?.lastName || ""}`.trim(),
        email: user.personal?.email || user.email || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    const fetchCounts = async () => {
      try {
        const invitations = await MessageAPI.getInvitations();
        let joinRequests = [];
        try {
          const res = await api.get('/api/messages/communities/join-requests');
          joinRequests = res.data || [];
        } catch (e) {
          console.error("Failed to load join requests in sidebar:", e);
        }
        
        const inviteCount = Array.isArray(invitations) ? invitations.length : 0;
        const requestCount = Array.isArray(joinRequests) ? joinRequests.length : 0;
        setNotificationCount(inviteCount + requestCount);
      } catch (error) {
        console.error("Failed to fetch notification counts for sidebar:", error);
      }
    };

    fetchCounts();
  }, [user?._id]);

  useEffect(() => {
    if (!socket) return;

    const handleInvitation = (invitation) => {
      console.log("📩 Sidebar received invitation:", invitation);
      setNotificationCount(prev => prev + 1);
      toast.success(`You have been invited to join ${invitation.community?.name || 'a community'}!`, {
        duration: 5000,
        position: "top-right",
      });
    };

    const handleJoinRequest = (request) => {
      console.log("📩 Sidebar received join request:", request);
      setNotificationCount(prev => prev + 1);
      toast.success(`New join request received for ${request.communityName || 'your community'}!`, {
        duration: 5000,
        position: "top-right",
      });
    };

    socket.on("new-invitation", handleInvitation);
    socket.on("join-request-received", handleJoinRequest);

    return () => {
      socket.off("new-invitation", handleInvitation);
      socket.off("join-request-received", handleJoinRequest);
    };
  }, [socket]);

  useEffect(() => {
    const handleClear = () => {
      setNotificationCount(0);
    };
    window.addEventListener('clear-notifications-badge', handleClear);
    return () => window.removeEventListener('clear-notifications-badge', handleClear);
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUser(profileData);
      setIsProfileOpen(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Home",
      icon: LayoutDashboard,
      path: "/student/dashboard",
    },
    {
      id: "explore",
      label: "Explore",
      icon: Compass,
      path: "/student/dashboard/explore",
    },
    {
      id: "classroom",
      label: "Classroom",
      icon: BookOpen,
      path: "/student/dashboard/classroom",
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: ListTodo,
      path: "/student/dashboard/attendance",
    },
    {
      id: "community",
      label: "Communities",
      icon: Globe,
      path: "/student/dashboard/community",
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      path: "/student/dashboard/messages",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: NotionLogoIcon,
      path: "/student/dashboard/notifications",
    },
    {
      id: "assets",
      label: "Assets",
      icon: LayoutDashboardIcon,
      path: "/student/dashboard/assets",
    },
    {
      id: "create",
      label: "Create Space",
      icon: Plus,
      path: "/student/dashboard/create",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
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
        <div className="flex items-center justify-between px-4 py-3 border-b">
          {isExpanded && (
            <motion.span className="text-lg font-semibold">
              Students Panel
            </motion.span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="rounded-lg hover:bg-zinc-100 cursor-pointer"
          >
            {isExpanded
              ? <X className="w-5 h-5" />
              : <PanelLeft className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-300">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    end={item.id === "dashboard"}
                    className="block w-full"
                  >
                    {({ isActive }) => (
                      <motion.div
                        initial={false}
                        animate={{
                          backgroundColor: isActive
                            ? "rgba(224, 231, 255, 1)"
                            : "rgba(224, 231, 255, 0)",
                        }}
                        className={cn(
                          "relative flex items-center gap-3 w-full cursor-pointer p-3 rounded-lg text-zinc-700 transition-colors",
                          isActive
                            ? "text-indigo-700 font-semibold"
                            : "hover:bg-zinc-100",
                          isExpanded ? "justify-start" : "justify-center"
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {isExpanded && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-sm font-medium whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                        {item.id === "notifications" && notificationCount > 0 && (
                          <span className={cn(
                            "absolute flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm",
                            isExpanded 
                              ? "right-3 h-5 min-w-[20px] px-1.5" 
                              : "top-1 right-1 h-4 w-4"
                          )}>
                            {notificationCount}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </NavLink>
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
                {user?.avatar || profileData.avatar ? (
                  <AvatarImage
                    src={user?.avatar || profileData.avatar}
                    alt="Profile"
                  />
                ) : (
                  <AvatarFallback className="bg-indigo-600 text-white font-semibold">
                    {user?.personal?.firstName?.[0]?.toUpperCase() || "S"}
                  </AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="absolute bottom-0 left-5 w-56 shadow-lg"
            >
              <DropdownMenuItem className="flex items-center gap-3" onClick={() => setIsProfileOpen(true)}>
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
        <div></div>
      </motion.aside>

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
                  {profileData.avatar ? (
                    <AvatarImage src={profileData.avatar} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-indigo-600 text-white font-semibold text-xl">
                      {profileData.name?.[0]?.toUpperCase() || "S"}
                    </AvatarFallback>
                  )}
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

export default StudentSidebar;
