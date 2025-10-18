import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AMAOGBU Youth Stakeholders - Join Our Community",
    template: "%s | AMAOGBU Youth Stakeholders",
  },
  description:
    "Join AMAOGBU Youth Stakeholders - A dynamic network of youth leaders aged 15-35 dedicated to community development, innovation, and positive change in AMAOGBU. Register now to connect, contribute, and grow with like-minded changemakers.",
  
  icons: {
    icon: '/favicon-32x32.png',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
