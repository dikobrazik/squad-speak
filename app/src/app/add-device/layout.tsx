import type { PropsWithChildren } from "react";
import { Providers } from "@/src/providers";

export default function AddDeviceLayout({ children }: PropsWithChildren) {
  return <Providers>{children}</Providers>;
}
