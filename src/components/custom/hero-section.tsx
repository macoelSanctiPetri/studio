import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HeroSection() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-choir');

  return (
    <section id="home" className="relative bg-primary text-primary-foreground">
      <div className="absolute inset-0">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
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
              Music & The Spoken Word
            </p>
            <h1 className="mt-4 font-headline text-4xl font-bold uppercase tracking-tight sm:text-6xl">
              Celebrating Sacred Music
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 font-body">
              Experience the sublime power and beauty of choral music that
              transcends time. Join Sacred Echoes on a journey through centuries
              of divine harmony and vocal excellence.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <Button
                variant="outline"
                className="rounded-none border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                View Schedule
              </Button>
              <Button
                variant="ghost"
                className="rounded-none border border-purple-border text-primary-foreground hover:bg-purple-border/10 hover:text-primary-foreground"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
