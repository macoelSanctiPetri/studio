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
    <section id="music" className="bg-background py-24 sm:py-32">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
            <div className="lg:mx-0 lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8">
                <div className="relative xl:col-span-2">
                    <div className="w-10 h-0.5 bg-secondary mb-4"></div>
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t.title}
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-secondary-foreground font-body">
                        {t.description}
                    </p>
                </div>
                <div className="mt-12 max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1">
                    <div className="space-y-8">
                        {t.recordings.map((recording) => (
                            <div key={recording.title}>
                                <h3 className="text-xl font-headline font-semibold text-foreground">{recording.title} <span className="text-base font-normal text-secondary-foreground">({recording.year})</span></h3>
                                <p className="mt-2 text-base text-secondary-foreground font-body">{recording.description}</p>
                                <Button variant="ghost" className="rounded-none mt-3 p-0 h-auto text-accent hover:text-accent/80">
                                    <PlayCircle className="w-5 h-5 mr-2" />
                                    {t.listenNow}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-12 lg:mt-0 lg:max-w-lg lg:justify-self-end">
                    {musicImage && (
                        <Image
                            src={musicImage.imageUrl}
                            alt={imageDescription}
                            width={1000}
                            height={800}
                            className="object-cover w-full h-full aspect-[4/3] lg:aspect-auto"
                            data-ai-hint={musicImage.imageHint}
                        />
                    )}
                </div>
            </div>
        </div>
    </section>
  );
}
