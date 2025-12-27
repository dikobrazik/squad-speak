"use client";

import { ToastProvider } from "@heroui/react";
import type { PropsWithChildren } from "react";
import { AuthProvider } from "./Auth";
import { QueryProvider } from "./Query";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <>
      <ToastProvider />
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </>
  );
};
