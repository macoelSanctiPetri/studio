import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

export default function HeroSection() {
  const { language } = useLanguage();
  const t = translations[language].heroSection;
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-choir');
  const [modalOpen, setModalOpen] = useState(false);

  // Use the local choir photo placed in /public/imagenes/coro-hero.jpg
  const heroImageUrl = '/imagenes/coro-hero.jpg';
  const imageDescription = language === 'es'
    ? (heroImage?.description || 'El coro NovaMvsica posando en un altar de una iglesia ornamentada.')
    : (heroImage?.alt_en || 'The NovaMvsica choir posing in an ornate church altar.');

  return (
    <section id="home" className="relative bg-primary text-white overflow-hidden">
      {heroImage && (
        <div className="absolute inset-0 z-0">
            <Image
                src={heroImageUrl}
                alt={imageDescription}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-black/35"
              aria-hidden="true"
            />
        </div>
      )}
      <div className="relative container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 min-h-screen content-center">
          <div className="py-24 sm:py-32 lg:py-48 relative z-10">
            <p className="font-headline text-sm uppercase text-yellow-200 tracking-widest drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
              {t.subtitle}
            </p>
            <h1 className="mt-4 font-headline text-4xl font-bold uppercase tracking-tight sm:text-6xl drop-shadow-[0_6px_14px_rgba(0,0,0,0.65)]">
              {t.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-100 font-body drop-shadow-[0_4px_10px_rgba(0,0,0,0.65)]">
              {t.description}
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <Button
                variant="outline"
                className="rounded-none border-2 border-white text-white hover:bg-white hover:text-black"
                onClick={() => setModalOpen(true)}
              >
                {t.programsButton}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">
              {t.programsTitle}
            </DialogTitle>
            <DialogDescription>{t.programsDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-8">
            <section className="space-y-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">{t.cadizProgramTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.cadizProgramMeta}</p>
                <p className="mt-3 text-sm leading-6">{t.cadizProgramIntro}</p>
              </div>
              <iframe
                src="/actuaciones/ACT-2026-MAIDSTONE/programa/ACT-2026-MAIDSTONE_programa-de-mano.pdf#view=FitH"
                title={t.cadizProgramTitle}
                className="h-[min(65vh,700px)] min-h-[360px] w-full border border-border bg-muted"
              />
            </section>
            <section className="space-y-4 border-t border-border pt-8">
              <div>
                <h3 className="font-headline text-xl font-semibold">{t.jerezProgramTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.jerezProgramMeta}</p>
                <p className="mt-3 text-sm leading-6">{t.jerezProgramIntro}</p>
              </div>
              <iframe
                src="/actuaciones/ACT-2026-35ANIV/programa/ACT-2026-35ANIV_programa-de-mano.pdf#view=FitH"
                title={t.jerezProgramTitle}
                className="h-[min(65vh,700px)] min-h-[360px] w-full border border-border bg-muted"
              />
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
