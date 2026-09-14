"use client";

import { useEffect, useRef, useState } from "react";

// Reveal orquestado del hero de la home: se dispara una sola vez, la
// primera vez que el hero entra en el viewport (DESIGN.md → Motion).
// Cada hijo directo anima con un pequeño stagger (ver .hero-reveal en
// globals.css); ningún otro bloque de la app anima al hacer scroll.
export function HeroReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`hero-reveal${isVisible ? " is-visible" : ""}`}>
      {children}
    </div>
  );
}
