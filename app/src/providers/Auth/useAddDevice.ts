import { redirect, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export const useIsAddDevicePage = () => {
  const pathname = usePathname();

  const isAddDevicePage = pathname.startsWith("/add-device");

  return { isAddDevicePage };
};

type UseAddDeviceProps = {
  isAuthorizationFetched: boolean;
  isAuthorized: boolean;
  qrUrl: string | null;
};

const botUrlParam = "t";

export const useAddDevicePageUrl = ({
  isAuthorizationFetched,
  isAuthorized,
  qrUrl,
}: UseAddDeviceProps) => {
  const searchParams = useSearchParams();

  const { isAddDevicePage } = useIsAddDevicePage();

  useEffect(() => {
    if (isAuthorizationFetched && !isAuthorized && isAddDevicePage) {
      redirect(decodeURIComponent(searchParams.get(botUrlParam) || "") || "/");
    }
  }, [isAuthorizationFetched, isAuthorized, isAddDevicePage]);

  const addDevicePageUrl = useMemo(
    () =>
      qrUrl
        ? new URL(
            `/add-device?${botUrlParam}=${encodeURIComponent(qrUrl || "")}`,
            window.location.origin,
          ).toString()
        : "",
    [qrUrl],
  );

  return { addDevicePageUrl };
};
