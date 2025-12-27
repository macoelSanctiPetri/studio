"use client";

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { loadRepertoire, RepertoireWork } from '@/lib/repertoire-loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type PeriodFilter = 'unset' | 'all' | 'renaissance' | 'non-renaissance';
type TypeFilter = 'unset' | 'all' | 'religious' | 'secular' | 'christmas';
type AuthorFilter = 'unset' | 'all' | string;

export default function RepertoireSection() {
  const { language } = useLanguage();
  const [works, setWorks] = useState<RepertoireWork[]>([]);
  const [period, setPeriod] = useState<PeriodFilter>('unset');
  const [type, setType] = useState<TypeFilter>('unset');
  const [author, setAuthor] = useState<AuthorFilter>('unset');
  const [query, setQuery] = useState('');
  const [pdfOpen, setPdfOpen] = useState(false);
  const [authors, setAuthors] = useState<string[]>([]);

  useEffect(() => {
    loadRepertoire().then((list) =>
      setWorks(
        list.map((w) => ({
          ...w,
          period: w.period === 'renaissance' ? 'renaissance' : 'non-renaissance',
          type: w.type === 'secular' ? 'secular' : w.type === 'christmas' ? 'christmas' : 'religious',
        })),
      ),
    );
    // derive authors (unique) once data is loaded
    loadRepertoire().then((list) => {
      const set = new Set<string>();
      list.forEach((w) => {
        if (w.composer) set.add(w.composer);
      });
      setAuthors(Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })));
    });
  }, []);

  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    const shouldShow =
      period !== 'unset' || type !== 'unset' || author !== 'unset' || q.length > 0;
    if (!shouldShow) return [];

    return works.filter((w) => {
      const periodOk = period === 'unset' || period === 'all' || w.period === period;
      const typeOk = type === 'unset' || type === 'all' || w.type === type;
      const authorOk =
        author === 'unset' || author === 'all' || normalize(w.composer || '') === normalize(author);
      if (!periodOk || !typeOk || !authorOk) return false;
      if (!q) return true;
      const hay = (txt?: string) => (txt ? normalize(txt).includes(q) : false);
      const hayEnItems = w.items?.some((it) => hay(it));
      return hay(w.title) || hay(w.composer) || hay(w.voices) || hayEnItems;
    });
  }, [works, period, type, author, query]);

  const labels = {
    period: language === 'es' ? 'Periodo' : 'Period',
    type: language === 'es' ? 'Tipo de obra' : 'Work type',
    all: language === 'es' ? 'Todas' : 'All',
    renaissance: language === 'es' ? 'Renacentista' : 'Renaissance',
    nonRenaissance: language === 'es' ? 'No renacentista' : 'Non-Renaissance',
    religious: language === 'es' ? 'Religiosa' : 'Sacred',
    secular: language === 'es' ? 'Profana' : 'Secular',
    christmas: language === 'es' ? 'Navideña' : 'Christmas',
    empty: language === 'es' ? 'No hay obras con este filtro.' : 'No works match this filter.',
    collection: language === 'es' ? 'Colección' : 'Collection',
    heading: language === 'es' ? 'Repertorio' : 'Repertoire',
    intro:
      language === 'es'
        ? 'Filtra por periodo (renacentista o no) y por tipo de obra (religiosa, profana o navideña). Si una entrada es una colección, verás las piezas listadas dentro.'
        : 'Filter by period (Renaissance or later) and by work type (sacred, secular, Christmas). Collections display their contained pieces.',
  };

  return (
    <section id="repertoire" className="bg-background py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div id="repertoire-religious" className="h-0 scroll-mt-32" />
        <div id="repertoire-secular" className="h-0 scroll-mt-32" />
        <div id="repertoire-christmas" className="h-0 scroll-mt-32" />
        <div className="w-10 h-0.5 bg-secondary mb-4"></div>
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {labels.heading}
        </h2>
        <p className="mt-4 text-lg text-secondary-foreground font-body max-w-3xl">{labels.intro}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
            {labels.period}
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
              <SelectTrigger className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm focus:border-accent focus:ring-2 focus:ring-accent">
                <SelectValue placeholder={language === 'es' ? 'Selecciona periodo' : 'Select period'} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-card text-foreground shadow-lg">
                <SelectItem value="unset" className="font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                  {language === 'es' ? 'Sin seleccionar' : 'Unset'}
                </SelectItem>
                <SelectItem value="all" className="font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                  {labels.all}
                </SelectItem>
                <SelectItem value="renaissance" className="font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                  {labels.renaissance}
                </SelectItem>
                <SelectItem value="non-renaissance" className="font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                  {labels.nonRenaissance}
                </SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
            {labels.type}
            <Select value={type} onValueChange={(v) => setType(v as TypeFilter)}>
              <SelectTrigger className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm focus:border-accent focus:ring-2 focus:ring-accent">
                <SelectValue placeholder={language === 'es' ? 'Selecciona tipo' : 'Select type'} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-card text-foreground shadow-lg">
                <SelectItem value="unset" className="font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                  {language === 'es' ? 'Sin seleccionar' : 'Unset'}
                </SelectItem>
                <SelectItem value="all" className="font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                  {labels.all}
                </SelectItem>
                <SelectItem value="religious" className="font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                  {labels.religious}
                </SelectItem>
                <SelectItem value="secular" className="font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                  {labels.secular}
                </SelectItem>
                <SelectItem value="christmas" className="font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                  {labels.christmas}
                </SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
            {language === 'es' ? 'Autor' : 'Composer'}
            <Select value={author} onValueChange={(v) => setAuthor(v as AuthorFilter)}>
              <SelectTrigger className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm focus:border-accent focus:ring-2 focus:ring-accent">
                <SelectValue placeholder={language === 'es' ? 'Selecciona autor' : 'Select composer'} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-card text-foreground shadow-lg max-h-80">
                <SelectItem value="unset" className="font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                  {language === 'es' ? 'Sin seleccionar' : 'Unset'}
                </SelectItem>
                <SelectItem value="all" className="font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                  {language === 'es' ? 'Todos' : 'All'}
                </SelectItem>
                {authors.map((a) => (
                  <SelectItem
                    key={a}
                    value={a}
                    className="font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                  >
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <div className="flex items-end justify-end gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={language === 'es' ? 'Buscar obra, autor o voces' : 'Search title, composer, voices'}
                className="pl-9 h-10 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-secondary-foreground focus:border-accent focus:ring-2 focus:ring-accent"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setPdfOpen(true)}
              className="h-10 shrink-0 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {language === 'es' ? 'PDF' : 'PDF'}
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-secondary-foreground sm:text-sm">
          <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">
            {labels.period}:{' '}
            {period === 'unset'
              ? language === 'es' ? 'Sin seleccionar' : 'Unset'
              : period === 'all'
              ? labels.all
              : period === 'renaissance'
              ? labels.renaissance
              : labels.nonRenaissance}
          </span>
          <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">
            {labels.type}:{' '}
            {type === 'unset'
              ? language === 'es' ? 'Sin seleccionar' : 'Unset'
              : type === 'all'
              ? labels.all
              : type === 'religious'
              ? labels.religious
              : type === 'secular'
              ? labels.secular
              : labels.christmas}
          </span>
          <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">
            {language === 'es' ? 'Autor' : 'Composer'}:{' '}
            {author === 'unset'
              ? language === 'es' ? 'Sin seleccionar' : 'Unset'
              : author === 'all'
              ? language === 'es' ? 'Todos' : 'All'
              : author}
          </span>
          <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
            {language === 'es' ? 'Obras' : 'Works'}: {filtered.length}
          </span>
        </div>
        <div className="mt-10 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div
            className={`grid gap-0 bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wide text-accent-foreground sm:text-sm ${
              // dynamic columns depending on filters
              (period === 'unset' || period === 'all')
                ? (type === 'unset' || type === 'all')
                  ? (author === 'unset' || author === 'all')
                    ? 'grid-cols-[2fr,1fr,1fr,0.9fr,0.9fr]'
                    : 'grid-cols-[2fr,1fr,0.9fr,0.9fr]'
                  : (author === 'unset' || author === 'all')
                    ? 'grid-cols-[2fr,1fr,1fr,0.9fr]'
                    : 'grid-cols-[2fr,1fr,0.9fr]'
                : (type === 'unset' || type === 'all')
                  ? (author === 'unset' || author === 'all')
                    ? 'grid-cols-[2fr,1fr,1fr,0.9fr]'
                    : 'grid-cols-[2fr,1fr,0.9fr]'
                  : (author === 'unset' || author === 'all')
                    ? 'grid-cols-[2fr,1fr,1fr]'
                    : 'grid-cols-[2fr,1fr]'
            }`}
          >
            <span>{language === 'es' ? 'Obra / colección' : 'Work / collection'}</span>
            {(author === 'unset' || author === 'all') && (
              <span>{language === 'es' ? 'Autor' : 'Composer'}</span>
            )}
            <span>{language === 'es' ? 'Voces' : 'Voices'}</span>
            {(period === 'unset' || period === 'all') && (
              <span>{language === 'es' ? 'Periodo' : 'Period'}</span>
            )}
            {(type === 'unset' || type === 'all') && (
              <span>{language === 'es' ? 'Tipo' : 'Type'}</span>
            )}
          </div>
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-secondary-foreground">{labels.empty}</p>
          ) : (
            <ul className="divide-y divide-border/40">
              {filtered.map((work) => (
                <li
                  key={work.id}
                  className={`grid items-start gap-2 px-4 py-3 text-sm sm:text-base ${
                    (period === 'unset' || period === 'all')
                      ? (type === 'unset' || type === 'all')
                        ? (author === 'unset' || author === 'all')
                          ? 'grid-cols-[2fr,1fr,1fr,0.9fr,0.9fr]'
                          : 'grid-cols-[2fr,1fr,0.9fr,0.9fr]'
                        : (author === 'unset' || author === 'all')
                          ? 'grid-cols-[2fr,1fr,1fr,0.9fr]'
                          : 'grid-cols-[2fr,1fr,0.9fr]'
                      : (type === 'unset' || type === 'all')
                        ? (author === 'unset' || author === 'all')
                          ? 'grid-cols-[2fr,1fr,1fr,0.9fr]'
                          : 'grid-cols-[2fr,1fr,0.9fr]'
                        : (author === 'unset' || author === 'all')
                          ? 'grid-cols-[2fr,1fr,1fr]'
                          : 'grid-cols-[2fr,1fr]'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-headline text-foreground text-base sm:text-lg leading-tight flex items-center gap-2 flex-wrap">
                      {work.title}
                      {work.items && work.items.length > 0 && (
                        <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                          {labels.collection}
                        </span>
                      )}
                    </div>
                    {work.items && work.items.length > 0 && (
                      <ul className="ml-4 list-disc space-y-1 text-sm text-foreground">
                        {work.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {(author === 'unset' || author === 'all') && (
                    <div className="text-secondary-foreground text-sm sm:text-base">
                      {work.composer || '—'}
                    </div>
                  )}
                  <div className="text-secondary-foreground text-sm sm:text-base">
                    {work.voices || '—'}
                  </div>
                  {(period === 'unset' || period === 'all') && (
                    <div className="text-secondary-foreground text-xs sm:text-sm flex items-center">
                      <span className="inline-block rounded-full bg-accent/20 px-2 py-0.5 text-foreground font-semibold uppercase tracking-wide">
                        {work.period === 'renaissance' ? labels.renaissance : labels.nonRenaissance}
                      </span>
                    </div>
                  )}
                  {(type === 'unset' || type === 'all') && (
                    <div className="text-secondary-foreground text-xs sm:text-sm flex items-center">
                      <span className="inline-block rounded-full bg-accent/20 px-2 py-0.5 text-foreground font-semibold uppercase tracking-wide">
                        {work.type === 'religious'
                          ? labels.religious
                          : work.type === 'secular'
                          ? labels.secular
                          : labels.christmas}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{language === 'es' ? 'Repertorio completo (PDF)' : 'Full repertoire (PDF)'}</DialogTitle>
            </DialogHeader>
            <div className="h-[70vh] w-full">
              <object data="/data/repertorio.pdf#toolbar=1" type="application/pdf" className="h-full w-full rounded-lg border border-border">
                <p className="text-sm text-secondary-foreground">
                  {language === 'es'
                    ? 'Tu navegador no puede mostrar el PDF. Puedes descargarlo aquí:'
                    : 'Your browser cannot display the PDF. You can download it here:'}{' '}
                  <a href="/data/repertorio.pdf" className="text-link underline" download>
                    {language === 'es' ? 'Descargar PDF' : 'Download PDF'}
                  </a>
                </p>
              </object>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPdfOpen(false)}>
                {language === 'es' ? 'Cerrar' : 'Close'}
              </Button>
              <Button asChild>
                <a href="/data/repertorio.pdf" download>
                  {language === 'es' ? 'Descargar' : 'Download'}
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

