import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import CalendarPicker from "@/components/ui/CalendarPicker";
import api from "@/services/api";

const AdminDashboard = () => {
  const [date, setDate] = useState(new Date());
  const [progress, setProgress] = useState(78);
  const [dashboardStats, setDashboardStats] = useState({
    teacherCount: 0,
    studentCount: 0,
    assignmentCount: 0,
    resourceCount: 0,
    storageUsed: 0
  });
  const [recentTeachers, setRecentTeachers] = useState([
    { id: 1, name: "Rahul Sharma", subject: "Mathematics", status: "Active", classes: "Class 10, 11" },
    { id: 2, name: "Priya Patel", subject: "Science", status: "Active", classes: "Class 9, 10" },
    { id: 3, name: "Amit Kumar", subject: "English", status: "Active", classes: "Class 8, 9" },
    { id: 4, name: "Sneha Gupta", subject: "History", status: "Active", classes: "Class 7, 8" },
    { id: 5, name: "Vikram Singh", subject: "Computer Science", status: "Active", classes: "Class 11, 12" }
  ]);
  const [studentAdmissions, setStudentAdmissions] = useState({ weeklyCount: 0, progress: 0 });
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Annual Sports Day Registration Open", date: "2024-04-16", content: "Register for the upcoming sports events by April 25th" },
    { id: 2, title: "Parent-Teacher Meeting Schedule", date: "2024-04-15", content: "PTM scheduled for April 20th, 10 AM to 2 PM" },
    { id: 3, title: "Summer Vacation Notice", date: "2024-04-14", content: "School will remain closed from May 15th to June 15th" },
    { id: 4, title: "New Library Books Arrived", date: "2024-04-13", content: "Check out the new collection of books in the library" },
    { id: 5, title: "Science Fair 2024", date: "2024-04-12", content: "Submit your project proposals by April 30th" }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const statsRes = await api.get('/api/admin/dashboard/stats');
        setDashboardStats(statsRes.data);
        
        const teachersRes = await api.get('/api/admin/teachers/recent');
        setRecentTeachers(teachersRes.data);
        
        const admissionsRes = await api.get('/api/admin/students/admissions');
        setStudentAdmissions(admissionsRes.data);
        
        const announcementsRes = await api.get('/api/admin/announcements');
        setAnnouncements(announcementsRes.data);
        
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncements(prev => {
        if (!prev || prev.length <= 1) return prev;
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const systemStats = [
    { 
      title: "Total Teachers", 
      value: recentTeachers.length.toString(), 
      progress: Math.min((recentTeachers.length / 20) * 100, 100),
      description: `${recentTeachers.filter(t => t.status === "Active").length} Active Teachers`
    },
    { 
      title: "Active Students", 
      value: "245", 
      progress: 78,
      description: "45 New Students This Week"
    },
    { 
      title: "Total Assignments", 
      value: "156", 
      progress: 45,
      description: "32 Pending Submissions"
    },
    { 
      title: "Resources", 
      value: "2.5GB", 
      progress: 65,
      description: "1.2GB Storage Available"
    }
  ];

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="grid grid-cols-5 gap-4 p-6">
        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Add New Teacher
              </Button>
              <Button variant="outline" className="w-full">
                Create Announcement
              </Button>
              <Button variant="outline" className="w-full">
                Schedule Event
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarPicker />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {systemStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardDescription className="text-sm font-medium">{stat.title}</CardDescription>
                  <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Progress value={stat.progress} className="h-2 w-[80%]" />
                    <span className="text-xs font-medium">{stat.progress}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="teachers" className="space-y-4">
            <TabsList>
              <TabsTrigger value="teachers">Recent Teachers</TabsTrigger>
              <TabsTrigger value="students">Student Admissions</TabsTrigger>
              <TabsTrigger value="system">System Health</TabsTrigger>
            </TabsList>

            <TabsContent value="teachers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recently Added Staff</CardTitle>
                  <CardDescription>
                    Last 3 teachers added to the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Classes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTeachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell>{teacher.name}</TableCell>
                          <TableCell>{teacher.subject}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded ${
                                teacher.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {teacher.status}
                            </span>
                          </TableCell>
                          <TableCell>{teacher.classes}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost">•••</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Student Admissions</CardTitle>
                  <CardDescription>
                    Recent student registrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            New Student Signups
                          </p>
                          <p className="text-sm text-muted-foreground">
                            45 students this week
                          </p>
                        </div>
                      </div>
                      <Progress value={65} className="w-[40%]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Important Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {announcements.map((announcement) => (
                    <CarouselItem key={announcement.id}>
                      <div className="p-6 border rounded-lg bg-background">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {announcement.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {announcement.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Published: {announcement.date}
                            </p>
                          </div>
                          <Button variant="outline">View Details</Button>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Broadcast</CardTitle>
              <CardDescription>
                Send immediate announcement to all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="message">Broadcast Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your announcement..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex gap-4">
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="teachers">Teachers Only</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit">Send Broadcast</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default AdminDashboard;
