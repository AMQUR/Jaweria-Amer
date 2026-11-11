import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared opening for every inner page: ruled margin, a short label, the
 * title as the typographic event, one lead sentence. `aside` sits to the
 * right on wide screens (facts, a portrait, a code).
 */
export function PageIntro({
  label,
  title,
  lead,
  children,
  aside,
  tone = "paper",
  size = "lg",
  className,
}: {
  label?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  tone?: "paper" | "ink";
  size?: "lg" | "md";
  className?: string;
}) {
  return (
    <section className={cn("ed-margin", tone === "ink" ? "ed-ink" : "ed-paper", className)}>
      <div className="ed-wrap grid gap-10 pb-12 pt-10 sm:pb-16 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
        <div className="min-w-0">
          {label ? <p className="ed-label ed-rise">{label}</p> : null}
          <h1
            className={cn(
              "ed-display mt-5",
              size === "lg" ? "text-[clamp(2.6rem,9.5vw,7.25rem)]" : "text-[clamp(2.2rem,6.5vw,4.5rem)]",
            )}
          >
            <span className="ed-line">
              <span>{title}</span>
            </span>
          </h1>
          {lead ? (
            <p className="ed-lead ed-rise mt-6" style={{ ["--d" as string]: "0.15s" }}>
              {lead}
            </p>
          ) : null}
          {children ? (
            <div className="ed-rise mt-8" style={{ ["--d" as string]: "0.25s" }}>
              {children}
            </div>
          ) : null}
        </div>
        {aside ? (
          <div className="ed-rise min-w-0" style={{ ["--d" as string]: "0.3s" }}>
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  );
}
