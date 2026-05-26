import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/modules/student/services/student.service";

export const useStudentAssignmentsQuery = () => {
  return useQuery({
    queryKey: ["student", "assignments"],
    queryFn: () => studentService.getAssignments(),
  });
};

export const useStudentAnnouncementsQuery = () => {
  return useQuery({
    queryKey: ["student", "announcements"],
    queryFn: () => studentService.getAnnouncements(),
  });
};

export const useStudentAttendanceQuery = (course, startDate, endDate) => {
  return useQuery({
    queryKey: ["student", "attendance", course, startDate, endDate],
    queryFn: () => studentService.getMyAttendance(course, startDate, endDate),
    enabled: !!course,
  });
};

export const useStudentInvitationsQuery = () => {
  return useQuery({
    queryKey: ["student", "invitations"],
    queryFn: () => studentService.getInvitations(),
  });
};

export const useAcceptInvitationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId) => studentService.acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "invitations"] });
    },
  });
};
