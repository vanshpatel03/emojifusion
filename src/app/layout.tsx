import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emoji Alchemist",
  description: "Fuse two emojis to create a brand-new, AI-generated emoji!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />

        {/* 🔹 Adsterra Social Bar (loads on every page) */}
        <script
          type="text/javascript"
          src="//pl27455032.profitableratecpm.com/48/9b/88/489b88e3b25a6a1af849203be50469ec.js"
          async
        ></script>
      </body>
    </html>
  );
}
