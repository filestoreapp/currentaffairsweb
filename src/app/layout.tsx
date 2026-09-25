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

const ogImage = {
  url: "/og-default.png",
  width: 1200,
  height: 630,
  alt: `${siteName} — Daily Kerala PSC Current Affairs`,
};

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
    "Kerala PSC mock test",
    "PSC previous year questions",
  ],
  authors: [{ name: siteName }],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    siteName,
    url: siteUrl,
    locale: "en_IN",
    title: `${siteName} - Daily Kerala PSC Current Affairs`,
    description,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Daily Kerala PSC Current Affairs`,
    description,
    images: [ogImage.url],
  },
  robots: { index: true, follow: true },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description,
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="bg-slate-50 font-sans text-slate-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
