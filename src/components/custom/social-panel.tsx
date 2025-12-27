import { Facebook, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';

const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/nmvsica', icon: Facebook },
  { name: 'Instagram', href: 'https://www.instagram.com/novamvsica', icon: Instagram },
  { name: 'YouTube', href: 'https://www.youtube.com/@novamvsica9623', icon: Youtube },
];

export default function SocialPanel() {
  const { language } = useLanguage();
  const t = translations[language].socialPanel;
  
  return (
    <section id="contact" className="bg-primary text-primary-foreground py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-6 text-center lg:px-8">
        <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
          {t.title}
        </h2>
        <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 font-body text-primary-foreground/80">
          {t.description}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-8">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="text-primary-foreground hover:text-accent transition-colors"
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
