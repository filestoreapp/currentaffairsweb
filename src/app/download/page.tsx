import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import DownloadUI from "@/components/site/DownloadUI";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Downloader",
  // Personal tool: keep it out of search engines and unlinked from the nav.
  robots: { index: false, follow: false },
};

export default function DownloadPage() {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-[60vh] w-full max-w-2xl px-4 py-10">
        <DownloadUI />
      </main>
      <Footer />
    </>
  );
}
