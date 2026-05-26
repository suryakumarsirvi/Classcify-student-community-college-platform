import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "@/modules/auth/services/auth.service";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (userData) => authService.register(userData),
  });
};

export const useUpdateProfileMutation = () => {
  return useMutation({
    mutationFn: (userData) => authService.updateUser(userData),
  });
};

export const useProfileQuery = (role, enabled) => {
  return useQuery({
    queryKey: ["profile", role],
    queryFn: () => authService.getProfile(role),
    enabled: !!role && enabled,
  });
};
