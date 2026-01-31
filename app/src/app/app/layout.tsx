import { Icon } from "components/Icon";
import Image from "next/image";
import Link from "next/link";
import { Providers } from "providers";
import { RoomPasswordStore } from "providers/RoomPasswordStore";
import { SettingsProvider } from "providers/Settings";
import css from "./Layout.module.scss";

export default function Layout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
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
          {modal}
        </RoomPasswordStore>
      </SettingsProvider>
    </Providers>
  );
}
