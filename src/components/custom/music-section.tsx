import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';

export default function MusicSection() {
    const { language } = useLanguage();
    const t = translations[language].musicSection;
    const musicImage = PlaceHolderImages.find(p => p.id === 'music-sheets');
    const imageDescription = language === 'es' 
        ? (musicImage?.description || 'Partituras en un atril.')
        : (musicImage?.alt_en || 'Sheet music on a stand.');

  return (
    <section id="music" className="relative overflow-hidden bg-background py-24 sm:py-32">
        {musicImage && (
            <Image
              src={musicImage.imageUrl}
              alt=""
              fill
              className="pointer-events-none select-none object-cover opacity-[0.15] saturate-0 blur-[0.5px]"
              aria-hidden="true"
              priority={false}
            />
        )}
        <div className="relative w-full px-2 sm:px-4 lg:px-8">
            <div className="space-y-8">
                <div>
                    <div className="w-10 h-0.5 bg-secondary mb-4"></div>
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t.title}
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-secondary-foreground font-body">
                        {t.description}
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                    {t.recordings.map((recording) => (
                        <div
                          key={recording.title}
                          className="rounded-xl bg-white/90 text-neutral-900 shadow-sm ring-1 ring-black/5 backdrop-blur-sm p-6 hover:shadow-md transition-shadow w-full h-full flex flex-col"
                        >
                            <h3 className="text-xl font-headline font-semibold text-[hsl(46,45%,38%)]">
                                {recording.title}{' '}
                                <span className="text-base font-normal text-[hsl(46,45%,38%)]">
                                    ({recording.year})
                                </span>
                            </h3>
                            <p className="mt-2 text-base text-neutral-800 font-body">{recording.description}</p>
                            <Button
                              variant="ghost"
                              className="rounded-none mt-3 p-0 h-auto text-primary-foreground hover:text-accent hover:bg-transparent focus-visible:bg-transparent active:bg-transparent transition-colors"
                            >
                                <PlayCircle className="w-5 h-5 mr-2" />
                                {t.listenNow}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
  );
}
