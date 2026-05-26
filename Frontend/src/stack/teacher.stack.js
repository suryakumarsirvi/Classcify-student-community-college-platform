import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherService } from "@/modules/teacher/services/teacher.service";

export const useTeacherCoursesQuery = () => {
  return useQuery({
    queryKey: ["teacher", "courses"],
    queryFn: () => teacherService.getTeacherCourses(),
  });
};

export const useTeacherTimetableQuery = () => {
  return useQuery({
    queryKey: ["teacher", "timetable"],
    queryFn: () => teacherService.getTimetable(),
  });
};

export const useCreateTimetableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => teacherService.createTimetable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "timetable"] });
    },
  });
};

export const useTeacherAssignmentsQuery = () => {
  return useQuery({
    queryKey: ["teacher", "assignments"],
    queryFn: () => teacherService.getAssignments(),
  });
};

export const useCreateAssignmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => teacherService.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "assignments"] });
    },
  });
};

export const useTeacherAnnouncementsQuery = () => {
  return useQuery({
    queryKey: ["teacher", "announcements"],
    queryFn: () => teacherService.getAnnouncements(),
  });
};

export const useCreateAnnouncementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => teacherService.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "announcements"] });
    },
  });
};

export const useTeacherResourcesQuery = () => {
  return useQuery({
    queryKey: ["teacher", "resources"],
    queryFn: () => teacherService.getResources(),
  });
};

export const useUploadResourceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => teacherService.uploadResource(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "resources"] });
    },
  });
};

export const useClassroomStudentsQuery = (classroom) => {
  return useQuery({
    queryKey: ["teacher", "classroom", classroom, "students"],
    queryFn: () => teacherService.getClassroomStudents(classroom),
    enabled: !!classroom,
  });
};
