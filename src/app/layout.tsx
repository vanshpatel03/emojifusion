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

        {/* 🔹 Add your Adsterra script here (loads globally) */}
        <script
          type="text/javascript"
          src="YOUR_ADSTERRA_SCRIPT_URL"
          async
        ></script>
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />

        {/* 🔹 Optional: place a global ad container at bottom of body */}
        <div id="adsterra-banner" style={{ textAlign: "center", margin: "20px 0" }}></div>
      </body>
    </html>
  );
}
