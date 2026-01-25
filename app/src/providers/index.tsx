"use client";

import { ToastProvider } from "@heroui/react";
import { type PropsWithChildren, Suspense } from "react";
import { AuthProvider } from "./Auth";
import { QueryProvider } from "./Query";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <>
      <ToastProvider />
      <Suspense>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </Suspense>
    </>
  );
};
