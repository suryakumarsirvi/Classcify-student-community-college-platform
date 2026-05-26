import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import studentApi from "@/api/student.api";

const AdminClassroom = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCollege, setExpandedCollege] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentView, setCurrentView] = useState("colleges");

  // Fetch all students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await studentApi.getAllStudents();
        // console.log("Fetched students:", data); // Log response
        setStudents(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch students",
          description: error.response?.data?.error || "Server error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [toast]);

  // Process data for colleges table
  const collegesData = useMemo(() => {
    const collegeMap = new Map();

    students.forEach((student) => {
      const key =
        `${student.academic.collegeName}-${student.academic.collegeCity}`;
      if (!collegeMap.has(key)) {
        collegeMap.set(key, {
          name: student.academic.collegeName,
          city: student.academic.collegeCity,
          state: student.academic.state,
          courses: new Set(),
          totalStudents: 0,
        });
      }
      const college = collegeMap.get(key);
      college.courses.add(student.academic.course);
      college.totalStudents++;
    });

    return Array.from(collegeMap.values()).map((college) => ({
      ...college,
      courses: Array.from(college.courses),
    }));
  }, [students]);

  // Process data for courses table
  const coursesData = useMemo(() => {
    if (!expandedCollege) return [];
    return students.filter((student) =>
      student.academic.collegeName === expandedCollege.name &&
      student.academic.collegeCity === expandedCollege.city
    ).reduce((acc, student) => {
      const existing = acc.find((c) => c.name === student.academic.course);
      if (existing) {
        existing.students++;
      } else {
        acc.push({
          name: student.academic.course,
          students: 1,
          stream: student.academic.stream,
          admissionYear: student.academic.admissionYear,
        });
      }
      return acc;
    }, []);
  }, [expandedCollege, students]);

  // Filtered colleges based on search
  const filteredColleges = useMemo(() => {
    return collegesData.filter((college) =>
      college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [collegesData, searchTerm]);

  // Handle college row click
  const handleCollegeClick = (college) => {
    setExpandedCollege(expandedCollege?.name === college.name ? null : college);
    setCurrentView("courses");
  };

  // Handle course selection
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setCurrentView("students");
  };

  // Get students for selected course
  const courseStudents = useMemo(() => {
    if (!selectedCourse || !expandedCollege) return [];
    return students.filter((student) =>
      student.academic.collegeName === expandedCollege.name &&
      student.academic.collegeCity === expandedCollege.city &&
      student.academic.course === selectedCourse.name
    );
  }, [selectedCourse, expandedCollege, students]);

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Search and Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search colleges..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentView("colleges");
                setExpandedCollege(null);
                setSelectedCourse(null);
              }}
              disabled={currentView === "colleges"}
            >
              Back to Colleges
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        {loading
          ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )
          : (
            <ScrollArea className="h-[calc(105vh-180px)] rounded-md border">
              {/* Colleges Table */}
              {currentView === "colleges" && (
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="w-[300px]">College</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Action</TableHead>
                      {/* <TableHead className="w-[80px]" /> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredColleges.map((college) => (
                      <TableRow
                        key={`${college.name}-${college.city}`}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleCollegeClick(college)}
                      >
                        <TableCell>
                          {college.name}
                        </TableCell>
                        <TableCell>{college.city}</TableCell>
                        <TableCell>{college.state}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {college.courses.map((course) => (
                              <Badge variant="outline" key={course}>
                                {course.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <ChevronRight className="p-1 rounded-full hover:bg-zinc-200"  />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Courses Table */}
              {currentView === "courses" && (
                <div className="space-y-4 p-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentView("colleges")}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Colleges
                    </Button>
                    <h2 className="text-xl font-semibold">
                      {expandedCollege.name} Courses
                    </h2>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Stream</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Admission Year</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coursesData.map((course) => (
                        <TableRow
                          key={course.name}
                          className="cursor-pointer"
                          onClick={() => handleCourseSelect(course)}
                        >
                          <TableCell className="font-medium">
                            {course.name.toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{course.stream}</Badge>
                          </TableCell>
                          <TableCell>{course.students}</TableCell>
                          <TableCell>{course.admissionYear}</TableCell>
                          <TableCell>
                            <ChevronRight className="h-4 w-4" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Students Table */}
              {currentView === "students" && (
                <div className="space-y-4 p-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentView("courses")}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Courses
                    </Button>
                    <h2 className="text-xl font-semibold">
                      {selectedCourse.name} Students
                    </h2>
                  </div>

                  <Card>
                    <CardHeader className="py-3">
                      <div className="grid grid-cols-6 items-center text-sm font-medium">
                        <span>Name</span>
                        <span>Email</span>
                        <span>Phone</span>
                        <span>Stream</span>
                        <span>Admission Year</span>
                        <span>Personality</span>
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-0">
                      <ScrollArea className="h-[500px]">
                        {courseStudents.map((student) => (
                          <div
                            key={student._id}
                            className="grid grid-cols-6 items-center py-3 px-4 text-sm hover:bg-muted/50"
                          >
                            <div>
                              {student.personal.firstName}{" "}
                              {student.personal.lastName}
                            </div>
                            <div className="overflow-y-auto scrollbar-none">{student.personal.email}</div>
                            <div className="pl-1">{student.personal.phone}</div>
                            <div>
                              <Badge variant="outline">
                                {student.academic.stream}
                              </Badge>
                            </div>
                            <div>{student.academic.admissionYear}</div>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="secondary">
                                  {student.other.personalityType}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {student.other.interests?.join(", ")}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              )}
            </ScrollArea>
          )}
      </div>
    </TooltipProvider>
  );
};

export default AdminClassroom;
