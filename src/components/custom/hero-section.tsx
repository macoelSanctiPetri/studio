import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

export default function HeroSection() {
  const { language } = useLanguage();
  const t = translations[language].heroSection;
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-choir');
  const [modalOpen, setModalOpen] = useState(false);

  // Use the local choir photo placed in /public/coro-hero.jpg
  const heroImageUrl = '/coro-hero.jpg';
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
                {t.button1}
              </Button>
              <Button
                variant="ghost"
                className="rounded-none border border-white/60 text-white hover:bg-white/10 hover:text-white"
                onClick={() => setModalOpen(true)}
              >
                {t.button2}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Próximamente</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <Image
              src="/imagenes/XXXV_Aniversario_No_Disponible.png"
              alt={language === 'es' ? 'Sección no disponible' : 'Section not available yet'}
              width={900}
              height={600}
              className="rounded-xl border border-border shadow-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
