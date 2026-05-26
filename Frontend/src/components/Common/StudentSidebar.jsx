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
import {
    BarChart,
    Bell,
    BookOpen,
    Calendar,
    Compass,
    Globe,
    HelpCircle,
    LayoutDashboard,
    LayoutDashboardIcon,
    ListTodo,
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
import { NotionLogoIcon } from "@radix-ui/react-icons";
import useAuth from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const StudentSidebar = ({ isExpanded, toggle }) => {
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
        return localStorage.getItem("studentActivePath") || location.pathname;
    });

    // Update localStorage when path changes
    useEffect(() => {
        localStorage.setItem("studentActivePath", location.pathname);
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
            label: "Home",
            icon: LayoutDashboard,
            path: "/student/dashboard",
        },
        {
            id: "explore",
            label: "Explore",
            icon: Compass,
            path: "explore",
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
            path: "/student/dashboard/attendance"
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
                {/* Sidebar Header */}
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
                                            backgroundColor:
                                                activeItem === item.id
                                                    ? "rgba(224, 231, 255, 1)"
                                                    : "rgba(224, 231, 255, 0)",
                                        }}
                                        onClick={() => setActiveItem(item.id)}
                                        className={cn(
                                            "flex items-center gap-3 w-full cursor-pointer p-3 rounded-lg text-zinc-700",
                                            activeItem === item.id
                                                ? "text-indigo-700 font-semibold"
                                                : "hover:bg-zinc-100",
                                            isExpanded
                                                ? "justify-start"
                                                : "justify-center",
                                        )}
                                    >
                                        <Link
                                            to={item.path}
                                            className="flex items-center gap-3 w-full"
                                        >
                                            <Icon className="w-5 h-5" />
                                            {isExpanded && (
                                                <motion.span
                                                    initial={{
                                                        opacity: 0,
                                                        x: -10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        x: -10,
                                                    }}
                                                    className="text-sm font-medium"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </Link>
                                    </motion.button>
                                </TooltipTrigger>
                                {!isExpanded && (
                                    <TooltipContent side="right">
                                        {item.label}
                                    </TooltipContent>
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
                                    src="https://i.pinimg.com/736x/b9/32/8e/b9328edcad29a71d3f420f8ca3732f1b.jpg"
                                    alt="Profile"
                                />
                                <AvatarFallback></AvatarFallback>
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
                                    ? (
                                        <Sun className="w-4 h-4 text-yellow-500" />
                                    )
                                    : 
                                    <Moon className="w-4 h-4 text-gray-500" />}
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

                    <Dialog
                        open={logoutDialogOpen}
                        onOpenChange={setLogoutDialogOpen}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Logout</DialogTitle>
                            </DialogHeader>
                            <p className="text-gray-600">
                                Are you sure you want to logout?
                            </p>
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

                {/* {Create Contents Like Notes, thought, remainder etc} */}

                <div>

                </div>
            </motion.aside>
        </TooltipProvider>
    );
};

export default StudentSidebar;
