import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Save, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import teacherService from "@/modules/teacher/services/teacher.service";
import { toast } from "sonner";

const TeacherAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [remarkMap, setRemarkMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [existingRecordId, setExistingRecordId] = useState(null);

  // Fetch teacher's assigned courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await teacherService.getTeacherCourses();
        if (data?.courses && Array.isArray(data.courses)) {
          setCourses(data.courses);
          if (data.courses.length > 0) {
            setSelectedCourse(data.courses[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch teacher courses:", error);
        toast.error("Failed to load classrooms");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch students and existing attendance when course or date changes
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchStudentsAndAttendance = async () => {
      setLoadingStudents(true);
      setStudents([]);
      setAttendanceMap({});
      setRemarkMap({});
      setExistingRecordId(null);

      try {
        // 1. Get all students in the classroom
        const studentRes = await teacherService.getClassroomStudents(selectedCourse);
        const studentList = Array.isArray(studentRes) ? studentRes : studentRes?.students || [];
        setStudents(studentList);

        // Initialize all students to "present" with empty remarks
        const initialAttendance = {};
        const initialRemarks = {};
        studentList.forEach((student) => {
          initialAttendance[student._id] = "present";
          initialRemarks[student._id] = "";
        });

        // 2. Try to fetch existing attendance record for this date
        try {
          const attendanceRes = await teacherService.getAttendance(selectedCourse, attendanceDate);
          if (attendanceRes?.attendance) {
            const record = attendanceRes.attendance;
            setExistingRecordId(record._id);
            record.students.forEach((entry) => {
              const studentId = entry.student?._id || entry.student;
              if (studentId) {
                initialAttendance[studentId] = entry.status;
                initialRemarks[studentId] = entry.remark || "";
              }
            });
            toast.info("Loaded existing attendance record for this date.");
          }
        } catch (err) {
          // 404 is expected if attendance has not been marked yet
          console.log("No existing attendance record for this date.");
        }

        setAttendanceMap(initialAttendance);
        setRemarkMap(initialRemarks);
      } catch (error) {
        console.error("Failed to load students/attendance:", error);
        toast.error("Failed to load classroom data");
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [selectedCourse, attendanceDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleRemarkChange = (studentId, remark) => {
    setRemarkMap((prev) => ({
      ...prev,
      [studentId]: remark,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse) {
      toast.error("Please select a classroom first");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Saving attendance...");

    try {
      const studentPayload = students.map((student) => ({
        student: student._id,
        status: attendanceMap[student._id] || "present",
        remark: remarkMap[student._id] || "",
      }));

      const payload = {
        course: selectedCourse,
        date: attendanceDate,
        students: studentPayload,
      };

      if (existingRecordId) {
        // Update existing record
        await teacherService.updateAttendanceRecord(existingRecordId, {
          students: studentPayload,
        });
        toast.success("Attendance updated successfully! 🎉", { id: toastId });
      } else {
        // Create new record
        const response = await teacherService.markAttendance(payload);
        if (response?.attendance) {
          setExistingRecordId(response.attendance._id);
        }
        toast.success("Attendance saved successfully! 🎉", { id: toastId });
      }
    } catch (error) {
      console.error("Failed to save attendance:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to save attendance",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = students.length;
    let present = 0;
    let absent = 0;
    let late = 0;

    Object.values(attendanceMap).forEach((status) => {
      if (status === "present") present++;
      else if (status === "absent") absent++;
      else if (status === "late") late++;
    });

    return { total, present, absent, late };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Panel</h1>
            <p className="text-muted-foreground mt-1">
              Select classroom and date to mark or edit student attendance.
            </p>
          </div>
          {existingRecordId && (
            <Badge variant="success" className="text-sm px-3 py-1 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Attendance Marked
            </Badge>
          )}
        </div>

        {/* Filters and Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Session Configuration</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classroom">Classroom / Course</Label>
                {loading ? (
                  <div className="h-10 flex items-center justify-center border rounded-md bg-white">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger id="classroom">
                      <SelectValue placeholder="Select classroom" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Attendance Date</Label>
                <div className="relative">
                  <Input
                    type="date"
                    id="date"
                    value={attendanceDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                <span className="text-xs text-indigo-700 font-medium">Students</span>
                <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <span className="text-xs text-green-700 font-medium">Present</span>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.present}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <span className="text-xs text-red-700 font-medium">Absent</span>
                <p className="text-2xl font-bold text-red-900 mt-1">{stats.absent}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <span className="text-xs text-yellow-700 font-medium">Late</span>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.late}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student List Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Student Roll Call
            </CardTitle>
            <CardDescription>
              Mark each student as Present, Absent, or Late. Added remarks will be stored.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStudents ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-muted-foreground text-sm">Fetching student roster...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-gray-50/50">
                <AlertCircle className="h-10 w-10 text-gray-400 mb-2" />
                <p className="font-medium text-gray-600">No students found</p>
                <p className="text-xs max-w-sm mt-1">
                  Ensure you select a valid classroom that has students registered.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center w-64">Status</TableHead>
                    <TableHead>Remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const status = attendanceMap[student._id] || "present";
                    return (
                      <TableRow key={student._id} className="hover:bg-gray-50/50">
                        <TableCell className="font-semibold text-gray-900">
                          {student.name ||
                            `${student.personal?.firstName || ""} ${
                              student.personal?.lastName || ""
                            }`.trim() ||
                            "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {student.academic?.rollNumber || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {student.email || student.personal?.email || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1 bg-gray-100 p-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student._id, "present")}
                              className={`flex-1 text-xs py-1.5 px-3 rounded-md font-medium transition cursor-pointer ${
                                status === "present"
                                  ? "bg-green-500 text-white shadow-sm"
                                  : "text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student._id, "late")}
                              className={`flex-1 text-xs py-1.5 px-3 rounded-md font-medium transition cursor-pointer ${
                                status === "late"
                                  ? "bg-yellow-500 text-white shadow-sm"
                                  : "text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student._id, "absent")}
                              className={`flex-1 text-xs py-1.5 px-3 rounded-md font-medium transition cursor-pointer ${
                                status === "absent"
                                  ? "bg-red-500 text-white shadow-sm"
                                  : "text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Optional remark..."
                            value={remarkMap[student._id] || ""}
                            onChange={(e) => handleRemarkChange(student._id, e.target.value)}
                            className="h-8 max-w-xs"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {students.length > 0 && (
            <CardFooter className="flex justify-end bg-gray-50/50 border-t p-4">
              <Button
                onClick={handleSaveAttendance}
                disabled={loading || loadingStudents}
                className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                <Save className="mr-2 h-4 w-4" />
                {existingRecordId ? "Update Attendance" : "Submit Attendance"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TeacherAttendance;
