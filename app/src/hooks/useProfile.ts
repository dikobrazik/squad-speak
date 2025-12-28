import { useQuery } from "@tanstack/react-query";
import { getProfile, getProfilePhotoUrl } from "../api/telegram";

export const useProfile = (userId: string) => {
  const { data, ...queryParams } = useQuery({
    queryKey: ["telegram", "profile", userId],
    queryFn: () => getProfile(userId),
  });

  return {
    profile: {
      ...data,
      photoUrl: data ? getProfilePhotoUrl(data.user_id) : null,
    },
    ...queryParams,
  };
};
