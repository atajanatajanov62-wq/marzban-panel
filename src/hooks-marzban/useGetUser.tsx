import { fetch } from "service/http";
import { UserApi, UseGetUserReturn } from "types/User";
import { useQuery } from "react-query";

const fetchUser = async (): Promise<UserApi> => {
  return await fetch("/admin");
};

const useGetUser = (): UseGetUserReturn => {
  const { data, isError, isLoading, isSuccess, error } = useQuery<UserApi, Error>(
    "current-admin-user",
    fetchUser,
    {
      retry: 1,
      staleTime: 30000,
    }
  );

  const userDataEmpty: UserApi = {
    discord_webook: "",
    is_sudo: true,
    telegram_id: "",
    username: "admin",
  };

  return {
    userData: data || userDataEmpty,
    getUserIsPending: isLoading,
    getUserIsSuccess: isSuccess,
    getUserIsError: isError,
    getUserError: error,
  };
};

export default useGetUser;
