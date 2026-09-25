import { Suspense } from "react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import ViewTracker from "@/components/site/ViewTracker";
import NavigationProgress from "@/components/site/NavigationProgress";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <ViewTracker />
      <Header />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
