import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import AuthProvider from "./providers";
import Navbar from "./components/Navbar";
import ProfileGuard from "./components/ProfileGuard";
import { NotificationProvider } from "./components/NotificationProvider";
import ProposalAcceptedModal from "./components/modals/ProposalAcceptedModal";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eternity - Find Your Forever",
  description: "Modern matrimony platform for meaningful connections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased selection:bg-rose-100 selection:text-rose-900 bg-slate-50`}
      >
        <AuthProvider>
          <NotificationProvider>
            <ProposalAcceptedModal />
            <ProfileGuard>
              <Navbar />
              <main className="min-h-screen pt-16">
                {children}
              </main>
            </ProfileGuard>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
