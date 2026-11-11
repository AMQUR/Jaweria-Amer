import { getBatchAnnouncement } from "@/lib/public-experience";
import { Navigation } from "@/components/navigation";
import { StickyWorkshopBar } from "@/components/sticky-workshop-bar";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ScrollToTop } from "@/components/scroll-to-top";

// Refresh time-sensitive announcements while preserving cached public pages.
export const revalidate = 60;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // `ed-shell` scopes the editorial tokens and motion rules to the public site.
    <div className="ed-shell flex min-h-full flex-1 flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-paper"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <Navigation />
      <StickyWorkshopBar active={true} batch={getBatchAnnouncement()} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <BackToTop />
      <WhatsAppButton />
    </div>
  );
}
