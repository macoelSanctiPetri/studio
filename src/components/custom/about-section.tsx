import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';

export default function AboutSection() {
  const { language } = useLanguage();
  const t = translations[language].aboutSection;
  const aboutImage = PlaceHolderImages.find(p => p.id === 'about-choir');
  const imageDescription = language === 'es' 
    ? (aboutImage?.description || 'El coro posando para una foto grupal.')
    : (aboutImage?.alt_en || 'The choir posing for a group photo.');


  return (
    <section id="about" className="bg-background py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-x-16 gap-y-16 lg:grid-cols-2">
            <div>
                 <div className="w-10 h-0.5 bg-secondary mb-4"></div>
                <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {t.title}
                </h2>
                <p className="mt-6 text-lg leading-8 text-secondary-foreground font-body">
                  {t.p1}
                </p>
                <p className="mt-4 text-lg leading-8 text-secondary-foreground font-body">
                  {t.p2}
                </p>
            </div>
            {aboutImage && (
              <div className="aspect-[3/2] w-full max-w-lg justify-self-center lg:aspect-[1/1] lg:max-w-none">
                <Image
                  src={aboutImage.imageUrl}
                  alt={imageDescription}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  data-ai-hint={aboutImage.imageHint}
                />
              </div>
            )}
        </div>
      </div>
    </section>
  );
}
