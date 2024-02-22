import type { Metadata } from "next";
import { Anek_Bangla } from "next/font/google";
import "./globals.css";
import TanStackProvider from "@/components/TanStackProvider";
import { ContextProvider } from "@/components/ContextProvider";
import { Toaster } from "react-hot-toast";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";

const inter = Anek_Bangla({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin DashBoard Arafat Foundation",
  description: "Generated by Rakibul Hasan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TanStackProvider>
          <ContextProvider>
            <NextSSRPlugin
              routerConfig={extractRouterConfig(ourFileRouter)}
            />
            {children}
            <Toaster />
          </ContextProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
