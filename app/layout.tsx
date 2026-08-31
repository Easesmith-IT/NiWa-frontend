import type { Metadata } from "next";
import { ReactNode } from "react";

import { Providers } from "../components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "NiWa Console",
  description: "Internal console for Meta WhatsApp Business Cloud API operations.",
  icons: {
    icon: "/niwa-logo.png",
    shortcut: "/niwa-logo.png",
    apple: "/niwa-logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
