"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import type { PropsWithChildren } from "react";
import { AuthProvider } from "./Auth";
import { QueryProvider } from "./Query";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <HeroUIProvider>
      <ToastProvider />
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </HeroUIProvider>
  );
};
