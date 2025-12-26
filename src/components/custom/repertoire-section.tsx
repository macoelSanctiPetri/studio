import { useLanguage } from '@/context/language-context';
import { repertoireData } from '@/data/repertoire';
import { translations } from '@/lib/translations';

const indentClass = (text: string) => {
  const token = text.split(' ')[0]; // e.g., "101.1.2"
  const segments = token.split('.').filter(Boolean);
  const depth = segments.length - 1; // 0 for 101., 1 for 101.1., 2 for 101.1.1
  if (depth >= 2) return 'pl-6';
  if (depth === 1) return 'pl-3';
  return '';
};

export default function RepertoireSection() {
  const { language } = useLanguage();
  const t = translations[language];

  const columns = [
    {
      key: 'religious',
      title: language === 'es' ? t.header.repertoireSub.religious : t.header.repertoireSub.religious,
      anchor: 'repertoire-religious',
    },
    {
      key: 'secular',
      title: language === 'es' ? t.header.repertoireSub.secular : t.header.repertoireSub.secular,
      anchor: 'repertoire-secular',
    },
    {
      key: 'christmas',
      title: language === 'es' ? t.header.repertoireSub.christmas : t.header.repertoireSub.christmas,
      anchor: 'repertoire-christmas',
    },
  ] as const;

  return (
    <section id="repertoire" className="bg-background py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        {/* Anchors positioned at the heading so submenus land on the title */}
        <div id="repertoire-religious" className="h-0 scroll-mt-32" />
        <div id="repertoire-secular" className="h-0 scroll-mt-32" />
        <div id="repertoire-christmas" className="h-0 scroll-mt-32" />
        <div className="w-10 h-0.5 bg-secondary mb-4"></div>
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {language === 'es' ? 'Repertorio' : 'Repertoire'}
        </h2>
        <p className="mt-4 text-lg text-secondary-foreground font-body max-w-3xl">
          {language === 'es'
            ? 'Consulta rápidamente el repertorio en tres áreas: religioso, profano y navideño, cada una dividida en renacentista y no renacentista.'
            : 'Browse the repertoire across sacred, secular, and Christmas programs, each split into Renaissance and non-Renaissance selections.'}
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {columns.map((col) => {
            const data = repertoireData[col.key];
            return (
              <div
                key={col.key}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-white text-neutral-900 p-6 shadow-sm"
              >
                <div>
                  <h3 className="text-2xl font-headline font-semibold text-[hsl(46,45%,38%)]">{col.title}</h3>
                </div>
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-neutral-700 font-headline font-semibold">
                      {language === 'es' ? 'Renacentista' : 'Renaissance'}
                    </p>
                    <ul className="mt-2 space-y-1 text-neutral-900">
                      {data.renaissance.map((work) => (
                        <li key={work} className={`text-sm leading-relaxed ${indentClass(work)}`}>
                          {work}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-neutral-700 font-headline font-semibold">
                      {language === 'es' ? 'No Renacentista' : 'Non-Renaissance'}
                    </p>
                    <ul className="mt-2 space-y-1 text-neutral-900">
                      {data.nonRenaissance.map((work) => (
                        <li key={work} className={`text-sm leading-relaxed ${indentClass(work)}`}>
                          {work}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
