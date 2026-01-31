import { Providers } from "providers";
import type { PropsWithChildren } from "react";

export default function AddDeviceLayout({ children }: PropsWithChildren) {
  return <Providers>{children}</Providers>;
}
