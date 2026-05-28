import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone, CalendarClock, BookOpen, AlertCircle } from "lucide-react";
import useAuth from "@/contexts/AuthContext";
import studentService from "@/modules/student/services/student.service";
import teacherService from "@/modules/teacher/services/teacher.service";
import { format } from "date-fns";
import { motion } from "framer-motion";

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        let data;
        
        // Fetch based on user role
        if (user?.role === "teacher" || user?.role === "admin") {
          data = await teacherService.getAnnouncements();
        } else {
          data = await studentService.getAnnouncements();
        }
        
        // Sort announcements by newest first
        const sortedData = (data?.announcements || data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setAnnouncements(sortedData);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError("Failed to load announcements. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-4 mt-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50/50">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
            <Megaphone className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              Campus Announcements
            </h1>
            <p className="text-slate-500 mt-1">
              Stay updated with the latest news, notices, and important alerts for your courses.
            </p>
          </div>
        </header>

        {/* Content */}
        {error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-red-100 shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">Oops!</h3>
            <p className="text-slate-500 mt-2">{error}</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Megaphone className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700">No Announcements Yet</h3>
            <p className="text-slate-500 mt-2 max-w-md">
              There are currently no active announcements for your enrolled courses. Check back later!
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-indigo-100 ml-4 pl-8 space-y-8">
            {announcements.map((announcement, idx) => (
              <motion.div
                key={announcement._id || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="relative"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-white bg-indigo-500 shadow-sm" />
                
                <Card className="hover:shadow-md transition-shadow border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-slate-800 leading-tight">
                          {announcement.title}
                        </CardTitle>
                        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                            <BookOpen className="w-3.5 h-3.5" />
                            {announcement.course}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CalendarClock className="w-4 h-4" />
                            {format(new Date(announcement.createdAt), "PPP 'at' p")}
                          </span>
                        </div>
                      </div>
                      
                      {announcement.user && (
                        <Badge variant="outline" className="text-slate-600 shrink-0 bg-slate-50">
                          Posted by Teacher
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;