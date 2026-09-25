import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import NotFoundContent from "@/components/site/NotFoundContent";

// Root-level 404: catches URLs that match no route at all (e.g. /typo-link).
// The (site)/not-found.tsx handles notFound() calls inside the site group.
export default function GlobalNotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-4 py-8">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
