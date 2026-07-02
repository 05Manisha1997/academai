import type { Metadata } from "next";

import "./globals.css";



export const metadata: Metadata = {

  title: "academAI | Become AI smart",

  description:

    "Learn, practice, and prevent — AI literacy for everyone with friendly lessons, Spot the Scam, and guardrailed Prompt Sandbox.",

  icons: {

    icon: "/brand/academai-logo.png",

  },

};



export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {

  return (

    <html lang="en">

      <body>{children}</body>

    </html>

  );

}


