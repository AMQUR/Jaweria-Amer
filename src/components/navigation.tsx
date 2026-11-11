"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { siteConfig } from "@/lib/data";
import { ENROL_NOW_URL, getWhatsAppUrl } from "@/lib/contact";
import { trackEvent, trackWhatsAppClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Arrow } from "@/components/editorial/arrow";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // The wordmark is the Home link on wide screens; the sheet keeps Home explicit.
  const desktopLinks = siteConfig.navigation.filter((item) => item.href !== "/");

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-ink/10 bg-paper/90 shadow-[0_1px_0_rgba(31,14,17,0.04)] backdrop-blur-md"
          : "border-ink/10 bg-paper",
      )}
    >
      <nav className="ed-wrap" aria-label="Main">
        <div className="flex h-16 items-center justify-between gap-6 sm:h-[4.25rem]">
          <Link
            href="/"
            className="group flex min-h-11 items-center gap-2.5 font-serif text-[1.15rem] font-bold tracking-[-0.03em] text-ink sm:text-[1.3rem]"
            style={{ fontVariationSettings: '"wdth" 84' }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full bg-crimson transition-transform duration-500 group-hover:scale-125"
              aria-hidden
            />
            {siteConfig.name}
          </Link>

          <div className="hidden items-center gap-9 lg:flex">
            {desktopLinks.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-3 text-[0.95rem] font-semibold transition-colors",
                    "after:absolute after:inset-x-0 after:bottom-1.5 after:h-px after:origin-right after:scale-x-0 after:bg-crimson after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.32,0.72,0,1)]",
                    "hover:text-crimson hover:after:origin-left hover:after:scale-x-100",
                    active
                      ? "text-crimson after:origin-left after:scale-x-100"
                      : "text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={ENROL_NOW_URL}
              onClick={() =>
                trackEvent("registration_cta_click", {
                  surface: "nav_desktop",
                })
              }
              className="ed-btn min-h-11 px-5 text-[0.9rem]"
            >
              Join the Next Batch
              <Arrow />
            </Link>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 active:scale-95 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="ed-shell w-[min(100vw,24rem)] border-0 bg-oxblood p-6 text-paper sm:max-w-none [&_[data-slot=sheet-close]]:text-paper"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="mt-12 flex h-full flex-col">
                <ul className="border-t border-paper/15">
                  {siteConfig.navigation.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.href} className="border-b border-paper/15">
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-14 items-center justify-between py-3 font-serif text-[1.9rem] font-bold leading-none tracking-[-0.035em] transition-colors active:text-[#f0a79d]",
                            active ? "text-[#f0a79d]" : "text-paper",
                          )}
                          style={{ fontVariationSettings: '"wdth" 82' }}
                        >
                          {item.label}
                          <Arrow className="ed-arrow h-5 w-5 opacity-60" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-8 flex flex-col gap-3 pb-10">
                  <Link
                    href={ENROL_NOW_URL}
                    onClick={() => {
                      trackEvent("registration_cta_click", {
                        surface: "nav_mobile_sheet",
                      });
                      setOpen(false);
                    }}
                    className="ed-btn ed-btn-paper ed-btn-lg w-full"
                  >
                    Join the Next Batch
                    <Arrow />
                  </Link>
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackWhatsAppClick({
                        location: "nav_mobile_sheet",
                        variant: "group",
                      })
                    }
                    className="ed-btn ed-btn-ghost w-full text-paper"
                  >
                    Text Miss Jay on WhatsApp
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
