import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
