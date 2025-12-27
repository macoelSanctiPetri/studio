"use client";

import { useLanguage } from "@/context/language-context";
import Autoplay from "embla-carousel-autoplay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useRef, useState } from "react";
import Image from "next/image";

const photos = [
  { src: "/fotos/foto_actual.jpeg", alt: "Coro Nova Mvsica - foto actual" },
  { src: "/fotos/foto_actual_2.jpeg", alt: "Coro Nova Mvsica - foto actual 2" },
  { src: "/fotos/foto_actual_3.jpeg", alt: "Coro Nova Mvsica - foto actual 3" },
  { src: "/fotos/coro_viena.jpg", alt: "Coro Nova Mvsica en Viena" },
];

type PhotosCarouselProps = {
  embedded?: boolean;
};

export default function PhotosCarousel({ embedded = false }: PhotosCarouselProps) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const autoplay = useRef(
    Autoplay({
      delay: 2600,
      stopOnInteraction: true,
    })
  );

  const heading = embedded ? null : (
    <>
      <div className="w-10 h-0.5 bg-secondary mb-4" />
      <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-3">
        {language === "es" ? "Fotos" : "Photos"}
      </h2>
      <p className="text-lg text-secondary-foreground font-body mb-8">
        {language === "es"
          ? "Una selección rápida de imágenes recientes del coro."
          : "A quick selection of recent choir photos."}
      </p>
    </>
  );

  const content = (
    <>
      {heading}

      <div
        className="rounded-2xl border bg-card shadow-sm"
        style={{
          borderColor: "rgba(200,164,90,0.8)",
          boxShadow: "0 0 0 2px rgba(200,164,90,0.28), 0 12px 32px rgba(0,0,0,0.14)",
        }}
      >
        <Carousel
          plugins={[autoplay.current]}
          opts={{ loop: true }}
          setApi={setApi}
          className="relative"
        >
          <CarouselContent>
            {photos.map((photo, idx) => (
              <CarouselItem key={idx} className="basis-full md:basis-1/2">
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrent(idx);
                      setOpen(true);
                    }}
                    className="group block overflow-hidden rounded-xl border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(46,45%,54%)]"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={1200}
                      height={800}
                      className="h-80 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  </button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-4 grid place-items-center w-full pb-4">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900/90 text-white shadow-lg ring-2 ring-[hsl(46,45%,54%)] transition hover:scale-105 hover:shadow-2xl hover:ring-[hsl(46,45%,54%)]/80 border-none"
                aria-label={language === "es" ? "Anterior" : "Previous"}
              >
                <span className="text-xl leading-none">‹</span>
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900/90 text-white shadow-lg ring-2 ring-[hsl(46,45%,54%)] transition hover:scale-105 hover:shadow-2xl hover:ring-[hsl(46,45%,54%)]/80 border-none"
                aria-label={language === "es" ? "Siguiente" : "Next"}
              >
                <span className="text-xl leading-none">›</span>
              </button>
            </div>
          </div>
        </Carousel>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-5xl bg-background text-foreground border border-border/60">
          <DialogHeader>
            <DialogTitle>{language === "es" ? "Fotos" : "Photos"}</DialogTitle>
          </DialogHeader>
          <Carousel
            plugins={[autoplay.current]}
            opts={{ loop: true, startIndex: current }}
            className="relative mt-2"
          >
            <CarouselContent>
              {photos.map((photo, idx) => (
                <CarouselItem key={idx} className="basis-full">
                  <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={1600}
                      height={1066}
                      className="h-[70vh] w-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );

  if (embedded) {
    return (
      <div id="photos" className="bg-background">
        <div className="py-2">{content}</div>
      </div>
    );
  }

  return (
    <section id="photos" className="bg-background py-24 sm:py-32">
      <div className="container mx-auto max-w-6xl px-6 lg:px-8">
        {content}
      </div>
    </section>
  );
}
