"use client";

import { useLanguage } from "@/context/language-context";
import { translations } from "@/lib/translations";
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
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const photos = [
  { src: "/carrusel/foto_actual.jpeg", alt: "Coro Nova Mvsica - foto actual" },
  { src: "/carrusel/foto_actual_2.jpeg", alt: "Coro Nova Mvsica - foto actual 2" },
  { src: "/carrusel/foto_actual_3.jpeg", alt: "Coro Nova Mvsica - foto actual 3" },
  { src: "/carrusel/coro_viena.jpg", alt: "Coro Nova Mvsica en Viena" },
];

export default function PhotosCarousel() {
  const { language } = useLanguage();
  const t = translations[language].contactSection;
  const plugin = useRef(
    Autoplay({
      delay: 2800,
      stopOnInteraction: true,
    })
  );
  const [open, setOpen] = useState(false);

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
    if (window.location.hash === "#photos") {
      openModal();
    }
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
      {/* ancla para #photos */}
      <div id="photos" className="sr-only" aria-hidden />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-5xl bg-background text-foreground border border-border/60">
          <DialogHeader>
            <DialogTitle>{language === "es" ? "Fotos" : "Photos"}</DialogTitle>
            <DialogDescription>
              {language === "es"
                ? "Algunas instantáneas recientes del coro."
                : "A few recent snapshots of the choir."}
            </DialogDescription>
          </DialogHeader>

          <Carousel plugins={[plugin.current]} className="relative mt-4">
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
            <CarouselPrevious className="left-2 z-20 bg-black/60 text-white hover:bg-black/80 border-none h-10 w-10" />
            <CarouselNext className="right-2 z-20 bg-black/60 text-white hover:bg-black/80 border-none h-10 w-10" />
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
}
