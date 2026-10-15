import type { Metadata } from "next";
import "./globals.css";
import { fraunces, inter } from "@/lib/fonts";
// import NavbarWrapper from "@/components/navbarWrapper";
import NextTopLoader from "nextjs-toploader";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "Translator",
  description: "AI powered language translator",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <NextTopLoader />
        <Navbar/>
        <main>{children}</main>
      </body>
    </html>
  );
}
