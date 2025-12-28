import Image from "next/image";
import Link from "next/link";
import { Providers } from "@/src/providers";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Providers>
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
        {children}
      </div>
    </Providers>
  );
}
