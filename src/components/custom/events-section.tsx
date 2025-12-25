import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';

const events = [
  {
    title: 'Mozart\'s Requiem',
    date: 'October 26, 2024',
    description: 'A soul-stirring performance of Mozart\'s final masterpiece in the historic St. Paul\'s Cathedral.',
    imageId: 'event-cathedral',
  },
  {
    title: 'A Baroque Christmas',
    date: 'December 14, 2024',
    description: 'Celebrate the festive season with works by Bach, Handel, and Vivaldi in a candlelit concert.',
    imageId: 'event-concert-hall',
  },
  {
    title: 'Tallis & Byrd: English Masters',
    date: 'February 8, 2025',
    description: 'Explore the intricate polyphony of the English Renaissance with two of its greatest composers.',
    imageId: 'event-organ',
  },
];

export default function EventsSection() {
  return (
    <section id="events" className="bg-primary text-primary-foreground py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="w-10 h-0.5 bg-secondary mb-4"></div>
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Upcoming Performances
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300 font-body">
            Join us for a season of unforgettable music. Secure your seats for
            these upcoming performances.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const eventImage = PlaceHolderImages.find(img => img.id === event.imageId);
            return (
              <article key={event.title} className="flex flex-col items-start">
                <div className="relative w-full">
                  {eventImage && (
                    <Image
                      src={eventImage.imageUrl}
                      alt={eventImage.description}
                      width={800}
                      height={600}
                      className="aspect-[4/3] w-full object-cover"
                      data-ai-hint={eventImage.imageHint}
                    />
                  )}
                </div>
                <div className="mt-6 w-full">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-headline">
                    {event.date}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold leading-6 font-headline">
                      {event.title}
                  </h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-300 font-body">
                    {event.description}
                  </p>
                  <Button variant="link" className="p-0 h-auto mt-4 text-accent rounded-none">
                    More Info
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
