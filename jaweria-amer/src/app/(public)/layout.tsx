import { Navigation } from "@/components/navigation";
import { StickyWorkshopBar } from "@/components/sticky-workshop-bar";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ScrollToTop } from "@/components/scroll-to-top";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollToTop />
      <Navigation />
      <StickyWorkshopBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
      <WhatsAppButton />
    </>
  );
}
