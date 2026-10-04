import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Malayalam } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

// Google Analytics 4 Measurement ID — paste yours here
// (Google Analytics → Admin → Data Streams → Measurement ID, looks like G-XXXXXXXXXX).
// The ID is public by design (it ships in the page source), so hardcoding is fine.
const GA_MEASUREMENT_ID = "G-SYKQ45D0KZ";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const notoMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  variable: "--font-malayalam",
  display: "swap",
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "PSC Current Affairs";
const siteUrl = "https://www.psccurrentaffairs.online";

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
    "LDC exam Kerala",
    "LGS exam Kerala",
    "University Assistant exam",
    "Police Constable exam Kerala",
    "Secretariat Assistant exam",
    "KAS exam Kerala",
    "Kerala PSC study material",
    "PSC general knowledge",
    "Kerala PSC rank list",
    "PSC cut off marks",
    "Kerala PSC exam date",
    "PSC one time registration",
  ],
  authors: [{ name: siteName }],
  alternates: {
    canonical: siteUrl,
    types: {
      "application/rss+xml": "/rss.xml",
    },
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
  other: {
    // AdSense site-ownership verification (2026-10-02)
    "google-adsense-account": "ca-pub-8237109269595968",
    // Google Search Console site verification (2026-10-05)
    "google-site-verification": "DnWIUiJzxkIidUfURfxQDRkEBhBpySvI2WD25FNBX7Q",
  },
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
    <html lang="en" className={`${jakarta.variable} ${notoMalayalam.variable}`}>
      <body className="bg-slate-50 font-sans text-slate-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        {GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
      </body>
    </html>
  );
}
