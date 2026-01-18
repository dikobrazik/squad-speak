import type { PropsWithChildren } from "react";
import { Sidebar } from "../components/Sidebar";

export default function RoomLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}
