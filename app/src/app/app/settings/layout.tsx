"use client";

import { Link } from "@heroui/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

const SidebarLink = ({
  href,
  children,
}: PropsWithChildren<{ href: string }>) => {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      color={pathname === href ? "primary" : "foreground"}
      className="p-3"
    >
      {children}
    </Link>
  );
};

export default function SettingsLayout({ children }: PropsWithChildren) {
  return (
    <>
      <div className="flex flex-col p-3 border-r-1">
        <SidebarLink href="/app/settings/profile">Profile</SidebarLink>
        <SidebarLink href="/app/settings/audio">Audio</SidebarLink>
        <SidebarLink href="/app/settings/sessions">Active sessions</SidebarLink>
      </div>
      <div className="p-3">{children}</div>
    </>
  );
}
