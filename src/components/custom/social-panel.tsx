import { Facebook, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'YouTube', href: '#', icon: Youtube },
];

export default function SocialPanel() {
  const { language } = useLanguage();
  const t = translations[language].socialPanel;
  
  return (
    <section id="contact" className="bg-lavender-gradient py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-6 text-center text-primary-foreground lg:px-8">
        <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
          {t.title}
        </h2>
        <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 font-body">
          {t.description}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-8">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-primary-foreground hover:text-primary-foreground/80"
            >
              <span className="sr-only">{link.name}</span>
              <link.icon className="h-8 w-8" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
