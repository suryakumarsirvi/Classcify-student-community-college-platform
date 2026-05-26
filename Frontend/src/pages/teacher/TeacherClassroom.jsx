import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  AlertCircle,
  BellPlus,
  BookOpen,
  Calendar,
  Clock,
  Edit,
  FileText,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import teacherApi from "@/api/teacher.api";
import { TailSpin } from "react-loader-spinner";
import { format } from "date-fns";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";

const TeacherClassroom = () => {
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { register, handleSubmit, reset, setValue, control } = useForm();
  const [teacherProfile, setTeacherProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          coursesRes,
          timetableRes,
          assignmentsRes,
          announcementsRes,
        ] = await Promise.allSettled([
          teacherApi.getTeacherCourses(),
          teacherApi.getTimetable(),
          teacherApi.getAssignments(),
          teacherApi.getAnnouncements(),
        ]);
  
        console.log("📌 Raw API Responses:", {
          coursesRes,
          timetableRes,
          assignmentsRes,
          announcementsRes,
        });
  
        // Handle Courses
        if (coursesRes.status === "rejected") {
          console.error("❌ Courses Error:", coursesRes.reason);
          setCourses([]);
        } else {
          const coursesData = coursesRes.value?.courses;
          console.log("📚 Courses Data:", coursesData);
          if (Array.isArray(coursesData)) {
            setCourses(coursesData);
            console.log("✅ Courses set:", coursesData);
          } else {
            console.error("❌ Invalid courses data:", coursesData);
            setCourses([]);
          }
        }

        // Handle Timetable
        if (timetableRes.status === "rejected") {
          console.error("❌ Timetable Error:", timetableRes.reason);
          setTimetable([]);
        } else {
          // Timetable data is directly in the response
          const timetableData = timetableRes.value;
          console.log("🕒 Timetable Data:", timetableData);
          if (Array.isArray(timetableData)) {
            setTimetable(timetableData);
            console.log("✅ Timetable set:", timetableData);
          } else {
            console.error("❌ Invalid timetable data:", timetableData);
            setTimetable([]);
          }
        }

        // Handle Assignments
        if (assignmentsRes.status === "rejected") {
          console.error("❌ Assignments Error:", assignmentsRes.reason);
          setAssignments([]);
        } else {
          const assignmentsData = assignmentsRes.value?.assignments;
          console.log("📝 Assignments Data:", assignmentsData);
          if (Array.isArray(assignmentsData)) {
            setAssignments(assignmentsData);
            console.log("✅ Assignments set:", assignmentsData);
          } else {
            console.error("❌ Invalid assignments data:", assignmentsData);
            setAssignments([]);
          }
        }

        // Handle Announcements
        if (announcementsRes.status === "rejected") {
          console.error("❌ Announcements Error:", announcementsRes.reason);
          setAnnouncements([]);
        } else {
          const announcementsData = announcementsRes.value?.announcements;
          console.log("📢 Announcements Data:", announcementsData);
          if (Array.isArray(announcementsData)) {
            setAnnouncements(announcementsData);
            console.log("✅ Announcements set:", announcementsData);
          } else {
            console.error("❌ Invalid announcements data:", announcementsData);
            setAnnouncements([]);
          }
        }
  
      } catch (err) {
        console.error("❌ Error Loading Classroom:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleUploadResource = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) {
        toast.error("Please select a file");
        return;
      }

      // Check if courses array exists and has at least one item
      if (!Array.isArray(courses) || courses.length === 0) {
        toast.error("No classroom assigned to this teacher");
        console.error("Courses state is empty or invalid:", courses);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("classroom", courses[0]); // Using first course

      const response = await teacherApi.uploadResource(formData);
      
      // Changed validation to check for success flag
      if (!response?.success) {
        console.error("❌ Invalid API Response:", response);
        toast.error("Failed to upload resource");
        return;
      }

      // Update UI with new resource
      setResources(prev => [...prev, response.resource]);
      toast.success("Resource uploaded successfully");
      
      // Reset file input
      e.target.value = '';
    } catch (err) {
      console.error("Upload Error:", err);
      toast.error(err.message || "Failed to upload resource");
    }
  };

  const handleCreateAssignment = async (data) => {
    console.log("📤 Sending Assignment Data:", data);

    try {
      const newAssignment = await teacherApi.createAssignment(data);
      console.log("✅ Assignment Created (Full Response):", newAssignment);

      // 🚨 Debug: Check if `newAssignment.data.assignment` exists
      if (!newAssignment.data || !newAssignment.data.assignment) {
        console.error(
          "❌ API did not return valid assignment data!",
          newAssignment.data,
        );
        toast.error("Invalid assignment data received!");
        return;
      }

      setAssignments([...assignments, newAssignment.data.assignment]);
      toast.success("Assignment created successfully");
      reset();
    } catch (err) {
      console.error("❌ Assignment Creation Failed:", err);
      toast.error("Failed to create assignment");
    }
  };

  const handleCreateAnnouncement = async (data) => {
    console.log("📥 Form Data Before Sending:", data);

    try {
      const newAnnouncement = await teacherApi.createAnnouncement(data);
      console.log("✅ Raw API Response:", newAnnouncement);

      // Changed validation to check for success flag
      if (!newAnnouncement?.success) {
        console.error("❌ Invalid API Response:", newAnnouncement);
        toast.error("Failed to create announcement");
        return;
      }

      // Update UI with new announcement
      setAnnouncements(prev => [...prev, newAnnouncement.announcement]);
      toast.success("Announcement created successfully");
      reset();
    } catch (err) {
      console.error("❌ API Call Failed:", err);
      toast.error("Failed to create announcement");
    }
  };

  const handleCreateTimetable = async (data) => {
    try {
      const formattedData = {
        ...data,
        startTime: data.startTime,
        endTime: data.endTime,
      };

      console.log("📤 Submitting Timetable Data:", formattedData);

      const response = await teacherApi.createTimetable(formattedData);
      console.log("✅ API Response:", response);

      if (!response?.data?.timetable) {
        console.error("❌ Error: API did not return timetable data!", response);
        toast.error("Failed to create timetable");
        return;
      }

      // Update UI
      setTimetable(prev => [...prev, response.data.timetable]);
      toast.success("Timetable created successfully");
      reset();
    } catch (error) {
      console.error("❌ Error creating timetable:", error);
      toast.error("Failed to create timetable");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <TailSpin color="#3B82F6" height={80} width={80} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">
              Error Loading Classroom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-8">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="timetable">Timetable</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            <div className="flex gap-4">
              <Button variant="outline">
                <BellPlus className="mr-2 h-4 w-4" />
                Create Alert
              </Button>
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Students</span>
                    <Badge variant="outline">142</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Courses</span>
                    <Badge variant="outline">{courses.length}</Badge>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    Last updated: {format(new Date(), "PPpp")}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <Table>
                      <TableBody>
                        {announcements.slice(0, 5).map((
                          announcement,
                          index,
                        ) => (
                          <TableRow key={announcement._id || index}>
                            <TableCell>
                              <div className="font-medium">
                                {announcement.title}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {announcement.date
                                  ? (
                                    isNaN(new Date(announcement.date).getTime())
                                      ? (
                                        "Invalid Date"
                                      )
                                      : (
                                        format(
                                          new Date(announcement.date),
                                          "PPpp",
                                        )
                                      )
                                  )
                                  : "No Date Available"}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">Published</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Timetable Tab */}
          <TabsContent value="timetable">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Add New Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSubmit(handleCreateTimetable)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input {...register("subject")} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Course</Label>
                      <Select
                        onValueChange={(value) => setValue("course", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course} value={course}>
                              {course}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          {...register("startTime")}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input type="time" {...register("endTime")} required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full cursor-pointer">
                      <Clock className="mr-2 h-4 w-4" />
                      Add to Timetable
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Class Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timetable?.length > 0
                          ? (
                            timetable.map((entry) => (
                              <TableRow key={entry?._id || Math.random()}>
                                <TableCell>
                                  {entry?.subject || "No Subject"}
                                </TableCell>
                                <TableCell>
                                  {entry?.course || "No Course"}
                                </TableCell>
                                <TableCell>
                                  {entry?.startTime
                                    ? format(new Date(entry.startTime), "HH:mm")
                                    : "N/A"} -
                                  {entry?.endTime
                                    ? format(new Date(entry.endTime), "HH:mm")
                                    : "N/A"}
                                </TableCell>
                                <TableCell>
                                  {entry?.startTime && entry?.endTime
                                    ? Math.abs(
                                          new Date(entry.endTime) -
                                            new Date(entry.startTime),
                                        ) / (1000 * 60) + " mins"
                                    : "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )
                          : (
                            <TableRow>
                              <TableCell colSpan="5" className="text-center">
                                No timetable data available.
                              </TableCell>
                            </TableRow>
                          )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Create Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSubmit(handleCreateAssignment)}
                    className="space-y-4"
                  >
                    
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input {...register("title")} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Course</Label>
                      <Controller
                        name="course"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            required
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses?.map((course) => (
                                <SelectItem key={course} value={course}>
                                  {course}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input
                        type="datetime-local"
                        {...register("dueDate")}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea {...register("description")} rows={4} />
                    </div>
                    <Button type="submit" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Create Assignment
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Active Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Submissions</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignments.map((assignment) => (
                          <TableRow key={assignment._id}>
                            <TableCell>{assignment.title}</TableCell>
                            <TableCell>{assignment.course}</TableCell>
                            <TableCell>
                              {format(new Date(assignment.dueDate), "PPpp")}
                            </TableCell>
                            <TableCell>23/142</TableCell>
                            <TableCell>
                              <Badge variant="secondary">Active</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>New Announcement</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log("🚀 Form Submitted!");
                      handleSubmit(handleCreateAnnouncement)(e);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        {...register("title", {
                          required: "Title is required",
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Course</Label>
                      <Controller
                        name="course"
                        control={control}
                        rules={{ required: "Course is required" }}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses.map((course) => (
                                <SelectItem key={course} value={course}>
                                  {course}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        {...register("content", {
                          required: "Content is required",
                        })}
                        rows={4}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <BellPlus className="mr-2 h-4 w-4" />
                      Publish Announcement
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Previous Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    {announcements.map((announcement, index) => (
                      <Card key={announcement._id || index} className="mb-4">
                        <CardHeader>
                          <CardTitle>{announcement.title}</CardTitle>
                          <CardDescription>
                            {announcement.date
                              ? (
                                isNaN(Date.parse(announcement.date))
                                  ? (
                                    "Invalid Date"
                                  )
                                  : (
                                    format(new Date(announcement.date), "PPpp")
                                  )
                              )
                              : "No Date Available"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>
                            {announcement.content
                              ? announcement.content
                              : "No Content Available"}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Upload Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select File</Label>
                    <Input type="file" onChange={handleUploadResource} />
                  </div>
                  <div className="space-y-2">
                    <Label>Resource Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="syllabus">Syllabus</SelectItem>
                        <SelectItem value="notes">Lecture Notes</SelectItem>
                        <SelectItem value="recording">
                          Video Recording
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleUploadResource}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Course Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>Downloads</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resources.map((resource) => (
                          <TableRow key={resource._id}>
                            <TableCell className="font-medium">
                              {resource.fileName}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {resource.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(resource.uploadDate), "PPpp")}
                            </TableCell>
                            <TableCell>{resource.downloads || 0}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteResource(resource._id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        <Toaster />
      </div>
    </div>
  );
};

export default TeacherClassroom;
