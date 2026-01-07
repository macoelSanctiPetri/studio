import { translations } from '@/lib/translations';
import type { Language } from '@/context/language-context';

export type SearchEntry = {
  id: string;
  title: string;
  summary?: string;
  href: string;
  kind: 'section' | 'event' | 'media';
};

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function buildSearchEntries(language: Language): SearchEntry[] {
  const t = translations[language];
  const entries: SearchEntry[] = [];

  // Secciones principales
  entries.push(
    {
      id: 'about',
      title: t.aboutSection.title,
      summary: t.aboutSection.p1,
      href: '#about',
      kind: 'section',
    },
    {
      id: 'events',
      title: t.eventsSection.title,
      summary: t.eventsSection.description,
      href: '#events',
      kind: 'section',
    },
    {
      id: 'programs',
      title: t.header.navLinks.find((l) => l.href === '#programs')?.name ?? 'Programas',
      summary: t?.repertoireSection?.description ?? '',
      href: '#programs',
      kind: 'section',
    },
    {
      id: 'repertoire',
      title: t.header.navLinks.find((l) => l.href === '#repertoire')?.name ?? 'Repertorio',
      summary: t.repertoireSection?.description ?? '',
      href: '#repertoire',
      kind: 'section',
    },
    {
      id: 'media',
      title: t.header.navLinks.find((l) => l.href === '#media')?.name ?? 'Multimedia',
      summary: [
        t.multimediaSub?.photos,
        t.multimediaSub?.videos,
        t.multimediaSub?.audios,
      ]
        .filter(Boolean)
        .join(', '),
      href: '#media',
      kind: 'section',
    },
    {
      id: 'contact',
      title: t.header.navLinks.find((l) => l.href === '#contact')?.name ?? 'Contacto',
      summary: t.contactSection?.title ?? '',
      href: '#contact',
      kind: 'section',
    }
  );

  // Componentes / equipo (para búsquedas por nombre, p.ej. "Eduardo")
  if (t.aboutSection?.team) {
    t.aboutSection.team.forEach((member, idx) => {
      entries.push({
        id: `team-${idx}`,
        title: member.name ?? '',
        summary: member.role ?? t.aboutSection.teamTitle ?? '',
        href: '#about',
        kind: 'section',
      });
    });
  }

  // Eventos futuros
  t.eventsSection.events.forEach((ev, idx) => {
    entries.push({
      id: `event-${idx}`,
      title: ev.title ?? '',
      summary: ev.description ?? ev.date ?? '',
      href: '#events',
      kind: 'event',
    });
  });

  // Eventos pasados
  t.pastEventsSection.events.forEach((ev, idx) => {
    entries.push({
      id: `past-event-${idx}`,
      title: ev.title ?? '',
      summary: ev.description ?? ev.date ?? '',
      href: '#events-past',
      kind: 'event',
    });
  });

  return entries;
}

export const matchEntries = (entries: SearchEntry[], query: string) => {
  const q = normalize(query.trim());
  if (!q) return [];
  return entries
    .filter((e) => {
      const titleNorm = normalize(e.title);
      const summaryNorm = e.summary ? normalize(e.summary) : '';
      return titleNorm.includes(q) || summaryNorm.includes(q);
    })
    .slice(0, 10);
};
