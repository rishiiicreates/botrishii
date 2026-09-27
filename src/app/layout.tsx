import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const centraNo2 = localFont({
  src: [
    {
      path: "../fonts/CentraNo2-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/CentraNo2-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/CentraNo2-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-centra",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mind Robotics — Universally Capable Industrial Robots",
  description:
    "Mind Robotics builds intelligent, broadly capable robots for industrial deployment in high-impact environments, learning from live production line work.",
  keywords: [
    "Mind Robotics",
    "Physical Intelligence",
    "Industrial Robotics",
    "Foundation Models",
    "Factory Automation",
    "Automotive AI",
  ],
  openGraph: {
    title: "Mind Robotics — Universally Capable Robots",
    description:
      "Mind Robotics builds intelligent, broadly capable robots for industrial deployment in high-impact environments.",
    images: ["/share-image.png"],
    type: "website",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" className={`${centraNo2.variable} antialiased`}>
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen flex flex-col font-sans selection:bg-[#299093] selection:text-white">
        {children}
      </body>
    </html>
  );
}
