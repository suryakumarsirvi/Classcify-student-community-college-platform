import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";
import teacherApi from "@/api/teacher.api";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    pendingAssignments: 0,
    upcomingClasses: 0,
  });
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        coursesRes,
        assignmentsRes,
        timetableRes,
        studentsRes,
      ] = await Promise.all([
        teacherApi.getTeacherCourses(),
        teacherApi.getAssignments(),
        teacherApi.getTimetable(),
        teacherApi.getClassroomStudents(),
      ]);

      // Process courses
      setCourses(coursesRes.courses || []);
      
      // Process assignments
      const assignmentsData = assignmentsRes.assignments || [];
      setAssignments(assignmentsData);
      
      // Process timetable
      setTimetable(timetableRes || []);

      // Calculate stats
      setStats({
        totalStudents: studentsRes?.students?.length || 0,
        activeCourses: coursesRes.courses?.length || 0,
        pendingAssignments: assignmentsData.filter(a => !a.submitted).length,
        upcomingClasses: timetableRes?.filter(t => new Date(t.startTime) > new Date()).length || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Active Courses",
      value: stats.activeCourses,
      icon: BookOpen,
      color: "text-green-500",
    },
    {
      title: "Pending Assignments",
      value: stats.pendingAssignments,
      icon: FileText,
      color: "text-yellow-500",
    },
    {
      title: "Upcoming Classes",
      value: stats.upcomingClasses,
      icon: Clock,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-muted/40">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">
              Here's what's happening in your classroom today
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/teacher/dashboard/classroom")}>
              <BookOpen className="mr-2 h-4 w-4" />
              Classroom
            </Button>
            <Button variant="outline" onClick={() => navigate("/teacher/dashboard/messages")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Classes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Classes</CardTitle>
              <CardDescription>
                Your next scheduled classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timetable.slice(0, 5).map((classItem) => (
                      <TableRow key={classItem._id}>
                        <TableCell>{classItem.course}</TableCell>
                        <TableCell>
                          {format(new Date(classItem.startTime), "PPp")}
                        </TableCell>
                        <TableCell>{classItem.duration} mins</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              new Date(classItem.startTime) > new Date()
                                ? "default"
                                : "secondary"
                            }
                          >
                            {new Date(classItem.startTime) > new Date()
                              ? "Upcoming"
                              : "Completed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Assignments</CardTitle>
              <CardDescription>
                Latest assignments and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {assignments.slice(0, 5).map((assignment) => (
                    <div key={assignment._id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{assignment.title}</span>
                        <Badge variant="outline">
                          {assignment.submitted ? "Submitted" : "Pending"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Due: {format(new Date(assignment.dueDate), "PP")}
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Course Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Course Overview</CardTitle>
            <CardDescription>
              Distribution of students across your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courses.map(course => ({
                  name: course.name,
                  students: course.students?.length || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;