import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "PSC Current Affairs";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const description =
  "Daily Kerala PSC current affairs, GK updates, practice quizzes and official notification tracking to help you crack your government job exam.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Daily Kerala PSC Current Affairs`,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: [
    "Kerala PSC",
    "PSC current affairs",
    "Kerala PSC notifications",
    "PSC exam programme",
    "PSC syllabus",
    "PSC quiz",
  ],
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} - Daily Kerala PSC Current Affairs`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Daily Kerala PSC Current Affairs`,
    description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="bg-slate-50 font-sans text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
