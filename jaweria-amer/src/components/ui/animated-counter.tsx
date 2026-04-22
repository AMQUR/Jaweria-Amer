"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function AnimatedCounter({
  value,
  delay = 0,
}: {
  value: string;
  delay?: number;
}) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement | null>(null);
  const hasAnimated = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runCountUp = useCallback((raw: string) => {
    const digitRun = raw.replace(/\D/g, "");
    if (!digitRun) {
      setDisplay(raw);
      return;
    }
    const numeric = parseInt(digitRun, 10) || 0;
    if (!Number.isFinite(numeric) || (numeric === 0 && !/^0+$/.test(digitRun.trim()))) {
      setDisplay(raw);
      return;
    }
    const suffix = raw.replace(/[0-9]/g, "");

    let start = 0;
    const duration = 1200;
    const stepTime = 16;
    const totalSteps = Math.max(1, Math.floor(duration / stepTime));
    const increment = numeric / totalSteps;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const interval = setInterval(() => {
      start += increment;
      if (start >= numeric) {
        setDisplay(raw);
        clearInterval(interval);
        intervalRef.current = null;
      } else {
        setDisplay(`${Math.floor(start)}${suffix}`);
      }
    }, stepTime);
    intervalRef.current = interval;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const raf = requestAnimationFrame(() => {
        setDisplay(value);
      });
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null;
            runCountUp(value);
          }, delay);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [value, runCountUp, delay]);

  return <span ref={ref}>{display}</span>;
}
