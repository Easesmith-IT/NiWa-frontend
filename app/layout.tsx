import type { Metadata } from "next";
import { ReactNode } from "react";

import { Providers } from "../components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "NiWa Console",
  description: "Internal console for Meta WhatsApp Business Cloud API operations.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
