import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { RootFrame } from "@/components/root-frame";
import "./globals.css";

export const metadata: Metadata = {
  title: "PurchaseIQ",
  description: "Customer purchase pattern intelligence platform",
  icons: {
    icon: "/purchaseiq-logo.png",
    shortcut: "/purchaseiq-logo.png",
    apple: "/purchaseiq-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <ClerkProvider>
          <RootFrame>{children}</RootFrame>
        </ClerkProvider>
      </body>
    </html>
  );
}
