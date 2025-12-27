import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HeroProvider } from "../providers/Hero";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SquadSpeak",
  description:
    "SquadSpeak - connect and communicate with your team seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json"></link>
        <link
          rel="icon"
          href="/favicon.ico?favicon.ico"
          sizes="48x48"
          type="image/x-icon"
        ></link>
        <link
          rel="icon"
          href="/icon0.svg?icon0.svg"
          sizes="any"
          type="image/svg+xml"
        ></link>
        <link
          rel="icon"
          href="/icon1.png?icon1.png"
          sizes="96x96"
          type="image/png"
        ></link>
        <link
          rel="apple-touch-icon"
          href="/apple-icon.png?apple-icon.22c81a72.png"
          sizes="180x180"
          type="image/png"
        ></link>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HeroProvider>
          <main className="orange-light text-foreground min-h-screen">
            {children}
          </main>
        </HeroProvider>
      </body>
    </html>
  );
}
