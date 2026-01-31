"use client";

import { Button } from "@heroui/button";
import { useMutation } from "@tanstack/react-query";
import { authorizeDevice } from "api";
import { LoadingPage } from "components/LoadingPage";
import { redirect, useSearchParams } from "next/navigation";

export default function AddDevicePage() {
  const searchParams = useSearchParams();

  const {
    mutate: mutateAuthorizeDevice,
    isPending,
    isSuccess,
  } = useMutation({
    mutationKey: ["authorize-device"],
    mutationFn: authorizeDevice,
  });

  const onAllowPress = () => {
    const telegramBotUrlString = searchParams.get("t");
    if (!telegramBotUrlString) redirect("/app");

    const botUrl = new URL(telegramBotUrlString);
    const startParam = botUrl.searchParams.get("start");

    if (!startParam) {
      redirect("/app");
    }

    const [_, sessionId, rememberMe] = startParam.split("_");

    mutateAuthorizeDevice({ sessionId, rememberMe: Boolean(rememberMe) });
  };

  const onDenyPress = () => {
    close();
  };

  if (isPending) {
    return <LoadingPage />;
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col h-screen justify-center items-center">
        <h2 className="text-center text-xl text-white">
          Device authorized successfully!
        </h2>
        <h2 className="mt-4 text-center text-lg text-gray-300">
          You can now close this window.
        </h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen justify-between items-center">
      <div></div>
      <h2 className="text-center text-xl text-white">
        Allow this device to access your account?
      </h2>
      <div className="w-full p-5 mt-3 flex  gap-4">
        <Button fullWidth color="primary" onPress={onAllowPress} size="lg">
          Allow
        </Button>
        <Button fullWidth color="danger" onPress={onDenyPress} size="lg">
          Deny
        </Button>
      </div>
    </div>
  );
}
