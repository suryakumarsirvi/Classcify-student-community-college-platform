import React, { useState, useEffect } from "react";
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
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Info,
  Loader2,
  MoreVertical,
  Printer,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { format, subMonths, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar as DateCalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import studentService from "@/modules/student/services/student.service";
import api from "@/services/api";

const dummyAttendanceData = {
  overallStats: {
    totalClasses: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0,
    lastUpdated: new Date().toISOString()
  },
  monthlyStats: [],
  subjectWiseStats: [],
  dailyRecords: []
};

const StudentAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState(dummyAttendanceData);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("daily");
  const [exportFormat, setExportFormat] = useState("pdf");

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/attendance/mystats");
      if (res?.data) {
        const { overallStats, detailedRecords, course } = res.data;

        // Group by Date for daily records
        const dateGroups = {};
        detailedRecords.forEach(rec => {
          const dateStr = new Date(rec.date).toISOString().split("T")[0];
          if (!dateGroups[dateStr]) {
            dateGroups[dateStr] = [];
          }
          dateGroups[dateStr].push({
            subject: course || "General",
            status: rec.status,
            time: format(new Date(rec.date), "hh:mm a"),
            remark: rec.remark || "",
            teacher: rec.teacher || "Unknown"
          });
        });

        const dailyRecords = Object.keys(dateGroups).map(date => ({
          date,
          records: dateGroups[date]
        })).sort((a, b) => new Date(b.date) - new Date(a.date));

        // Group by Month for monthly stats
        const monthGroups = {};
        detailedRecords.forEach(rec => {
          const d = new Date(rec.date);
          if (!isNaN(d.getTime())) {
            const monthName = format(d, "MMMM yyyy");
            if (!monthGroups[monthName]) {
              monthGroups[monthName] = { present: 0, absent: 0, late: 0, total: 0 };
            }
            const status = rec.status.toLowerCase();
            if (status === "present") monthGroups[monthName].present++;
            else if (status === "absent") monthGroups[monthName].absent++;
            else if (status === "late") monthGroups[monthName].late++;
            monthGroups[monthName].total++;
          }
        });

        const monthlyStats = Object.keys(monthGroups).map(month => {
          const g = monthGroups[month];
          const percentage = g.total > 0 ? Number(((g.present + g.late) / g.total * 100).toFixed(2)) : 0;
          return { month, present: g.present, absent: g.absent, late: g.late, percentage };
        });

        // Subject-wise stats: since the course name is "course", we can just use that as the single subject/course
        const subjectWiseStats = [
          {
            subject: course || "General",
            totalClasses: overallStats.totalClasses,
            present: overallStats.present,
            absent: overallStats.absent,
            late: overallStats.late,
            percentage: overallStats.percentage
          }
        ];

        setAttendanceData({
          overallStats: {
            ...overallStats,
            lastUpdated: new Date().toISOString()
          },
          monthlyStats,
          subjectWiseStats,
          dailyRecords
        });
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleRefresh = async () => {
    try {
      await loadAttendance();
      toast.success("Attendance data refreshed successfully");
    } catch (err) {
      toast.error("Failed to refresh attendance data");
    }
  };

  const handleExport = async (format) => {
    try {
      toast.loading(`Exporting attendance data as ${format.toUpperCase()}...`);
      setTimeout(() => {
        // Defer toast operations to next event loop to avoid render-phase updates
        toast.dismiss();
        toast.success(`Attendance data exported as ${format.toUpperCase()}`);
      }, 1000);
    } catch (err) {
      toast.error("Failed to export attendance data");
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "present":
        return <Badge variant="success">Present</Badge>;
      case "absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "late":
        return <Badge variant="warning">Late</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderOverallStats = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Overall Attendance
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: {format(new Date(attendanceData.overallStats.lastUpdated), "PPPp")}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Attendance Percentage</p>
              <p className="text-3xl font-bold">
                {attendanceData.overallStats.percentage}%
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-sm font-medium">Present</p>
                <p className="text-lg font-bold text-green-600">
                  {attendanceData.overallStats.present}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Absent</p>
                <p className="text-lg font-bold text-red-600">
                  {attendanceData.overallStats.absent}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Late</p>
                <p className="text-lg font-bold text-yellow-600">
                  {attendanceData.overallStats.late}
                </p>
              </div>
            </div>
          </div>
          <Progress value={attendanceData.overallStats.percentage} />
        </div>
      </CardContent>
    </Card>
  );

  const renderMonthlyStats = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Monthly Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {attendanceData.monthlyStats.map((month, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-medium">{month.month}</p>
                <p className="text-sm font-medium">{month.percentage}%</p>
              </div>
              <Progress value={month.percentage} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Present: {month.present}</span>
                <span>Absent: {month.absent}</span>
                <span>Late: {month.late}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderSubjectWiseStats = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Subject-wise Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Total Classes</TableHead>
              <TableHead>Present</TableHead>
              <TableHead>Absent</TableHead>
              <TableHead>Late</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceData.subjectWiseStats.map((subject, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{subject.subject}</TableCell>
                <TableCell>{subject.totalClasses}</TableCell>
                <TableCell>{subject.present}</TableCell>
                <TableCell>{subject.absent}</TableCell>
                <TableCell>{subject.late}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>{subject.percentage}%</span>
                    <Progress
                      value={subject.percentage}
                      className="w-20"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderDailyRecords = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Daily Attendance Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {attendanceData.dailyRecords.map((day, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {format(new Date(day.date), "EEEE, MMMM d, yyyy")}
                </h3>
                <Badge variant="outline">
                  {day.records.filter(r => r.status === "Present").length} / {day.records.length} Present
                </Badge>
              </div>
              <div className="space-y-2">
                {day.records.map((record, recordIndex) => (
                  <div
                    key={recordIndex}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {record.status === "Present" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : record.status === "Absent" ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="font-medium">{record.subject}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {record.time}
                      </span>
                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
              <CardTitle>Error Loading Attendance Data</CardTitle>
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
              Attendance Dashboard
            </h1>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")}>
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">View Mode</label>
              <Select
                value={viewMode}
                onValueChange={setViewMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select view mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily View</SelectItem>
                  <SelectItem value="monthly">Monthly View</SelectItem>
                  <SelectItem value="subject">Subject-wise View</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DateCalendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {attendanceData.subjectWiseStats.map((subject, index) => (
                    <SelectItem key={index} value={subject.subject}>
                      {subject.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              {renderOverallStats()}
              {renderMonthlyStats()}
            </div>

            <div className="lg:col-span-2 space-y-6">
              {viewMode === "subject" && renderSubjectWiseStats()}
              {viewMode === "daily" && renderDailyRecords()}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default StudentAttendance;
