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
  display: "block",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nacreous-one.vercel.app"),
  title: "Rishii — AI Automation Built for Real Work",
  description:
    "Rishii builds AI agents, LLM pipelines, and workflow automation that take over repetitive work, so teams can get back to the interesting parts.",
  keywords: [
    "Rishii",
    "AI Automation",
    "AI Agents",
    "LLM Pipelines",
    "Workflow Automation",
    "Full-Stack AI",
  ],
  openGraph: {
    title: "Rishii — AI Automation Built for Real Work",
    description:
      "Rishii builds AI agents, LLM pipelines, and workflow automation that take over repetitive work, so teams can get back to the interesting parts.",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@600;700&family=Kalam:wght@400;700&family=Patrick+Hand&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans selection:bg-[#299093] selection:text-white">
        {children}
      </body>
    </html>
  );
}
