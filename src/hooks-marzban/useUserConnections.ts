import { useQuery } from "@tanstack/react-query";
import { fetcher } from "service/http";
import { UserConnection } from "types/User";

export const useUserConnections = (username: string | null) => {
  return useQuery<UserConnection[]>({
    queryKey: ["user-connections", username],
    queryFn: () => fetcher<UserConnection[]>(`/user/${username}/connections`),
    enabled: !!username,
    staleTime: 30_000,
    retry: false,
  });
};
