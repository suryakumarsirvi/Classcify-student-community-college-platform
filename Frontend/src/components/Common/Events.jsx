import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, BookOpen, FileText, AlertCircle } from "lucide-react";
import useAuth from "@/contexts/AuthContext";
import studentService from "@/modules/student/services/student.service";
import teacherService from "@/modules/teacher/services/teacher.service";
import { format, isAfter, isToday, parseISO } from "date-fns";
import { motion } from "framer-motion";

const Events = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let assignmentsData = [];
        let timetableData = [];
        
        // Fetch based on user role
        if (user?.role === "teacher" || user?.role === "admin") {
          const [aRes, tRes] = await Promise.all([
            teacherService.getAssignments().catch(() => []),
            teacherService.getTimetable().catch(() => [])
          ]);
          assignmentsData = aRes?.data || aRes || [];
          timetableData = tRes?.data || tRes || [];
        } else {
          const [aRes, tRes] = await Promise.all([
            studentService.getAssignments().catch(() => []),
            studentService.getTimetable().catch(() => [])
          ]);
          assignmentsData = aRes?.data || aRes || [];
          timetableData = tRes?.data || tRes || [];
        }

        // Normalize assignments (sort by due date)
        const sortedAssignments = Array.isArray(assignmentsData) 
          ? assignmentsData.sort((a, b) => new Date(a.dueDate || a.createdAt) - new Date(b.dueDate || b.createdAt))
          : [];
          
        setAssignments(sortedAssignments);
        
        // Normalize timetable
        setTimetable(Array.isArray(timetableData) ? timetableData : []);
        
      } catch (err) {
        console.error("Error fetching events data:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEventsData();
    }
  }, [user]);

  // Group timetable by day of week if available
  const groupedTimetable = timetable.reduce((acc, slot) => {
    const day = slot.dayOfWeek || slot.day || "General";
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  // Sort keys based on standard week days
  const sortedDays = Object.keys(groupedTimetable).sort(
    (a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
  );

  if (loading) {
    return (
      <div className="min-h-screen p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Tabs defaultValue="deadlines" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
          </TabsList>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50/50">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <div className="p-3 bg-violet-100 text-violet-700 rounded-xl">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              Events & Schedule
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your upcoming deadlines and weekly timetable in one place.
            </p>
          </div>
        </header>

        {error && (
          <div className="flex flex-col items-center justify-center p-6 text-center bg-white rounded-xl border border-red-100 shadow-sm">
            <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-slate-600">{error}</p>
          </div>
        )}

        <Tabs defaultValue="deadlines" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
            <TabsTrigger value="deadlines" className="text-sm font-medium">
              Upcoming Deadlines
              {assignments.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-violet-100 text-violet-700 hover:bg-violet-200">
                  {assignments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="timetable" className="text-sm font-medium">
              Weekly Timetable
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deadlines" className="space-y-4">
            {assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <FileText className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700">No Upcoming Deadlines</h3>
                <p className="text-slate-500 mt-2">You're all caught up! There are no assignments due soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment, idx) => {
                  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
                  const isPastDue = dueDate && !isAfter(dueDate, new Date()) && !isToday(dueDate);
                  
                  return (
                    <motion.div
                      key={assignment._id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                      <Card className={`h-full border-l-4 transition-all hover:shadow-md ${isPastDue ? 'border-l-red-500 opacity-75' : 'border-l-violet-500'}`}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="bg-slate-50 text-slate-600">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {assignment.course || "General"}
                            </Badge>
                            {isPastDue && (
                              <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                                Past Due
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg font-bold leading-tight line-clamp-2">
                            {assignment.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                            {assignment.description || "No description provided."}
                          </p>
                          <div className="flex items-center text-sm font-medium text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <Clock className="w-4 h-4 mr-2 text-slate-400" />
                            {dueDate ? format(dueDate, "MMM d, yyyy 'at' h:mm a") : "No due date"}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timetable" className="space-y-8">
            {sortedDays.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Calendar className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700">No Timetable Available</h3>
                <p className="text-slate-500 mt-2">Your weekly schedule has not been set up yet.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {sortedDays.map((day, dayIdx) => (
                  <motion.div 
                    key={day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: dayIdx * 0.1 }}
                  >
                    <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center">
                      <span className="bg-violet-100 text-violet-700 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">
                        {day.substring(0, 3).toUpperCase()}
                      </span>
                      {day}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedTimetable[day]
                        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
                        .map((slot, idx) => (
                        <Card key={idx} className="bg-white border-slate-200 hover:border-violet-300 transition-colors shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <span className="font-bold text-slate-800">{slot.course || slot.subject || "Class"}</span>
                              <Badge variant="secondary" className="bg-violet-50 text-violet-700">
                                {slot.type || "Lecture"}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-slate-600">
                                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                {slot.startTime} - {slot.endTime}
                              </div>
                              {slot.room && (
                                <div className="flex items-center text-sm text-slate-600">
                                  <BookOpen className="w-4 h-4 mr-2 text-slate-400" />
                                  Room: {slot.room}
                                </div>
                              )}
                              {slot.teacher && typeof slot.teacher === 'object' && (
                                <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                                  Prof. {slot.teacher.firstName || ""} {slot.teacher.lastName || ""}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Events;