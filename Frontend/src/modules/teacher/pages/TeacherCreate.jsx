import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Megaphone,
  Calendar,
  UploadCloud,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import teacherService from "@/modules/teacher/services/teacher.service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";

const TeacherCreate = () => {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [activeTab, setActiveTab] = useState("assignment");
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const {
    register: registerAssignment,
    handleSubmit: handleSubmitAssignment,
    reset: resetAssignment,
    control: controlAssignment,
    formState: { errors: errorsAssignment },
  } = useForm();

  const {
    register: registerAnnouncement,
    handleSubmit: handleSubmitAnnouncement,
    reset: resetAnnouncement,
    control: controlAnnouncement,
    formState: { errors: errorsAnnouncement },
  } = useForm();

  const {
    register: registerTimetable,
    handleSubmit: handleSubmitTimetable,
    reset: resetTimetable,
    control: controlTimetable,
    formState: { errors: errorsTimetable },
  } = useForm();

  const {
    handleSubmit: handleSubmitResource,
    reset: resetResource,
    control: controlResource,
    formState: { errors: errorsResource },
  } = useForm();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await teacherService.getTeacherCourses();
        setCourses(res.courses || []);
      } catch (err) {
        console.error("Failed to load courses:", err);
        toast.error("Failed to load active courses.");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const onDrop = (acceptedFiles) => {
    setUploadedFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const onSubmitAssignment = async (data) => {
    try {
      setSubmitting(true);
      await teacherService.createAssignment({
        title: data.title,
        description: data.description,
        course: data.course,
        dueDate: new Date(data.dueDate).toISOString(),
      });
      toast.success("Assignment created successfully!");
      resetAssignment();
    } catch (err) {
      toast.error(err?.message || "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitAnnouncement = async (data) => {
    try {
      setSubmitting(true);
      await teacherService.createAnnouncement({
        title: data.title,
        content: data.content,
        course: data.course,
      });
      toast.success("Announcement broadcasted successfully!");
      resetAnnouncement();
    } catch (err) {
      toast.error(err?.message || "Failed to create announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitTimetable = async (data) => {
    try {
      setSubmitting(true);
      await teacherService.createTimetable({
        subject: data.subject,
        course: data.course,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      });
      toast.success("Class scheduled in timetable!");
      resetTimetable();
    } catch (err) {
      toast.error(err?.message || "Failed to schedule class");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitResource = async (data) => {
    if (!uploadedFile) {
      toast.error("Please drop or select a study material file.");
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("classroom", data.course);
      formData.append("file", uploadedFile);

      await teacherService.uploadResource(formData);
      toast.success("Study material uploaded successfully!");
      setUploadedFile(null);
      resetResource();
    } catch (err) {
      toast.error(err?.message || "Failed to upload study material");
    } finally {
      setSubmitting(false);
    }
  };

  const tabItems = [
    { id: "assignment", label: "Assignment", icon: FileText },
    { id: "announcement", label: "Announcement", icon: Megaphone },
    { id: "timetable", label: "Schedule Class", icon: Calendar },
    { id: "resource", label: "Study Material", icon: UploadCloud },
  ];

  return (
    <div className="min-h-screen p-6 bg-slate-50/50">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Create Hub
          </h1>
          <p className="text-slate-500 mt-1">
            Centrally schedule classes, assign tasks, broadcast announcements, and distribute resources.
          </p>
        </header>

        <div className="flex border-b border-slate-200 gap-2 mb-6">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setUploadedFile(null);
                }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-6">
          <AnimatePresence mode="wait">
            {activeTab === "assignment" && (
              <motion.form
                key="assignment"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmitAssignment(onSubmitAssignment)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assignment Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Midterm Lab Report"
                      {...registerAssignment("title", { required: "Title is required" })}
                    />
                    {errorsAssignment.title && (
                      <span className="text-xs text-red-500">{errorsAssignment.title.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course">Target Course</Label>
                    <Controller
                      name="course"
                      control={controlAssignment}
                      rules={{ required: "Course is required" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select target course"} />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course._id} value={course.name}>
                                {course.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errorsAssignment.course && (
                      <span className="text-xs text-red-500">{errorsAssignment.course.message}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date & Time</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    {...registerAssignment("dueDate", { required: "Due Date is required" })}
                  />
                  {errorsAssignment.dueDate && (
                    <span className="text-xs text-red-500">{errorsAssignment.dueDate.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description & Prompt</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide full details, formatting requirements, and grading criteria..."
                    rows={6}
                    {...registerAssignment("description", { required: "Description is required" })}
                  />
                  {errorsAssignment.description && (
                    <span className="text-xs text-red-500">{errorsAssignment.description.message}</span>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => resetAssignment()}>
                    Reset
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Publish Assignment"
                    )}
                  </Button>
                </div>
              </motion.form>
            )}

            {activeTab === "announcement" && (
              <motion.form
                key="announcement"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmitAnnouncement(onSubmitAnnouncement)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="announce-title">Announcement Title</Label>
                    <Input
                      id="announce-title"
                      placeholder="e.g. Schedule Change or Guest Lecture"
                      {...registerAnnouncement("title", { required: "Title is required" })}
                    />
                    {errorsAnnouncement.title && (
                      <span className="text-xs text-red-500">{errorsAnnouncement.title.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="announce-course">Course Target</Label>
                    <Controller
                      name="course"
                      control={controlAnnouncement}
                      rules={{ required: "Course is required" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select course"} />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course._id} value={course.name}>
                                {course.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errorsAnnouncement.course && (
                      <span className="text-xs text-red-500">{errorsAnnouncement.course.message}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="announce-content">Announcement Body</Label>
                  <Textarea
                    id="announce-content"
                    placeholder="Broadcast class reminders, homework notifications, or links to references..."
                    rows={6}
                    {...registerAnnouncement("content", { required: "Content is required" })}
                  />
                  {errorsAnnouncement.content && (
                    <span className="text-xs text-red-500">{errorsAnnouncement.content.message}</span>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => resetAnnouncement()}>
                    Reset
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Broadcasting...
                      </>
                    ) : (
                      "Broadcast Announcement"
                    )}
                  </Button>
                </div>
              </motion.form>
            )}

            {activeTab === "timetable" && (
              <motion.form
                key="timetable"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmitTimetable(onSubmitTimetable)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject / Session Topic</Label>
                    <Input
                      id="subject"
                      placeholder="e.g. Advanced Calculus Recitation"
                      {...registerTimetable("subject", { required: "Subject is required" })}
                    />
                    {errorsTimetable.subject && (
                      <span className="text-xs text-red-500">{errorsTimetable.subject.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time-course">Select Course</Label>
                    <Controller
                      name="course"
                      control={controlTimetable}
                      rules={{ required: "Course is required" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select course"} />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course._id} value={course.name}>
                                {course.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errorsTimetable.course && (
                      <span className="text-xs text-red-500">{errorsTimetable.course.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Date & Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      {...registerTimetable("startTime", { required: "Start Time is required" })}
                    />
                    {errorsTimetable.startTime && (
                      <span className="text-xs text-red-500">{errorsTimetable.startTime.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Date & Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      {...registerTimetable("endTime", { required: "End Time is required" })}
                    />
                    {errorsTimetable.endTime && (
                      <span className="text-xs text-red-500">{errorsTimetable.endTime.message}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => resetTimetable()}>
                    Reset
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Scheduling...
                      </>
                    ) : (
                      "Schedule Class Slot"
                    )}
                  </Button>
                </div>
              </motion.form>
            )}

            {activeTab === "resource" && (
              <motion.form
                key="resource"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmitResource(onSubmitResource)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="res-course">Classroom / Course Category</Label>
                  <Controller
                    name="course"
                    control={controlResource}
                    rules={{ required: "Classroom course is required" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select target category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course._id} value={course.name}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errorsResource.course && (
                    <span className="text-xs text-red-500">{errorsResource.course.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Resource Document File</Label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-indigo-500 bg-indigo-50/50"
                        : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/30"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                      <UploadCloud className="w-12 h-12 text-slate-400" />
                      {uploadedFile ? (
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-slate-700">
                            Drag & drop file here, or click to browse
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            PDF, Word, Excel, Slide decks, zip, and raw materials accepted.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setUploadedFile(null);
                      resetResource();
                    }}
                  >
                    Clear
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Uploading to Cloud...
                      </>
                    ) : (
                      "Upload Document File"
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TeacherCreate;
