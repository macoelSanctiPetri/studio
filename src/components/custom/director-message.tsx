"use client";

import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';

export default function DirectorMessage() {
  const { language } = useLanguage();
  const t = translations[language].directorMessage;

  return (
    <section className="bg-primary text-primary-foreground py-24 sm:py-32">
      <div className="container mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <div className="w-10 h-0.5 bg-secondary mx-auto mb-4"></div>
        <h2 className="font-headline text-3xl font-bold tracking-tight text-accent sm:text-4xl">
          {t.title}
        </h2>
        <div className="mt-8 font-body text-lg leading-8 text-gray-300 space-y-6">
          <p>{t.p1}</p>
          <p>{t.p2}</p>
          <p>{t.p3}</p>
          <p>{t.p4}</p>
          <p className="font-semibold mt-8">{t.signature}</p>
          <p className="text-base">{t.signatureTitle}</p>
        </div>
      </div>
    </section>
  );
}
