import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import ReactQueryProvider from "@/lib/query-provider";
import "./globals.css";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexusFlow Automation Engine",
  description: "Enterprise-grade Project Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          robotoMono.variable
        )}
      >
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
        <Toaster position="top-right" richColors theme="system" expand={true} visibleToasts={3} closeButton />
      </body>
    </html>
  );
}
