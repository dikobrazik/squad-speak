import { useQuery } from "@tanstack/react-query";
import { checkIsAdmin } from "api";
import { LoadingPage } from "components/LoadingPage";
import { type PropsWithChildren, useEffect } from "react";

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
