"use client";

import { ToastProvider } from "@heroui/react";
import type { PropsWithChildren } from "react";
import { AuthProvider } from "./Auth";
import { QueryProvider } from "./Query";
import { SettingsProvider } from "./Settings";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <>
      <ToastProvider />
      <QueryProvider>
        <AuthProvider>
          <SettingsProvider>{children}</SettingsProvider>
        </AuthProvider>
      </QueryProvider>
    </>
  );
};
