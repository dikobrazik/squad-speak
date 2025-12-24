import { HeroUIProvider } from "@heroui/react";
import type { PropsWithChildren } from "react";
import { AuthProvider } from "./Auth";
import { QueryProvider } from "./Query";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <HeroUIProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </HeroUIProvider>
  );
};
