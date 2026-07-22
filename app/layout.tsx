import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Through Her Eyes",
  description: "An adjustable, live-camera approximation of low vision.",
  applicationName: "Through Her Eyes",
  openGraph: {
    title: "Through Her Eyes",
    description: "An adjustable low-vision camera experience",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Through Her Eyes",
    description: "An adjustable low-vision camera experience",
  },
  appleWebApp: {
    capable: true,
    title: "Through Her Eyes",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#37193d" />
      </head>
      <body>{children}</body>
    </html>
  );
}
