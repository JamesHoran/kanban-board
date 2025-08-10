"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { NhostProvider } from "@nhost/nextjs";
import { nhost } from "../lib/nhost";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/lib/apolloclient";
import { authTokenVar } from "@/lib/apolloclient";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NhostProvider nhost={nhost}>
          <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
        </NhostProvider>
      </body>
    </html>
  );
}

nhost.auth.onAuthStateChanged((event, session) => {
  if (session) {
    authTokenVar(session.accessToken);
  } else {
    authTokenVar(undefined);
  }
});
