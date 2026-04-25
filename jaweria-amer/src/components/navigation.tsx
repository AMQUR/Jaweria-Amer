"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { siteConfig } from "@/lib/data";
import { whatsAppGroupUrl } from "@/lib/contact";
import { trackWhatsAppClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = !scrolled && pathname !== "/";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow] duration-200 ease-out",
        scrolled
          ? "border-b border-border/80 bg-white/95 shadow-[0_1px_0_rgba(34,16,18,0.04)] backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-[4.25rem]">
          <Link
            href="/"
            className={cn(
              "font-serif text-lg font-semibold tracking-tight transition-colors sm:text-xl",
              isTransparent ? "text-white" : "text-ink"
            )}
          >
            {siteConfig.name}
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {siteConfig.navigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-sm tracking-[0.04em] transition-colors",
                    isTransparent
                      ? active
                        ? "font-medium text-white"
                        : "text-white/72 hover:text-white"
                      : active
                        ? "font-medium text-ink after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-px after:rounded-full after:bg-brand"
                        : "text-slate hover:text-ink"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="ml-1 flex items-center gap-2 border-l border-border/60 pl-8">
              <Link
                href={whatsAppGroupUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ location: "nav_desktop", variant: "group" })}
                className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] motion-reduce:hover:translate-y-0"
              >
                Join Community
              </Link>
            </div>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                "rounded-2xl p-2 transition-[transform,background-color,color] duration-200 ease-out active:scale-[0.98] md:hidden",
                isTransparent ? "text-white" : "text-ink"
              )}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,20rem)] border-border/60 bg-white p-6">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="mt-10 flex flex-col gap-1">
                {siteConfig.navigation.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded-2xl px-3 py-2.5 text-base tracking-[0.02em] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] motion-reduce:hover:translate-y-0",
                        active ? "bg-muted font-medium text-ink" : "text-slate hover:bg-muted/60 hover:text-ink"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <div className="mt-6 flex flex-col gap-2 border-t border-border/60 pt-6">
                  <Link
                    href={whatsAppGroupUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackWhatsAppClick({ location: "nav_mobile_sheet", variant: "group" });
                      setOpen(false);
                    }}
                    className="rounded-2xl bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] motion-reduce:hover:translate-y-0"
                  >
                    Join WhatsApp Community
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
