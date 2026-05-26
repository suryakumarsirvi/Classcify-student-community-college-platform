import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Bell,
  CalendarCheck,
  Clock,
  Download,
  LibraryBig,
  MapPin,
  Printer,
  RefreshCw,
  User,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  X,
  CalendarPlus,
  Heart,
  Camera,
  Pencil,
} from "lucide-react";
import studentApi from "@/api/student.api";
import { TailSpin } from "react-loader-spinner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import StudentIDCard from "@/components/Common/StudentIDCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const StudentClassroom = () => {
  const [studentData, setStudentData] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("timetable");
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [academicCalendar, setAcademicCalendar] = useState([]);
  const [resources, setResources] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [timetableData, setTimetableData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    studyMaterials: false,
    timetable: false,
    attendance: false,
    profile: false
  });

  // Dummy data for study materials
  const studyMaterialsData = [
    {
      id: 1,
      subject: "Mathematics",
      description: "Calculus and Differential Equations Notes",
      type: "Lecture Notes",
      uploadDate: "2024-04-15",
      fileUrl: "#",
      isFavorite: false
    },
    {
      id: 2,
      subject: "Physics",
      description: "Quantum Mechanics Lab Manual",
      type: "Lab Manual",
      uploadDate: "2024-04-14",
      fileUrl: "#",
      isFavorite: true
    },
    {
      id: 3,
      subject: "Computer Science",
      description: "Data Structures and Algorithms Practice Problems",
      type: "Practice Set",
      uploadDate: "2024-04-13",
      fileUrl: "#",
      isFavorite: false
    },
    {
      id: 4,
      subject: "Chemistry",
      description: "Organic Chemistry Reference Book",
      type: "Reference Book",
      uploadDate: "2024-04-12",
      fileUrl: "#",
      isFavorite: true
    }
  ];

  // Dummy data for academic calendar
  const academicCalendarData = [
    {
      id: 1,
      title: "Mid-Term Examinations",
      date: "2024-05-15",
      time: "09:00 AM",
      venue: "Main Hall",
      type: "exam",
      description: "All subjects mid-term examinations will be conducted"
    },
    {
      id: 2,
      title: "Project Submission Deadline",
      date: "2024-05-20",
      time: "05:00 PM",
      venue: "Department Office",
      type: "deadline",
      description: "Final year project submission deadline"
    },
    {
      id: 3,
      title: "Sports Day",
      date: "2024-05-25",
      time: "08:00 AM",
      venue: "Sports Complex",
      type: "event",
      description: "Annual sports day competition"
    }
  ];

  // Dummy data for resources
  const resourcesData = [
    {
      id: 1,
      title: "Course Syllabus",
      description: "Complete course syllabus for current semester",
      type: "Syllabus",
      fileUrl: "#"
    },
    {
      id: 2,
      title: "Lab Manuals",
      description: "All lab experiments and procedures",
      type: "Manual",
      fileUrl: "#"
    },
    {
      id: 3,
      title: "Previous Year Papers",
      description: "Last 5 years question papers with solutions",
      type: "Question Bank",
      fileUrl: "#"
    }
  ];

  // Dummy data for timetable
  const dummyTimetable = [
    {
      day: "Monday",
      classes: [
        { time: "09:00", subject: "Mathematics", room: "A101", teacher: "Dr. Smith" },
        { time: "10:30", subject: "Physics", room: "B203", teacher: "Prof. Johnson" },
        { time: "12:00", subject: "Computer Science", room: "C305", teacher: "Dr. Williams" }
      ]
    },
    {
      day: "Tuesday",
      classes: [
        { time: "09:00", subject: "Chemistry", room: "D401", teacher: "Dr. Brown" },
        { time: "10:30", subject: "English", room: "A102", teacher: "Prof. Davis" },
        { time: "12:00", subject: "Mathematics", room: "B204", teacher: "Dr. Smith" }
      ]
    }
  ];

  // Dummy data for attendance
  const dummyAttendance = {
    stats: {
      totalClasses: 30,
      present: 25,
      absent: 3,
      late: 2,
      percentage: 83.33
    },
    recent: [
      { date: "2024-04-15", status: "Present", subject: "Mathematics" },
      { date: "2024-04-14", status: "Late", subject: "Physics" },
      { date: "2024-04-13", status: "Present", subject: "Computer Science" }
    ]
  };

  // Dummy data for assignments
  const dummyAssignments = [
    {
      id: 1,
      subject: "Mathematics",
      title: "Calculus Assignment",
      dueDate: "2024-04-20",
      description: "Solve problems from chapter 5",
      status: "Pending",
      marks: 20
    },
    {
      id: 2,
      subject: "Physics",
      title: "Lab Report",
      dueDate: "2024-04-18",
      description: "Submit quantum mechanics lab observations",
      status: "Overdue",
      marks: 15
    },
    {
      id: 3,
      subject: "Computer Science",
      title: "Programming Project",
      dueDate: "2024-04-25",
      description: "Implement sorting algorithms",
      status: "Upcoming",
      marks: 30
    }
  ];

  // Dummy data for announcements
  const dummyAnnouncements = [
    {
      id: 1,
      title: "Holiday Announcement",
      content: "College will remain closed on 15th April for local festival",
      date: "2024-04-10",
      type: "General"
    },
    {
      id: 2,
      title: "Exam Schedule",
      content: "Mid-term examinations will start from 15th May",
      date: "2024-04-09",
      type: "Academic"
    },
    {
      id: 3,
      title: "Sports Day",
      content: "Annual sports day will be held on 25th May",
      date: "2024-04-08",
      type: "Event"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profile, assignments, announcements, attendance] = await Promise.all([
            studentApi.getProfile(),
          studentApi.getAssignments(),
          studentApi.getAnnouncements(),
          studentApi.getMyAttendance(studentData?.academic?.course, new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0])
          ]);

        setStudentData(profile.data);
        setUserProfile(profile.data);
        setAssignments(assignments?.data?.assignments || []);
        setAnnouncements(announcements?.data?.announcements || []);
        setAttendanceStats(attendance?.data?.stats || null);

        console.log("✅ Profile Data Loaded:", profile.data);
        console.log("✅ Assignments Loaded:", assignments.data);
        console.log("✅ Announcements Loaded:", announcements.data);
        console.log("✅ Attendance Stats Loaded:", attendance.data);
      } catch (err) {
        console.error("❌ Failed to load classroom data:", err);
        setError(err.message || "Failed to load classroom data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const [assignments, announcements, attendance] = await Promise.all([
        studentApi.getAssignments(),
        studentApi.getAnnouncements(),
        studentApi.getMyAttendance(studentData?.academic?.course, new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0])
      ]);

      setAssignments(assignments?.data?.assignments || []);
      setAnnouncements(announcements?.data?.announcements || []);
      setAttendanceStats(attendance?.data?.stats || null);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const timeDiff = due - now;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return { status: "Overdue", variant: "destructive" };
    if (daysDiff <= 3) return { status: "Urgent", variant: "destructive" };
    if (daysDiff <= 7) return { status: "Pending", variant: "warning" };
    return { status: "Upcoming", variant: "secondary" };
  };

  const handleButtonClick = (section) => {
    switch (section) {
      case 'study-materials':
        setPopupContent({
          title: "Study Materials",
          content: (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Materials</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                {studyMaterialsData.map((material, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {material.subject}
                        </div>
                        <Badge variant="outline">{material.type}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{material.description}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Uploaded: {format(new Date(material.uploadDate), "PPP")}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => handleDownload(material.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          )
        });
        break;
      case 'academic-calendar':
        setPopupContent({
          title: "Academic Calendar",
          content: (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Upcoming Events</h3>
                <Button variant="outline" size="sm">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>
              </div>
              {academicCalendarData.map((event, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {event.title}
                      </div>
                      <Badge variant={event.type === 'exam' ? 'destructive' : 'default'}>
                        {event.type}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(event.date), "PPP")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{event.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Time: {event.time}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Venue: {event.venue}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        });
        break;
      case 'resources':
        setPopupContent({
          title: "Resources",
          content: (
            <div className="space-y-4">
              {resourcesData.map((resource, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {resource.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )
        });
        break;
      case 'profile':
        setPopupContent({
          title: "My Profile",
          content: (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userProfile?.personal?.profilePicture} />
                    <AvatarFallback>
                      {userProfile?.personal?.firstName?.[0]}{userProfile?.personal?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 h-6 w-6 rounded-full"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {userProfile?.personal?.firstName} {userProfile?.personal?.lastName}
                  </h2>
                  <p className="text-muted-foreground">{userProfile?.academic?.rollNumber}</p>
                </div>
              </div>

              {/* Academic Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Attendance</span>
                      <span>{attendanceData?.stats?.percentage || 0}%</span>
                    </div>
                    <Progress value={attendanceData?.stats?.percentage || 0} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CGPA</span>
                      <span>{userProfile?.academic?.cgpa || 'N/A'}</span>
                    </div>
                    <Progress value={(userProfile?.academic?.cgpa || 0) * 25} />
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </div>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{userProfile?.personal?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{userProfile?.personal?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(userProfile?.personal?.dob), "PPP")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{userProfile?.personal?.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Academic Information
                    </div>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Course</p>
                      <p className="text-sm text-muted-foreground">{userProfile?.academic?.course}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Roll Number</p>
                      <p className="text-sm text-muted-foreground">{userProfile?.academic?.rollNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Semester</p>
                      <p className="text-sm text-muted-foreground">{userProfile?.academic?.semester}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Batch</p>
                      <p className="text-sm text-muted-foreground">{userProfile?.academic?.batch}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        });
        break;
    }
    setShowPopup(true);
  };

  const renderStudyMaterials = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Study Materials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {studyMaterials.map((material, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {material.subject}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{material.description}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAcademicCalendar = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Academic Calendar</h2>
      <div className="space-y-4">
        {academicCalendar.map((event, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {event.title}
              </CardTitle>
              <CardDescription>
                {format(new Date(event.date), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{event.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {resource.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>
        ))}
                  </div>
                </div>
  );

  const renderProfile = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Profile</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Course</p>
              <p className="text-sm text-muted-foreground">{studentData?.academic?.course}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Roll Number</p>
              <p className="text-sm text-muted-foreground">{studentData?.academic?.rollNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Semester</p>
              <p className="text-sm text-muted-foreground">{studentData?.academic?.semester}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Batch</p>
              <p className="text-sm text-muted-foreground">{studentData?.academic?.batch}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Fetch timetable data
  const fetchTimetable = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, timetable: true }));
      const response = await studentApi.getTimetable();
      setTimetableData(response.data);
      toast.success("Timetable loaded successfully");
    } catch (error) {
      toast.error("Failed to load timetable");
    } finally {
      setLoadingStates(prev => ({ ...prev, timetable: false }));
    }
  };

  // Fetch attendance data
  const fetchAttendance = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, attendance: true }));
      const response = await studentApi.getMyAttendance(
        studentData?.academic?.course,
        new Date().toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );
      setAttendanceData(response.data);
      toast.success("Attendance data loaded successfully");
    } catch (error) {
      toast.error("Failed to load attendance data");
    } finally {
      setLoadingStates(prev => ({ ...prev, attendance: false }));
    }
  };

  // Handle download for study materials
  const handleDownload = async (materialId) => {
    try {
      toast.loading("Downloading...");
      // Add download logic here
      toast.success("Download completed");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <TailSpin color="#3B82F6" height={80} width={80} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="text-red-600">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Error Loading Classroom Data</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Your Classroom, {studentData?.personal?.firstName || "Student"}!
            </h1>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
            </div>
          </div>

          {/* Quick Access Toolbar */}
          <div className="grid grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center hover:bg-blue-50 transition-colors"
              onClick={() => handleButtonClick('study-materials')}
            >
              <LibraryBig className="h-6 w-6 mb-2 text-blue-600" />
              Study Materials
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center hover:bg-green-50 transition-colors"
              onClick={() => handleButtonClick('academic-calendar')}
            >
              <CalendarCheck className="h-6 w-6 mb-2 text-green-600" />
              Academic Calendar
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center hover:bg-purple-50 transition-colors"
              onClick={() => handleButtonClick('resources')}
            >
              <Download className="h-6 w-6 mb-2 text-purple-600" />
              Resources
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center hover:bg-orange-50 transition-colors"
              onClick={() => handleButtonClick('profile')}
            >
              <User className="h-6 w-6 mb-2 text-orange-600" />
              My Profile
            </Button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - ID Card and Assignments */}
            <div className="space-y-6">
              <StudentIDCard studentData={studentData} />
              
              {/* Upcoming Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5" />
                    Upcoming Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    {dummyAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-4 border rounded-lg mb-2 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{assignment.title}</h3>
                            <p className="text-sm text-muted-foreground">
                                      {assignment.subject}
                            </p>
                                  </div>
                                  <Badge
                            variant={
                              assignment.status === "Overdue"
                                      ? "destructive"
                                : assignment.status === "Pending"
                                ? "warning"
                                : "default"
                            }
                                  >
                                    {assignment.status}
                                  </Badge>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            Due: {format(new Date(assignment.dueDate), "PPP")}
                          </span>
                          <span className="font-medium">
                            Marks: {assignment.marks}
                          </span>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Timetable and Attendance */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Today's Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Teacher</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dummyTimetable[0].classes.map((lecture, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell>{lecture.time}</TableCell>
                          <TableCell>{lecture.subject}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              <MapPin className="mr-1 h-3 w-3" />
                              {lecture.room}
                            </Badge>
                          </TableCell>
                          <TableCell>{lecture.teacher}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Attendance Overview */}
                <Card>
                  <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Attendance Overview
                  </CardTitle>
                  </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Overall Attendance</p>
                        <p className="text-2xl font-bold">
                          {dummyAttendance.stats.percentage}%
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">Present</p>
                          <p className="text-lg font-bold text-green-600">
                            {dummyAttendance.stats.present}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Absent</p>
                          <p className="text-lg font-bold text-red-600">
                            {dummyAttendance.stats.absent}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Late</p>
                          <p className="text-lg font-bold text-yellow-600">
                            {dummyAttendance.stats.late}
                          </p>
                        </div>
                    </div>
                    </div>
                    <Progress value={dummyAttendance.stats.percentage} />
                    </div>
                  </CardContent>
                </Card>
            </div>

            {/* Right Column - Announcements */}    
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {dummyAnnouncements.map((announcement) => (
                        <div
                        key={announcement.id}
                        className="p-4 border rounded-lg mb-2 hover:shadow-md transition-shadow"
                        >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{announcement.title}</h3>
                          <Badge variant="outline">{announcement.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(announcement.date), "PPP")}
                        </p>
                        </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Popup Dialog */}
          <Dialog open={showPopup} onOpenChange={setShowPopup}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{popupContent?.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPopup(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              {popupContent?.content}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default StudentClassroom;
