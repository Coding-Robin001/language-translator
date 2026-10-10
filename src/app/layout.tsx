import type { Metadata } from "next";
import "./globals.css";
import { fraunces, inter } from "@/lib/fonts";
// import NavbarWrapper from "@/components/navbarWrapper";
import NextTopLoader from "nextjs-toploader";
// import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Translator",
  description: "AI powered language translator",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        {/* <NavbarWrapper /> */}
        <NextTopLoader />
        <main>{children}</main>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
