import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';

export default function EventsSection() {
  const { language } = useLanguage();
  const t = translations[language].eventsSection;

  const events = t.events.map((eventData, index) => {
    const p = PlaceHolderImages.find(p => p.id === eventData.imageId);
    return {
      ...eventData,
      image: p ? {
        url: p.imageUrl,
        description: language === 'es' ? p.description : (p.alt_en || p.description),
        hint: p.imageHint
      } : undefined
    }
  });

  return (
    <section id="events" className="bg-primary text-primary-foreground py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="w-10 h-0.5 bg-secondary mb-4"></div>
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-primary-foreground font-body">
            {t.description}
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
              <article key={event.title} className="flex flex-col items-start">
                <div className="relative w-full">
                  {event.image && (
                    <Image
                      src={event.image.url}
                      alt={event.image.description}
                      width={800}
                      height={600}
                      className="aspect-[4/3] w-full object-cover"
                      data-ai-hint={event.image.hint}
                    />
                  )}
                </div>
                <div className="mt-6 w-full">
                  <p className="text-xs uppercase tracking-wider text-primary-foreground/70 font-headline">
                    {event.date}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold leading-6 font-headline">
                      {event.title}
                  </h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-primary-foreground font-body">
                    {event.description}
                  </p>
                  <Button variant="link" className="p-0 h-auto mt-4 text-accent rounded-none">
                    {t.moreInfo}
                  </Button>
                </div>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}
