"use client";

import { useEffect, useRef } from "react";

type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "fade";

export function Reveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  as?: "div" | "section" | "article" | "header" | "span";
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => el.classList.add("reveal-visible");

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      show();
      return;
    }

    if (el.getBoundingClientRect().top <= window.innerHeight + 40) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top <= window.innerHeight) {
            show();
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px 80px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Element = Tag as React.ElementType;

  return (
    <Element
      ref={ref}
      className={`reveal reveal-${variant} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Element>
  );
}
