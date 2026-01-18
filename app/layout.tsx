import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import AuthProvider from "./providers";
import NotificationListener from "./components/NotificationListener";
import Navbar from "./components/Navbar";

import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Matrimony App",
  description: "Find your perfect match",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans antialiased text-slate-900`}
      >
        <AuthProvider>
          <NotificationListener />
          <Navbar />
          <main className="min-h-screen relative pt-20 bg-[#fdfcfb]">
            {/* Subtle Background Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.4] mix-blend-multiply transition-opacity duration-500"
              style={{
                backgroundImage: `radial-gradient(#e2e8f0 1px, transparent 1px)`,
                backgroundSize: '32px 32px'
              }}
            />
            <div className="z-10 relative">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
