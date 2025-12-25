import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';

export default function HeroSection() {
  const { language } = useLanguage();
  const t = translations[language].heroSection;
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-choir');
  const imageDescription = language === 'es' 
    ? (heroImage?.description || 'El coro NovaMvsica posando en un altar de una iglesia ornamentada.')
    : (heroImage?.alt_en || 'The NovaMvsica choir posing in an ornate church altar.');

  return (
    <section id="home" className="relative bg-primary text-primary-foreground">
      <div className="absolute inset-0">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={imageDescription}
            fill
            className="object-cover"
            data-ai-hint={heroImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-primary/80" />
      </div>
      <div className="relative container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 min-h-screen content-center">
          <div className="py-24 sm:py-32 lg:py-48">
            <p className="font-headline text-sm uppercase text-accent tracking-widest">
              {t.subtitle}
            </p>
            <h1 className="mt-4 font-headline text-4xl font-bold uppercase tracking-tight sm:text-6xl">
              {t.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 font-body">
              {t.description}
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <Button
                variant="outline"
                className="rounded-none border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                {t.button1}
              </Button>
              <Button
                variant="ghost"
                className="rounded-none border border-purple-border text-primary-foreground hover:bg-purple-border/10 hover:text-primary-foreground"
              >
                {t.button2}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
