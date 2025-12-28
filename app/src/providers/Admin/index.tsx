import { useQuery } from "@tanstack/react-query";
import { type PropsWithChildren, useEffect } from "react";
import { checkIsAdmin } from "@/src/api";
import { LoadingPage } from "@/src/components/LoadingPage";

export const AdminGuardProvider = ({ children }: PropsWithChildren) => {
  const { isFetching, isFetched, error } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: checkIsAdmin,
  });

  useEffect(() => {
    if (isFetched && error) {
      window.location.href = "/";
    }
  }, []);

  if (isFetching) {
    return <LoadingPage />;
  }

  return children;
};
