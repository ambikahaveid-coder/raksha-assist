import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { clearAuthToken } from "@/lib/csrf";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: api.auth.getMe,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logout = useMutation({
    mutationFn: async () => {
      try {
        await api.auth.logout();
      } catch (e) {
      }
      clearAuthToken();
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    },
  });

  return {
    user: data?.user || null,
    membership: data?.membership || null,
    familyMembers: data?.familyMembers || [],
    isLoading,
    isAuthenticated: !!data?.user,
    error,
    logout: logout.mutate,
  };
}
