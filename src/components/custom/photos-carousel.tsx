"use client";

import { useLanguage } from "@/context/language-context";
import Autoplay from "embla-carousel-autoplay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const photos = [
  { src: "/carrusel/foto_actual.jpeg", alt: "Coro Nova Mvsica - foto actual" },
  { src: "/carrusel/foto_actual_2.jpeg", alt: "Coro Nova Mvsica - foto actual 2" },
  { src: "/carrusel/foto_actual_3.jpeg", alt: "Coro Nova Mvsica - foto actual 3" },
  { src: "/carrusel/coro_viena.jpg", alt: "Coro Nova Mvsica en Viena" },
];

export default function PhotosCarousel() {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const autoplay = useRef(
    Autoplay({
      delay: 2600,
      stopOnInteraction: true,
    })
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const openModal = () => setOpen(true);
    const clickHandler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href='#photos']");
      if (anchor) {
        e.preventDefault();
        openModal();
        window.history.replaceState(null, "", "#photos");
      }
    };
    if (window.location.hash === "#photos") openModal();
    const onHash = () => {
      if (window.location.hash === "#photos") setOpen(true);
    };
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", clickHandler, true);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", clickHandler, true);
    };
  }, []);

  return (
    <>
      <div id="photos" className="sr-only" aria-hidden />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-5xl bg-background text-foreground border border-border/60">
          <DialogHeader>
            <DialogTitle>{language === "es" ? "Fotos" : "Photos"}</DialogTitle>
            <DialogDescription>
              {language === "es"
                ? "Algunas instantáneas recientes del coro."
                : "A few recent snapshots of the choir."}
            </DialogDescription>
          </DialogHeader>

          <Carousel
            plugins={[autoplay.current]}
            opts={{
              loop: true,
            }}
            setApi={setApi}
            className="relative mt-4"
          >
            <CarouselContent>
              {photos.map((photo, idx) => (
                <CarouselItem key={idx} className="basis-full md:basis-1/2">
                  <div className="p-2">
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        width={1200}
                        height={800}
                        className="h-80 w-full object-cover"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="mt-4 grid place-items-center w-full">
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => api?.scrollPrev()}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900/90 text-white shadow-lg ring-2 ring-[hsl(46,45%,54%)] transition hover:scale-105 hover:shadow-2xl hover:ring-[hsl(46,45%,54%)]/80 border-none"
                  aria-label="Anterior"
                >
                  <span className="text-xl leading-none">‹</span>
                </button>
                <button
                  type="button"
                  onClick={() => api?.scrollNext()}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900/90 text-white shadow-lg ring-2 ring-[hsl(46,45%,54%)] transition hover:scale-105 hover:shadow-2xl hover:ring-[hsl(46,45%,54%)]/80 border-none"
                  aria-label="Siguiente"
                >
                  <span className="text-xl leading-none">›</span>
                </button>
              </div>
            </div>
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
}
