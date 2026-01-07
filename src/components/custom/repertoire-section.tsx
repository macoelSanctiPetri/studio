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
import { Search, Download, Play, Youtube, Plus, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Music2 } from 'lucide-react';

type PeriodFilter = 'unset' | 'all' | 'renaissance' | 'non-renaissance';
type TypeFilter = 'unset' | 'all' | 'religious' | 'secular' | 'christmas';
type AuthorFilter = 'unset' | 'all' | string;

export default function RepertoireSection() {
  const { language } = useLanguage();
  const [works, setWorks] = useState<RepertoireWork[]>([]);
  const [audioIds, setAudioIds] = useState<Set<string>>(new Set());
  const [audioMap, setAudioMap] = useState<Map<string, string>>(new Map());
  const [videoIds, setVideoIds] = useState<Set<string>>(new Set());
  const [videoMap, setVideoMap] = useState<Map<string, string>>(new Map());
  const [player, setPlayer] = useState<{ title: string; src: string } | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>('unset');
  const [type, setType] = useState<TypeFilter>('unset');
  const [author, setAuthor] = useState<AuthorFilter>('unset');
  const [query, setQuery] = useState('');
  const [pdfOpen, setPdfOpen] = useState(false);
  const [authors, setAuthors] = useState<string[]>([]);
  const [isAuthed, setIsAuthed] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addIsCollection, setAddIsCollection] = useState(false);
  const [periodOptions, setPeriodOptions] = useState<Array<{ id: number; descripcion: string }>>([
    { id: 1, descripcion: 'Polifonía del Renacimiento' },
    { id: 2, descripcion: 'Polifonía no Renacentista' },
  ]);
  const [generoOptions, setGeneroOptions] = useState<Array<{ id: number; nombre: string }>>([
    { id: 1, nombre: 'Obra Religiosa' },
    { id: 2, nombre: 'Obra Profana' },
    { id: 3, nombre: 'Obra Navideña' },
  ]);
  const [addPeriodId, setAddPeriodId] = useState<number>(1);
  const [addGeneroId, setAddGeneroId] = useState<number>(1);
  const [addTitle, setAddTitle] = useState('');
  const [addComposer, setAddComposer] = useState('');
  const [showComposerList, setShowComposerList] = useState(false);
  const [addVoices, setAddVoices] = useState('');
  const [showVoicesList, setShowVoicesList] = useState(false);
  const [collectionDraft, setCollectionDraft] = useState({ title: '', voices: '' });
  const [collectionItems, setCollectionItems] = useState<
    Array<{ code: string; title: string; voices: string }>
  >([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editNumber, setEditNumber] = useState('');
  const [editIsCollection, setEditIsCollection] = useState(false);
  const [editPeriodId, setEditPeriodId] = useState<number>(1);
  const [editGeneroId, setEditGeneroId] = useState<number>(1);
  const [editTitle, setEditTitle] = useState('');
  const [editComposer, setEditComposer] = useState('');
  const [editVoices, setEditVoices] = useState('');
  const [editItems, setEditItems] = useState<
    Array<{ id?: string; code: string; title: string; voices: string }>
  >([]);
  const [editDragIndex, setEditDragIndex] = useState<number | null>(null);
  const [editDragOverIndex, setEditDragOverIndex] = useState<number | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [showEditComposerList, setShowEditComposerList] = useState(false);
  const [showEditVoicesList, setShowEditVoicesList] = useState(false);
  const [voicesOptions, setVoicesOptions] = useState<string[]>([]);

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
    // derive voices (unique) once data is loaded
    loadRepertoire().then((list) => {
      const set = new Set<string>();
      list.forEach((w) => {
        if (w.voices) set.add(w.voices);
      });
      setVoicesOptions(Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })));
    });

    const checkAuth = () => {
      fetch('/api/auth/status', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : { ok: false }))
        .then((d) => setIsAuthed(Boolean(d.ok)))
        .catch(() => setIsAuthed(false));
    };

    const loadPeriodos = () =>
      fetch('/api/periodos', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((payload) => {
          if (payload?.rows?.length) {
            setPeriodOptions(payload.rows);
            const hasSelected = payload.rows.some((p: { id: number }) => p.id === addPeriodId);
            if (!hasSelected) setAddPeriodId(payload.rows[0].id);
          }
        })
        .catch(() => undefined);

    const loadGeneros = () =>
      fetch('/api/generos', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((payload) => {
          if (payload?.rows?.length) {
            setGeneroOptions(payload.rows);
            const hasSelected = payload.rows.some((g: { id: number }) => g.id === addGeneroId);
            if (!hasSelected) setAddGeneroId(payload.rows[0].id);
          }
        })
        .catch(() => undefined);

    checkAuth();
    loadPeriodos();
    loadGeneros();
    const listener = () => checkAuth();
    window.addEventListener('nm-auth-change', listener);

    // cargar IDs con audio disponible
    fetch('/api/audios', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (payload?.rows) {
          const ids = new Set<string>();
          const map = new Map<string, string>();
          payload.rows.forEach((r: { slug?: string; src?: string; parent_number?: string }) => {
            const slug = r.slug ? String(r.slug) : null;
            if (slug) {
              ids.add(slug);
              if (r.src) map.set(slug, r.src);
            }
          });
          setAudioIds(ids);
          setAudioMap(map);
        }
      })
      .catch((err) => console.warn('No se pudieron cargar audios para marcar repertorio', err));

    // cargar IDs con vídeo disponible
    fetch('/api/videos', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (payload?.rows) {
          const ids = new Set<string>();
          const map = new Map<string, string>();
          payload.rows.forEach((r: { slug?: string; src?: string; parent_number?: string }) => {
            const slug = r.slug ? String(r.slug) : null;
            if (slug) {
              ids.add(slug);
              if (r.src) map.set(slug, r.src);
            }
          });
          setVideoIds(ids);
          setVideoMap(map);
        }
      })
      .catch((err) => console.warn('No se pudieron cargar videos para marcar repertorio', err));

    return () => window.removeEventListener('nm-auth-change', listener);
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

  const refreshRepertoire = async () => {
    const list = await loadRepertoire();
    setWorks(
      list.map((w) => ({
        ...w,
        period: w.period === 'renaissance' ? 'renaissance' : 'non-renaissance',
        type: w.type === 'secular' ? 'secular' : w.type === 'christmas' ? 'christmas' : 'religious',
      })),
    );
    const set = new Set<string>();
    list.forEach((w) => {
      if (w.composer) set.add(w.composer);
    });
    setAuthors(Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })));
  };

  const selectedPeriod = useMemo(
    () => periodOptions.find((p) => p.id === addPeriodId),
    [periodOptions, addPeriodId],
  );
  const selectedGenero = useMemo(
    () => generoOptions.find((g) => g.id === addGeneroId),
    [generoOptions, addGeneroId],
  );

  const selectedPeriodKind = useMemo(() => {
    if (!selectedPeriod) return 'renaissance' as const;
    const v = normalize(selectedPeriod.descripcion || '');
    return v.includes('no renac') ? 'non-renaissance' : 'renaissance';
  }, [selectedPeriod]);

  const selectedGroupKind = useMemo(() => {
    if (!selectedGenero) return 'religiosa' as const;
    const v = normalize(selectedGenero.nombre || '');
    if (v.includes('prof')) return 'profana' as const;
    if (v.includes('nav')) return 'navidena' as const;
    return 'religiosa' as const;
  }, [selectedGenero]);

  const suggestedCode = useMemo(() => {
    const base =
      selectedPeriodKind === 'renaissance'
        ? selectedGroupKind === 'religiosa'
          ? 100
          : selectedGroupKind === 'profana'
            ? 200
            : 300
        : selectedGroupKind === 'religiosa'
          ? 400
          : selectedGroupKind === 'profana'
            ? 500
            : 600;

    const targetType = selectedGroupKind === 'religiosa' ? 'religious' : selectedGroupKind === 'profana' ? 'secular' : 'christmas';
    const max = works.reduce((acc, w) => {
      if (w.period !== selectedPeriodKind) return acc;
      if (w.type !== targetType) return acc;
      const m = String(w.id).match(/^(\d+)/);
      if (!m) return acc;
      const n = Number(m[1]);
      if (Number.isNaN(n)) return acc;
      return Math.max(acc, n);
    }, 0);

    return max >= base ? String(max + 1) : String(base);
  }, [works, selectedPeriodKind, selectedGroupKind]);

  const nextCollectionCode = useMemo(() => {
    const base = suggestedCode;
    const nextIndex = collectionItems.length + 1;
    return `${base}.${nextIndex}`;
  }, [suggestedCode, collectionItems.length]);

  const renumberCollectionItems = (items: Array<{ code: string; title: string; voices: string }>) =>
    items.map((item, idx) => ({
      ...item,
      code: `${suggestedCode}.${idx + 1}`,
    }));

  const collectionReady =
    addIsCollection && addTitle.trim().length > 0 && Boolean(addPeriodId) && Boolean(addGeneroId);

  const renumberEditItems = (
    items: Array<{ id?: string; code: string; title: string; voices: string }>,
  ) =>
    items.map((item, idx) => ({
      ...item,
      code: editNumber ? `${editNumber}.${idx + 1}` : item.code,
    }));

  const openEdit = async (work: RepertoireWork) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await fetch(`/api/repertory/${work.id}`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('No se pudo cargar el repertorio');
      }
      const payload = await res.json();
      const parent = payload?.parent;
      const children = Array.isArray(payload?.children) ? payload.children : [];
      setEditNumber(parent?.number || work.id);
      setEditIsCollection(Boolean(parent?.is_collection));
      setEditPeriodId(parent?.period_id ?? addPeriodId);
      setEditGeneroId(parent?.genero_id ?? addGeneroId);
      setEditTitle(parent?.title ?? work.title ?? '');
      setEditComposer(parent?.composer ?? parent?.composer_inherited ?? work.composer ?? '');
      setEditVoices(parent?.voices ?? parent?.voices_inherited ?? work.voices ?? '');
      if (parent?.is_collection) {
        const items = children.map((child: { number?: string; title?: string; voices?: string; voices_inherited?: string }, idx: number) => ({
          id: child.number ? String(child.number) : undefined,
          code: `${parent.number}.${idx + 1}`,
          title: child.title ?? '',
          voices: child.voices ?? child.voices_inherited ?? '',
        }));
        setEditItems(items);
      } else {
        setEditItems([]);
      }
    } catch (err) {
      console.error(err);
      alert(language === 'es' ? 'No se pudo cargar la obra.' : 'Unable to load work.');
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const deleteWork = async (work: RepertoireWork) => {
    const msg = language === 'es'
      ? '¿Seguro que quieres eliminar esta obra? Si es una colección se borrarán también sus piezas.'
      : 'Are you sure you want to delete this work? If it is a collection, its pieces will be deleted too.';
    if (!window.confirm(msg)) return;
    try {
      const res = await fetch(`/api/repertory/${work.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || 'No se pudo eliminar la obra.');
        return;
      }
      await refreshRepertoire();
    } catch (err) {
      console.error(err);
      alert(language === 'es' ? 'No se pudo eliminar la obra.' : 'Unable to delete work.');
    }
  };

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
    <>
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_minmax(180px,1fr)_minmax(240px,2fr)_auto]">
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
            {isAuthed && (
              <Button
                onClick={() => {
                  setAddOpen(true);
                  setAddIsCollection(false);
                  setCollectionItems([]);
                  setCollectionDraft({ title: '', voices: '' });
                  setAddTitle('');
                  setAddComposer('');
                  setAddVoices('');
                }}
                className="h-10 shrink-0 rounded-xl border border-border bg-accent text-sm font-semibold text-accent-foreground hover:bg-accent/90 inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {language === 'es' ? 'Añadir' : 'Add'}
              </Button>
            )}
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
                      {isAuthed && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(work)}
                            className="inline-flex items-center justify-center rounded-full border border-border/60 bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition px-2 py-1"
                            title={language === 'es' ? 'Editar' : 'Edit'}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteWork(work)}
                            className="inline-flex items-center justify-center rounded-full border border-red-500/60 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition px-2 py-1"
                            title={language === 'es' ? 'Eliminar' : 'Delete'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      {audioIds.has(work.id) && audioMap.get(work.id) && (
                        <button
                          type="button"
                          onClick={() =>
                            setPlayer({
                              title: work.title,
                              src: audioMap.get(work.id) || '',
                            })
                          }
                          className="inline-flex items-center justify-center rounded-full border border-accent/70 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition px-2 py-1"
                          title={language === 'es' ? 'Reproducir audio' : 'Play audio'}
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      {videoIds.has(work.id) && videoMap.get(work.id) && (
                        <a
                          href={videoMap.get(work.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-full border border-red-500/70 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition px-2 py-1"
                          title={language === 'es' ? 'Ver vídeo' : 'Watch video'}
                        >
                          <Youtube className="h-4 w-4" />
                        </a>
                      )}
                      {work.title}
                      {work.items && work.items.length > 0 && (
                        <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                          {labels.collection}
                        </span>
                      )}
                    </div>
                    {work.items && work.items.length > 0 && (
                      <ul className="ml-4 list-disc space-y-1 text-sm text-foreground">
                        {work.items.map((item, idx) => {
                          const itemId = work.itemIds?.[idx];
                          const hasAudio = itemId ? audioIds.has(itemId) : false;
                          const audioSrc = itemId ? audioMap.get(itemId) : undefined;
                          const hasVideo = itemId ? videoIds.has(itemId) : false;
                          const videoSrc = itemId ? videoMap.get(itemId) : undefined;
                          return (
                            <li key={item} className="flex items-center gap-2">
                              {hasAudio && audioSrc && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPlayer({
                                      title: item,
                                      src: audioSrc,
                                    })
                                  }
                                  className="inline-flex items-center justify-center rounded-full border border-accent/70 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition px-2 py-1"
                                  title={language === 'es' ? 'Reproducir audio' : 'Play audio'}
                                >
                                  <Play className="h-4 w-4" />
                                </button>
                              )}
                              {hasVideo && videoSrc && (
                                <a
                                  href={videoSrc}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center rounded-full border border-red-500/70 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition px-2 py-1"
                                  title={language === 'es' ? 'Ver vídeo' : 'Watch video'}
                                >
                                  <Youtube className="h-4 w-4" />
                                </a>
                              )}
                              <span>{item}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  {(author === 'unset' || author === 'all') && (
                    <div className="text-secondary-foreground text-sm sm:text-base">
                      {work.composer || '-'}
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
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="w-[80vw] max-w-none bg-background">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {language === 'es' ? 'Añadir repertorio' : 'Add repertoire'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={addIsCollection}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setAddIsCollection(next);
                    if (!next) {
                    setCollectionItems([]);
                    setCollectionDraft({ title: '', voices: '' });
                  }
                }}
                />
                {language === 'es' ? 'Es una colección' : 'Is a collection'}
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                  {language === 'es' ? 'Periodo' : 'Period'}
                  <Select value={String(addPeriodId)} onValueChange={(v) => setAddPeriodId(Number(v))}>
                    <SelectTrigger className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm">
                      <SelectValue placeholder={language === 'es' ? 'Selecciona periodo' : 'Select period'} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-border bg-card text-foreground shadow-lg">
                      {periodOptions.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                  {language === 'es' ? 'Tipo de obra' : 'Work type'}
                  <Select value={String(addGeneroId)} onValueChange={(v) => setAddGeneroId(Number(v))}>
                    <SelectTrigger className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm">
                      <SelectValue placeholder={language === 'es' ? 'Selecciona tipo' : 'Select type'} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-border bg-card text-foreground shadow-lg">
                      {generoOptions.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {language === 'es'
                      ? 'Se guardará como género asociado a la obra.'
                      : 'Saved as the genre associated with the work.'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'es'
                      ? `Código sugerido: ${suggestedCode}`
                      : `Suggested code: ${suggestedCode}`}
                  </p>
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                  {language === 'es' ? 'Compositor' : 'Composer'}
                  <div className="relative">
                    <Input
                      value={addComposer}
                      onChange={(e) => {
                        setAddComposer(e.target.value);
                        setShowComposerList(true);
                      }}
                      onFocus={() => setShowComposerList(true)}
                      onBlur={() => setTimeout(() => setShowComposerList(false), 150)}
                      placeholder={language === 'es' ? 'Selecciona o escribe un compositor' : 'Select or type a composer'}
                    />
                    {showComposerList && authors.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-border bg-card shadow-lg">
                        {authors
                          .filter((a) =>
                            a.toLowerCase().includes(addComposer.trim().toLowerCase())
                          )
                          .slice(0, 50)
                          .map((a) => (
                            <button
                              key={a}
                              type="button"
                              onClick={() => {
                                setAddComposer(a);
                                setShowComposerList(false);
                              }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                              {a}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'es'
                      ? 'Se guardará en compositor y heredado. Si es pieza dentro de colección, solo en heredado.'
                      : 'Saved into composer and inherited. If it is a child, only inherited.'}
                  </p>
                </label>
              </div>

              {!addIsCollection ? (
                <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                    {language === 'es' ? 'Título' : 'Title'}
                    <Input
                      value={addTitle}
                      onChange={(e) => setAddTitle(e.target.value)}
                      placeholder={language === 'es' ? 'Título de la obra' : 'Work title'}
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                    {language === 'es' ? 'Voces' : 'Voices'}
                    <div className="relative">
                      <Input
                        value={addVoices}
                        onChange={(e) => {
                          setAddVoices(e.target.value);
                          setShowVoicesList(true);
                        }}
                        onFocus={() => setShowVoicesList(true)}
                        onBlur={() => setTimeout(() => setShowVoicesList(false), 150)}
                        placeholder={language === 'es' ? 'Selecciona o escribe voces' : 'Select or type voices'}
                      />
                      {showVoicesList && voicesOptions.length > 0 && (
                        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-border bg-card shadow-lg">
                          {voicesOptions
                            .filter((v) =>
                              v.toLowerCase().includes(addVoices.trim().toLowerCase())
                            )
                            .slice(0, 50)
                            .map((v) => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => {
                                  setAddVoices(v);
                                  setShowVoicesList(false);
                                }}
                                className="block w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                              >
                                {v}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              ) : (
                <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                  {language === 'es' ? 'Título' : 'Title'}
                  <Input
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder={language === 'es' ? 'Título de la obra' : 'Work title'}
                  />
                </label>
              )}

              {collectionReady && (
                <div className="space-y-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-accent-foreground bg-accent/80 rounded-full px-3 py-1 inline-flex">
                    {language === 'es' ? 'Piezas de la colección' : 'Collection pieces'}
                  </div>
                  <div className="grid grid-cols-[1fr,2fr,1.2fr,auto] gap-2 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
                    <span>{language === 'es' ? 'Código' : 'Code'}</span>
                    <span>{language === 'es' ? 'Título' : 'Title'}</span>
                    <span>{language === 'es' ? 'Voces' : 'Voices'}</span>
                    <span></span>
                  </div>

                  {collectionItems.map((item, index) => (
                    <div
                      key={item.code}
                      className={`grid grid-cols-[auto,1fr,2fr,1.2fr,auto] gap-2 items-center rounded-lg px-2 py-1 ${
                        dragOverIndex === index ? 'ring-2 ring-accent/70 bg-accent/10' : ''
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverIndex(index);
                      }}
                      onDrop={() => {
                        if (dragIndex === null || dragIndex === index) return;
                        setCollectionItems((prev) => {
                          const next = [...prev];
                          const [moved] = next.splice(dragIndex, 1);
                          next.splice(index, 0, moved);
                          return renumberCollectionItems(next);
                        });
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === index) setDragOverIndex(null);
                      }}
                    >
                      <button
                        type="button"
                        className="text-secondary-foreground hover:text-foreground cursor-move"
                        title={language === 'es' ? 'Reordenar' : 'Reorder'}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', String(index));
                          setDragIndex(index);
                        }}
                        onDragEnd={() => {
                          setDragIndex(null);
                          setDragOverIndex(null);
                        }}
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <Input value={item.code} disabled className="h-9" />
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const nextTitle = e.target.value;
                          setCollectionItems((prev) =>
                            prev.map((p) =>
                              p.code === item.code ? { ...p, title: nextTitle } : p,
                            ),
                          );
                        }}
                        className="h-9"
                      />
                      <Input
                        value={item.voices}
                        onChange={(e) => {
                          const nextVoices = e.target.value;
                          setCollectionItems((prev) =>
                            prev.map((p) =>
                              p.code === item.code ? { ...p, voices: nextVoices } : p,
                            ),
                          );
                        }}
                        className="h-9"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          title={language === 'es' ? 'Eliminar' : 'Remove'}
                          onClick={() => {
                            setCollectionItems((prev) =>
                              renumberCollectionItems(prev.filter((p) => p.code !== item.code)),
                            );
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-[1fr,2fr,1.2fr,auto] gap-2 items-center">
                    <Input value={nextCollectionCode} disabled className="h-9" />
                    <Input
                      value={collectionDraft.title}
                      onChange={(e) => setCollectionDraft((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder={language === 'es' ? 'Título de la pieza' : 'Piece title'}
                      className="h-9"
                    />
                    <div className="relative">
                      <Input
                        value={collectionDraft.voices}
                        onChange={(e) =>
                          setCollectionDraft((prev) => ({ ...prev, voices: e.target.value }))
                        }
                        onFocus={() => setShowVoicesList(true)}
                        onBlur={() => setTimeout(() => setShowVoicesList(false), 150)}
                        placeholder={language === 'es' ? 'Voces' : 'Voices'}
                        className="h-9"
                      />
                      {showVoicesList && voicesOptions.length > 0 && (
                        <div className="absolute z-50 mt-1 w-full max-h-40 overflow-auto rounded-xl border border-border bg-card shadow-lg">
                          {voicesOptions
                            .filter((v) =>
                              v.toLowerCase().includes(collectionDraft.voices.trim().toLowerCase())
                            )
                            .slice(0, 50)
                            .map((v) => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => {
                                  setCollectionDraft((prev) => ({ ...prev, voices: v }));
                                  setShowVoicesList(false);
                                }}
                                className="block w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                              >
                                {v}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        title={language === 'es' ? 'Guardar' : 'Save'}
                        onClick={() => {
                          if (!collectionDraft.title.trim()) return;
                          setCollectionItems((prev) =>
                            renumberCollectionItems([
                              ...prev,
                              {
                                code: nextCollectionCode,
                                title: collectionDraft.title,
                                voices: collectionDraft.voices,
                              },
                            ]),
                          );
                          setCollectionDraft({ title: '', voices: '' });
                        }}
                      >
                        ✓
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        title={language === 'es' ? 'Cancelar' : 'Cancel'}
                        onClick={() => {
                          if (
                            !window.confirm(
                              language === 'es'
                                ? '¿Cancelar esta fila? No se guardará.'
                                : 'Cancel this row? It will not be saved.'
                            )
                          )
                            return;
                          setCollectionDraft({ title: '', voices: '' });
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  const msg =
                    language === 'es'
                      ? '¿Seguro que quieres cancelar? No se guardará la información.'
                      : 'Are you sure you want to cancel? Information will not be saved.';
                  if (!window.confirm(msg)) return;
                  setAddOpen(false);
                }}
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </Button>
              <Button
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  if (addIsCollection) {
                    if (collectionItems.length === 0) {
                      alert(
                        language === 'es'
                          ? 'Añade al menos una pieza antes de guardar.'
                          : 'Add at least one piece before saving.'
                      );
                      return;
                    }
                    const payload = {
                      number: suggestedCode,
                      period_id: addPeriodId,
                      genero_id: addGeneroId,
                      title: addTitle,
                      composer: addComposer || null,
                      items: collectionItems.map((item) => ({
                        number: item.code,
                        title: item.title,
                        voices: item.voices || null,
                      })),
                    };
                    try {
                      setIsSaving(true);
                      const res = await fetch('/api/repertory/collection', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                      });
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        alert(err?.error || 'No se pudo guardar la colección.');
                        return;
                      }
                      await refreshRepertoire();
                      setAddOpen(false);
                      setAddIsCollection(false);
                      setCollectionItems([]);
                      setCollectionDraft({ title: '', voices: '' });
                      setAddTitle('');
                      setAddComposer('');
                      setAddVoices('');
                    } finally {
                      setIsSaving(false);
                    }
                    return;
                  }
                  if (!addIsCollection) {
                    const payload = {
                      number: suggestedCode,
                      parent_number: null,
                      period_id: addPeriodId,
                      genero_id: addGeneroId,
                      title: addTitle,
                      composer: addComposer || null,
                      composer_inherited: addComposer || null,
                      voices: addVoices || null,
                      voices_inherited: addVoices || null,
                      note: null,
                      raw_text: null,
                      is_collection: 0,
                    };
                    const res = await fetch('/api/repertory', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) {
                      alert('No se pudo guardar la obra.');
                      return;
                    }
                    await refreshRepertoire();
                    setAddOpen(false);
                  }
                }}
              >
                {language === 'es' ? 'Guardar' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="w-[80vw] max-w-none bg-background">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {language === 'es' ? 'Editar repertorio' : 'Edit repertoire'}
              </DialogTitle>
            </DialogHeader>
            {editLoading ? (
              <p className="text-sm text-secondary-foreground">
                {language === 'es' ? 'Cargando...' : 'Loading...'}
              </p>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                    {language === 'es' ? 'Periodo' : 'Period'}
                    <Select value={String(editPeriodId)} onValueChange={(v) => setEditPeriodId(Number(v))}>
                      <SelectTrigger className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm">
                        <SelectValue placeholder={language === 'es' ? 'Selecciona periodo' : 'Select period'} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-border bg-card text-foreground shadow-lg">
                        {periodOptions.map((option) => (
                          <SelectItem key={option.id} value={String(option.id)}>
                            {option.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                    {language === 'es' ? 'Tipo de obra' : 'Work type'}
                    <Select value={String(editGeneroId)} onValueChange={(v) => setEditGeneroId(Number(v))}>
                      <SelectTrigger className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm">
                        <SelectValue placeholder={language === 'es' ? 'Selecciona tipo' : 'Select type'} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-border bg-card text-foreground shadow-lg">
                        {generoOptions.map((option) => (
                          <SelectItem key={option.id} value={String(option.id)}>
                            {option.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                    {language === 'es' ? 'Compositor' : 'Composer'}
                    <div className="relative">
                      <Input
                        value={editComposer}
                        onChange={(e) => {
                          setEditComposer(e.target.value);
                          setShowEditComposerList(true);
                        }}
                        onFocus={() => setShowEditComposerList(true)}
                        onBlur={() => setTimeout(() => setShowEditComposerList(false), 150)}
                        placeholder={language === 'es' ? 'Selecciona o escribe un compositor' : 'Select or type a composer'}
                      />
                      {showEditComposerList && authors.length > 0 && (
                        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-border bg-card shadow-lg">
                          {authors
                            .filter((a) =>
                              a.toLowerCase().includes(editComposer.trim().toLowerCase())
                            )
                            .slice(0, 50)
                            .map((a) => (
                              <button
                                key={a}
                                type="button"
                                onClick={() => {
                                  setEditComposer(a);
                                  setShowEditComposerList(false);
                                }}
                                className="block w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                              >
                                {a}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {!editIsCollection ? (
                  <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                    <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                      {language === 'es' ? 'Título' : 'Title'}
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder={language === 'es' ? 'Título de la obra' : 'Work title'}
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                      {language === 'es' ? 'Voces' : 'Voices'}
                      <div className="relative">
                        <Input
                          value={editVoices}
                          onChange={(e) => {
                            setEditVoices(e.target.value);
                            setShowEditVoicesList(true);
                          }}
                          onFocus={() => setShowEditVoicesList(true)}
                          onBlur={() => setTimeout(() => setShowEditVoicesList(false), 150)}
                          placeholder={language === 'es' ? 'Selecciona o escribe voces' : 'Select or type voices'}
                        />
                        {showEditVoicesList && voicesOptions.length > 0 && (
                          <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-border bg-card shadow-lg">
                            {voicesOptions
                              .filter((v) =>
                                v.toLowerCase().includes(editVoices.trim().toLowerCase())
                              )
                              .slice(0, 50)
                              .map((v) => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => {
                                    setEditVoices(v);
                                    setShowEditVoicesList(false);
                                  }}
                                  className="block w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                >
                                  {v}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                    {language === 'es' ? 'Título' : 'Title'}
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder={language === 'es' ? 'Título de la obra' : 'Work title'}
                    />
                  </label>
                )}

                {editIsCollection && (
                  <div className="space-y-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-accent-foreground bg-accent/80 rounded-full px-3 py-1 inline-flex">
                      {language === 'es' ? 'Piezas de la colección' : 'Collection pieces'}
                    </div>
                    <div className="grid grid-cols-[auto,1fr,2fr,1.2fr,auto] gap-2 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
                      <span></span>
                      <span>{language === 'es' ? 'Código' : 'Code'}</span>
                      <span>{language === 'es' ? 'Título' : 'Title'}</span>
                      <span>{language === 'es' ? 'Voces' : 'Voices'}</span>
                      <span></span>
                    </div>

                    {editItems.map((item, index) => (
                      <div
                        key={item.code}
                        className={`grid grid-cols-[auto,1fr,2fr,1.2fr,auto] gap-2 items-center rounded-lg px-2 py-1 ${
                          editDragOverIndex === index ? 'ring-2 ring-accent/70 bg-accent/10' : ''
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setEditDragOverIndex(index);
                        }}
                        onDrop={() => {
                          if (editDragIndex === null || editDragIndex === index) return;
                          setEditItems((prev) => {
                            const next = [...prev];
                            const [moved] = next.splice(editDragIndex, 1);
                            next.splice(index, 0, moved);
                            return renumberEditItems(next);
                          });
                          setEditDragIndex(null);
                          setEditDragOverIndex(null);
                        }}
                        onDragLeave={() => {
                          if (editDragOverIndex === index) setEditDragOverIndex(null);
                        }}
                      >
                        <button
                          type="button"
                          className="text-secondary-foreground hover:text-foreground cursor-move"
                          title={language === 'es' ? 'Reordenar' : 'Reorder'}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', String(index));
                            setEditDragIndex(index);
                          }}
                          onDragEnd={() => {
                            setEditDragIndex(null);
                            setEditDragOverIndex(null);
                          }}
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <Input value={item.code} disabled className="h-9" />
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const nextTitle = e.target.value;
                            setEditItems((prev) =>
                              prev.map((p) =>
                                p.code === item.code ? { ...p, title: nextTitle } : p,
                              ),
                            );
                          }}
                          className="h-9"
                        />
                        <Input
                          value={item.voices}
                          onChange={(e) => {
                            const nextVoices = e.target.value;
                            setEditItems((prev) =>
                              prev.map((p) =>
                                p.code === item.code ? { ...p, voices: nextVoices } : p,
                              ),
                            );
                          }}
                          className="h-9"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          title={language === 'es' ? 'Eliminar' : 'Remove'}
                          onClick={() => {
                            setEditItems((prev) =>
                              renumberEditItems(prev.filter((p) => p.code !== item.code)),
                            );
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  const msg =
                    language === 'es'
                      ? '¿Seguro que quieres cancelar? No se guardarán los cambios.'
                      : 'Are you sure you want to cancel? Changes will not be saved.';
                  if (!window.confirm(msg)) return;
                  setEditOpen(false);
                }}
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </Button>
              <Button
                type="button"
                disabled={editSaving || editLoading}
                onClick={async () => {
                  try {
                    setEditSaving(true);
                    if (editIsCollection) {
                      if (editItems.length === 0) {
                        alert(
                          language === 'es'
                            ? 'Añade al menos una pieza antes de guardar.'
                            : 'Add at least one piece before saving.'
                        );
                        return;
                      }
                      const payload = {
                        number: editNumber,
                        period_id: editPeriodId,
                        genero_id: editGeneroId,
                        title: editTitle,
                        composer: editComposer || null,
                        items: editItems.map((item) => ({
                          id: item.id,
                          title: item.title,
                          voices: item.voices || null,
                        })),
                      };
                      const res = await fetch('/api/repertory/collection', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                      });
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        alert(err?.error || 'No se pudo guardar la colección.');
                        return;
                      }
                    } else {
                      const payload = {
                        title: editTitle,
                        composer: editComposer || null,
                        voices: editVoices || null,
                        period_id: editPeriodId,
                        genero_id: editGeneroId,
                      };
                      const res = await fetch(`/api/repertory/${editNumber}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                      });
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        alert(err?.error || 'No se pudo guardar la obra.');
                        return;
                      }
                    }
                    await refreshRepertoire();
                    setEditOpen(false);
                  } finally {
                    setEditSaving(false);
                  }
                }}
              >
                {language === 'es' ? 'Guardar cambios' : 'Save changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      </section>

    {/* Mini reproductor flotante */}
    {player && player.src && (
      <div
        className="fixed bottom-6 left-6 sm:left-8 z-50 w-80 max-w-[92vw] rounded-2xl border border-accent/40 bg-card shadow-2xl backdrop-blur-md p-4 space-y-3"
        style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-secondary-foreground font-semibold">
              {language === 'es' ? 'Reproduciendo' : 'Now playing'}
            </p>
            <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
              {player.title}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPlayer(null)}
            className="text-secondary-foreground hover:text-accent font-semibold text-sm"
          >
            ✕
          </button>
        </div>
        <audio
          controls
          autoPlay
          className="w-full"
          style={{ accentColor: "#c8a45a" }}
        >
          <source src={player.src} type="audio/mpeg" />
          {language === 'es' ? 'Tu navegador no soporta audio.' : 'Your browser does not support audio.'}
        </audio>
      </div>
    )}
    </>
  );
}

