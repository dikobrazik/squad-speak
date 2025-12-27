// app/providers.tsx
"use client";

import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";

// Only if using TypeScript
declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function HeroProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <HeroUIProvider className="min-h-screen" navigate={router.push}>
      {children}
    </HeroUIProvider>
  );
}
