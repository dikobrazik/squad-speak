import { Providers } from "@/src/providers";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Providers>
      <main className="orange-light text-foreground bg-background">
        {children}
      </main>
    </Providers>
  );
}
