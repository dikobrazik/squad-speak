"use client";

import { Link } from "@heroui/link";
import { I18n } from "components/I18n";
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
        <SidebarLink href="/app/settings">
          <I18n id="settings.profile" />
        </SidebarLink>
        <SidebarLink href="/app/settings/audio">
          <I18n id="settings.audio" />
        </SidebarLink>
        <SidebarLink href="/app/settings/sessions">
          <I18n id="settings.activeSessions" />
        </SidebarLink>
      </div>
      <div className="p-3">{children}</div>
    </>
  );
}
