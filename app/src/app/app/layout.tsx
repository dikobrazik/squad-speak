import Image from "next/image";
import Link from "next/link";
import { Providers } from "@/src/providers";
import { RoomPasswordStore } from "@/src/providers/RoomPasswordStore";
import { Sidebar } from "./components/Sidebar";
import css from "./Layout.module.scss";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Providers>
      <RoomPasswordStore>
        <div className="h-screen overflow-y-hidden">
          <nav className="border-b-1 p-4">
            <Link href="/">
              <Image
                src="/assets/logo.svg"
                alt="SquadSpeak Logo"
                width={128}
                height={72}
                priority
              />
            </Link>
          </nav>
          <div className={css.content}>
            <Sidebar className="w-1/4" />
            <div className="w-3/4 h-full">{children}</div>
          </div>
        </div>
      </RoomPasswordStore>
    </Providers>
  );
}
