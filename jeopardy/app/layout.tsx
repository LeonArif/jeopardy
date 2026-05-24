import type { Metadata } from "next";
import { Fredoka, Geist_Mono, Lilita_One } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const lilita = Lilita_One({
  variable: "--font-lilita",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jeopardy",
  description: "Host and play Jeopardy-style games in real time.",
  icons: {
    icon: "/logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${lilita.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
