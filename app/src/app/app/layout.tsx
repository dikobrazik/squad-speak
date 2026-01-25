import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/src/components/Icon";
import { Providers } from "@/src/providers";
import { RoomPasswordStore } from "@/src/providers/RoomPasswordStore";
import { SettingsProvider } from "@/src/providers/Settings";
import css from "./Layout.module.scss";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Providers>
      <SettingsProvider>
        <RoomPasswordStore>
          <div className="h-screen overflow-y-hidden">
            <nav className="border-b-1 p-4 justify-between flex items-center">
              <Link href="/app">
                <Image
                  src="/assets/logo.svg"
                  alt="SquadSpeak Logo"
                  width={128}
                  height={72}
                  priority
                />
              </Link>

              <Link href="/app/settings" className="underline">
                <Icon name="gearThin" />
              </Link>
            </nav>
            <div className={css.content}>{children}</div>
          </div>
        </RoomPasswordStore>
      </SettingsProvider>
    </Providers>
  );
}
