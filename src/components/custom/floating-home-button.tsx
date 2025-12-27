"use client";
import { ArrowUp } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export default function FloatingHomeButton() {
  // Start at 0 to avoid hydration mismatch; set real value on mount.
  const [y, setY] = useState<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // set initial position after hydration
    setY(window.innerHeight * 0.75);
    const handleMove = (e: MouseEvent) => {
      const targetY = Math.min(Math.max(e.clientY, 80), window.innerHeight - 80);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setY(targetY));
    };
    window.addEventListener('mousemove', handleMove);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  return (
    <a
      href="#home"
      aria-label="Volver al inicio"
      style={{ top: y, right: 24, transform: 'translateY(-50%)' }}
      className="fixed z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900/90 text-white shadow-lg ring-2 ring-[hsl(46,45%,54%)] transition hover:scale-105 hover:shadow-2xl hover:ring-[hsl(46,45%,54%)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(46,45%,54%)] focus-visible:ring-offset-neutral-900"
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </a>
  );
}
