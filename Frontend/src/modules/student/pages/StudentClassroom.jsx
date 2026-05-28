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
import studentService from "@/modules/student/services/student.service";
import api from "@/services/api";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("timetable");
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [resources, setResources] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [timetableData, setTimetableData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

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

  const fetchClassroomData = async () => {
    try {
      setLoading(true);
      const profile = await studentService.getProfile();
      const student = profile.data;
      setStudentData(student);
      setUserProfile(student);

      const [assignmentsRes, announcementsRes, attendanceRes, resourcesRes, timetableRes] = await Promise.allSettled([
        studentService.getAssignments(),
        studentService.getAnnouncements(),
        studentService.getMyAttendance(student?.academic?.course, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], new Date().toISOString().split('T')[0]),
        studentService.getResources(),
        studentService.getTimetable()
      ]);

      if (assignmentsRes.status === "fulfilled") {
        setAssignments(assignmentsRes.value?.data?.assignments || assignmentsRes.value?.assignments || []);
      }
      if (announcementsRes.status === "fulfilled") {
        setAnnouncements(announcementsRes.value?.data?.announcements || announcementsRes.value?.announcements || []);
      }
      if (attendanceRes.status === "fulfilled") {
        const data = attendanceRes.value?.data || attendanceRes.value;
        setAttendanceStats(data?.stats || null);
      }
      if (resourcesRes.status === "fulfilled") {
        setResources(resourcesRes.value?.data?.resources || resourcesRes.value?.resources || []);
      }
      if (timetableRes.status === "fulfilled") {
        setTimetableData(timetableRes.value?.data || timetableRes.value || []);
      }

      // Also get detailed attendance overview stats
      try {
        const detailRes = await api.get("/api/attendance/mystats");
        if (detailRes?.data) {
          setAttendanceData(detailRes.data.detailedRecords || []);
          if (!attendanceStats) {
            setAttendanceStats(detailRes.data.overallStats || null);
          }
        }
      } catch (err) {
        console.error("Detailed attendance stats fetch failed:", err);
      }

      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load classroom data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassroomData();
  }, []);

  const handleRefresh = async () => {
    await fetchClassroomData();
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
                {resources.length > 0 ? (
                  resources.map((resource, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            {resource.fileName}
                          </div>
                          <Badge variant="outline">Document</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Classroom: {resource.classroom}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Uploaded: {format(new Date(resource.uploadDate || resource.createdAt || Date.now()), "PPP")}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => handleDownload(resource.fileUrl)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No study materials uploaded by your teacher yet.</p>
                )}
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
              {resources.length > 0 ? (
                resources.map((resource, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {resource.fileName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Classroom course material for {resource.classroom}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => handleDownload(resource.fileUrl)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download File
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No files uploaded yet.</p>
              )}
            </div>
          )
        });
        break;
      case 'profile':
        setPopupContent({
          title: "My Profile",
          content: (
            <div className="space-y-6">
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

  const handleDownload = (fileUrl) => {
    if (!fileUrl || fileUrl === "#") {
      toast.error("File is not available");
      return;
    }
    toast.success("Opening file in new tab...");
    window.open(fileUrl, "_blank");
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <StudentIDCard studentData={studentData} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5" />
                    Upcoming Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    {assignments.length > 0 ? (
                      assignments.map((assignment) => {
                        const isOverdue = new Date(assignment.dueDate) < new Date();
                        return (
                          <div
                            key={assignment._id}
                            className="p-4 border rounded-lg mb-2 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                                <p className="text-xs text-muted-foreground">
                                  Course: {assignment.course}
                                </p>
                              </div>
                              <Badge
                                variant={isOverdue ? "destructive" : "warning"}
                              >
                                {isOverdue ? "Overdue" : "Pending"}
                              </Badge>
                            </div>
                            <div className="mt-2 flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">
                                Due: {format(new Date(assignment.dueDate), "PPP")}
                              </span>
                            </div>
                            {assignment.description && (
                              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                {assignment.description}
                              </p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-muted-foreground text-sm py-8">No pending assignments</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
 
            <div className="lg:col-span-2 space-y-6">
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
                        <TableHead>Room / Status</TableHead>
                        <TableHead>Teacher</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timetableData.length > 0 ? (
                        timetableData.map((lecture, index) => {
                          const start = lecture.startTime ? format(new Date(lecture.startTime), "hh:mm a") : "N/A";
                          const end = lecture.endTime ? format(new Date(lecture.endTime), "hh:mm a") : "N/A";
                          const teacherName = lecture.teacher 
                            ? `${lecture.teacher.personal?.firstName || ""} ${lecture.teacher.personal?.lastName || ""}`.trim()
                            : "Unknown Teacher";
                          return (
                            <TableRow key={lecture._id || index} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{start} - {end}</TableCell>
                              <TableCell className="font-semibold text-indigo-700">{lecture.subject}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  <MapPin className="mr-1 h-3 w-3 inline" />
                                  Online Room
                                </Badge>
                              </TableCell>
                              <TableCell>{teacherName || "N/A"}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No classes scheduled for today
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
 
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
                          {attendanceStats?.percentage || 0}%
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-green-700">Present</p>
                          <p className="text-lg font-bold text-green-600">
                            {attendanceStats?.present || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-red-700">Absent</p>
                          <p className="text-lg font-bold text-red-600">
                            {attendanceStats?.absent || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-yellow-700">Late</p>
                          <p className="text-lg font-bold text-yellow-600">
                            {attendanceStats?.late || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Progress value={attendanceStats?.percentage || 0} />
                  </div>
                </CardContent>
              </Card>
            </div>
 
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
                    {announcements.length > 0 ? (
                      announcements.map((announcement) => (
                        <div
                          key={announcement._id}
                          className="p-4 border rounded-lg mb-2 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                            <Badge variant="outline">General</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {announcement.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(announcement.createdAt || announcement.date || Date.now()), "PPP")}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground text-sm py-8">No announcements posted</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

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
