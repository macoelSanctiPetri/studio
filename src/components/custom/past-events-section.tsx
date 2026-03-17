"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';
import { Actuacion, formatFechaLarga, formatHora } from '@/lib/actuaciones';
import { useActuaciones } from '@/lib/use-actuaciones';
import { getFotosFinales, getVideosFinales } from '@/lib/activos';

const PLACEHOLDER = '/actuaciones/PLACEHOLDER/cabecera/placeholder-md.png';

export default function PastEventsSection() {
  const { language } = useLanguage();
  const t = translations[language].pastEventsSection;
  const { data, loading, error } = useActuaciones();

  const events = useMemo(() => {
    if (!data) return [];
    return [...data]
      .filter((a) => a.estado === 'Pasada')
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [data]);

  return (
    <section id="events-past" className="bg-primary text-primary-foreground py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="w-10 h-0.5 bg-secondary mb-4"></div>
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-primary-foreground/80 font-body">
            {t.description}
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {loading && (
            <p className="text-sm text-primary-foreground/80 col-span-full">
              {language === 'es' ? 'Cargando actuaciones...' : 'Loading events...'}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-200 col-span-full">
              {language === 'es' ? `Error: ${error}` : `Error: ${error}`}
            </p>
          )}
          {!loading && !error && events.length === 0 && (
            <p className="text-sm text-primary-foreground/80 col-span-full">
              {language === 'es' ? 'Todavía no hay actuaciones anteriores.' : 'No past events yet.'}
            </p>
          )}
          {events.map((event) => (
            <PastEventCard key={event.id} event={event} moreInfoLabel={t.moreInfo} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PastEventCard({ event, moreInfoLabel }: { event: Actuacion; moreInfoLabel: string }) {
  const [open, setOpen] = useState(false);
  const fotos = getFotosFinales(event.id);
  const videos = getVideosFinales(event.id);
  const cabeceraSrc = event.cabecera_url || PLACEHOLDER;
  const cartelSrc = event.cartel_url || cabeceraSrc;

  return (
    <article className="flex flex-col items-start">
      <div className="relative w-full">
        <Image
          src={cabeceraSrc}
          alt={event.titulo}
          width={800}
          height={600}
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      <div className="mt-6 w-full">
        <p className="text-xs uppercase tracking-wider text-primary-foreground/70 font-headline">
          {formatFechaLarga(event.fecha, event.fecha_visible)} · {formatHora(event.fecha)}
        </p>
        <h3 className="mt-2 text-xl font-semibold leading-6 font-headline">
          {event.id === 'ACT-2026-MAIDSTONE' && event.titulo.includes('Maidstone Singers') ? (
            <>
              {event.titulo.split('Maidstone Singers').map((part, idx, arr) => (
                <React.Fragment key={idx}>
                  {part}
                  {idx < arr.length - 1 ? (
                    <Link
                      href="http://www.themaidstonesingers.org.uk/"
                      target="_blank"
                      className="inline-flex items-center gap-1 text-accent underline"
                    >
                      Maidstone Singers <ExternalLink className="h-4 w-4" />
                    </Link>
                  ) : null}
                </React.Fragment>
              ))}
            </>
          ) : (
            event.titulo
          )}
        </h3>
        <p className="text-sm text-primary-foreground/80">{event.lugar}</p>
        {event.descripcion_corta && event.id !== 'ACT-2026-MAIDSTONE' && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-primary-foreground/85 font-body">
            {event.descripcion_corta}
          </p>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="link" className="p-0 h-auto mt-4 text-accent rounded-none">
              {moreInfoLabel}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg sm:max-w-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">{event.titulo}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {formatFechaLarga(event.fecha, event.fecha_visible)} · {formatHora(event.fecha)} · {event.lugar}
              </p>
            </DialogHeader>
            <div className="space-y-3 text-sm text-foreground">
              {event.descripcion_detalle && (
                <p className="leading-6 text-foreground/90">
                  {event.id === 'ACT-2026-MAIDSTONE' && event.descripcion_detalle.includes('Maidstone Singers') ? (
                    <>
                      {event.descripcion_detalle.split('Maidstone Singers').map((part, idx, arr) => (
                        <React.Fragment key={idx}>
                          {part}
                          {idx < arr.length - 1 ? (
                            <Link
                              href="http://www.themaidstonesingers.org.uk/"
                              target="_blank"
                              className="inline-flex items-center gap-1 text-accent underline"
                            >
                              Maidstone Singers <ExternalLink className="h-4 w-4" />
                            </Link>
                          ) : null}
                        </React.Fragment>
                      ))}
                    </>
                  ) : (
                    event.descripcion_detalle
                  )}
                </p>
              )}
              {event.hora_puertas && (
                <p>
                  <strong>Hora de apertura:</strong> {event.hora_puertas}
                </p>
              )}
              <div className="space-y-1">
                <p className="font-semibold">Lugar</p>
                <p className="text-muted-foreground">{event.lugar}</p>
                {event.map_url && (
                  <Link
                    href={event.map_url}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-accent underline"
                  >
                    Ver en mapa <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </div>
              <Image
                src={cartelSrc}
                alt={`Imagen ${event.titulo}`}
                width={720}
                height={960}
                className="w-full max-w-md mx-auto h-auto object-contain border border-muted"
              />
              <div className="flex flex-wrap gap-3 pt-2">
                {event.tickets_url && (
                  <Link
                    href={event.tickets_url}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-accent underline"
                  >
                    Entradas <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </div>
              {fotos.length > 0 && (
                <div className="pt-3 space-y-2">
                  <p className="font-semibold">Galería</p>
                  <div className="relative">
                    <Carousel opts={{ loop: true }}>
                      <CarouselContent>
                        {fotos.map((f) => (
                          <CarouselItem key={f.id} className="basis-full">
                            <Image
                              src={f.ruta}
                              alt={event.titulo}
                              width={900}
                              height={600}
                              className="w-full h-auto object-cover rounded border border-muted"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2 bg-background/80 shadow-sm border" />
                      <CarouselNext className="right-2 bg-background/80 shadow-sm border" />
                    </Carousel>
                  </div>
                </div>
              )}
              {videos.length > 0 && (
                <div className="pt-3 space-y-2">
                  <p className="font-semibold">Vídeos</p>
                  <div className="relative">
                    <Carousel opts={{ loop: true }}>
                      <CarouselContent>
                        {videos.map((v) => (
                          <CarouselItem key={v.id} className="basis-full">
                            <video src={v.ruta} controls className="w-full rounded border border-muted" />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2 bg-background/80 shadow-sm border" />
                      <CarouselNext className="right-2 bg-background/80 shadow-sm border" />
                    </Carousel>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </article>
  );
}
