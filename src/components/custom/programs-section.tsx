"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { loadPrograms, Program, ProgramType } from "@/lib/programs-loader";
import { loadRepertoire } from "@/lib/repertoire-loader";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Search, Music2, ListFilter, Clock, Plus, Pencil, Trash2, GripVertical, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type FilterType = "unset" | ProgramType | "all";

const typeLabels = {
  es: {
    navideno: "Navideño",
    religioso: "Religioso",
    profano: "Profano",
    all: "Todos",
    unset: "Sin seleccionar",
  },
  en: {
    navideno: "Christmas",
    religioso: "Sacred",
    profano: "Secular",
    all: "All",
    unset: "Unset",
  },
} as const;

export default function ProgramsSection() {
  const { language } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [type, setType] = useState<FilterType>("unset");
  const [query, setQuery] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [repertoireMap, setRepertoireMap] = useState<
    Record<string, { title: string; composer?: string }>
  >({});
  const [repertoireList, setRepertoireList] = useState<
    Array<{ id: string; title: string; composer?: string }>
  >([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editType, setEditType] = useState<ProgramType>("religioso");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState<string>("");
  const [editPieces, setEditPieces] = useState<
    Array<{ number: string; part: number; notes?: string; title?: string; composer?: string }>
  >([]);
  const [activePieceIndex, setActivePieceIndex] = useState<number | null>(null);
  const [noteOpenIndex, setNoteOpenIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    loadPrograms().then(setPrograms);
    loadRepertoire().then((works) => {
      const map: Record<string, { title: string; composer?: string }> = {};
      const list: Array<{ id: string; title: string; composer?: string }> = [];
      works.forEach((w) => {
        map[w.id] = { title: w.title, composer: w.composer };
        list.push({ id: w.id, title: w.title, composer: w.composer });
        if (w.items && w.itemIds) {
          w.items.forEach((item, idx) => {
            const id = w.itemIds?.[idx];
            if (id) {
              map[id] = { title: item, composer: w.composer };
              list.push({ id, title: item, composer: w.composer });
            }
          });
        }
      });
      setRepertoireMap(map);
      setRepertoireList(list);
    });

    const checkAuth = () => {
      fetch("/api/auth/status", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { ok: false }))
        .then((d) => setIsAuthed(Boolean(d.ok)))
        .catch(() => setIsAuthed(false));
    };
    checkAuth();
    const listener = () => checkAuth();
    window.addEventListener("nm-auth-change", listener);
    return () => window.removeEventListener("nm-auth-change", listener);
  }, []);

  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();

  const normalizeProgramType = (raw?: string): ProgramType => {
    const t = (raw || "").toLowerCase();
    if (t.includes("nav")) return "navideno";
    if (t.includes("prof")) return "profano";
    return "religioso";
  };

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    const shouldShow = type !== "unset" || q.length > 0;
    if (!shouldShow) return [];

    return programs.filter((p) => {
      const typeOk = type === "unset" || type === "all" || p.type === type;
      if (!typeOk) return false;
      if (!q) return true;

      const hay = (txt?: string | null) => (txt ? normalize(txt).includes(q) : false);
      const hayEnPiezas =
        p.pieces?.some(
          (piece) =>
            hay(piece.title) || hay(piece.number) || hay(piece.composer) || hay(piece.notes)
        ) ?? false;
      return (
        hay(p.name) ||
        hay(p.description) ||
        hay(String(p.id)) ||
        hay(String(p.durationMinutes ?? "")) ||
        hayEnPiezas
      );
    });
  }, [programs, type, query]);

  const lbl = {
    heading: language === "es" ? "Programas" : "Programs",
    intro:
      language === "es"
        ? "Consulta los programas por tipo (navideño, religioso, profano), por nombre o buscando piezas/autores incluidos."
        : "Browse concert programs by type, name, or by pieces/composers contained in them.",
    type: language === "es" ? "Tipo de programa" : "Program type",
    search: language === "es" ? "Buscar por nombre, pieza o autor" : "Search by name, piece or composer",
    part1: language === "es" ? "Primera parte" : "Part I",
    part2: language === "es" ? "Segunda parte" : "Part II",
    created: language === "es" ? "Creado" : "Created",
    updated: language === "es" ? "Actualizado" : "Updated",
    pieces: language === "es" ? "Piezas" : "Pieces",
    empty: language === "es" ? "No hay programas con este filtro." : "No programs match this filter.",
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(language === "es" ? "es-ES" : "en-GB");
  };

  const partPieces = (p: Program, part: number) =>
    p.pieces
      .filter((piece) => piece.part === part)
      .sort((a, b) => a.order - b.order);

  const refreshPrograms = async () => {
    const list = await loadPrograms();
    setPrograms(list);
  };

  const openAdd = () => {
    setEditId(null);
    setEditLoading(false);
    setEditType("religioso");
    setEditName("");
    setEditDescription("");
    setEditDuration("");
    setEditPieces([]);
    setAddOpen(true);
  };

  const openEdit = async (program: Program) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await fetch(`/api/programas/${program.id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar el programa");
      const payload = await res.json();
      const p = payload?.program;
      const pieces = Array.isArray(payload?.pieces) ? payload.pieces : [];
      setEditId(program.id);
      setEditType(normalizeProgramType(p?.tipo ?? program.type));
      setEditName(p?.nombre ?? program.name);
      setEditDescription(p?.descripcion ?? program.description ?? "");
      setEditDuration(p?.duracion_total_min ? String(p.duracion_total_min) : "");
      setEditPieces(
        pieces.map((piece: any) => ({
          number: piece.pieza_number ?? piece.number ?? "",
          part: piece.parte ?? piece.part ?? 1,
          notes: piece.notas ?? piece.notes ?? "",
          title: piece.pieza_titulo ?? piece.title ?? "",
          composer: piece.pieza_compositor ?? piece.composer ?? "",
        })),
      );
    } catch (err) {
      console.error(err);
      alert(language === "es" ? "No se pudo cargar el programa." : "Unable to load program.");
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const deleteProgram = async (program: Program) => {
    const msg =
      language === "es"
        ? "¿Seguro que quieres eliminar este programa? Se borrarán también sus piezas."
        : "Are you sure you want to delete this program? Its pieces will also be deleted.";
    if (!window.confirm(msg)) return;
    const res = await fetch(`/api/programas/${program.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "No se pudo eliminar el programa.");
      return;
    }
    await refreshPrograms();
  };

  const toRoman = (n: number) => {
    const map: Array<[number, string]> = [
      [1000, "M"],
      [900, "CM"],
      [500, "D"],
      [400, "CD"],
      [100, "C"],
      [90, "XC"],
      [50, "L"],
      [40, "XL"],
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];
    let res = "";
    let num = n;
    for (const [val, sym] of map) {
      while (num >= val) {
        res += sym;
        num -= val;
      }
    }
    return res;
  };

  const labelForPart = (part: number, program: Program) => {
    const list = program.pieces.filter((piece) => piece.part === part);
    const partsCount = Array.from(new Set(program.pieces.map((p) => p.part))).length;
    // Si solo hay 2 partes, prioriza Primera/Segunda para evitar confusiones
    if (partsCount === 2) return part === 1 ? lbl.part1 : lbl.part2;

    const uniqueNotes = Array.from(new Set(list.map((p) => (p.notes || '').trim()).filter(Boolean)));
    if (uniqueNotes.length === 1) return uniqueNotes[0];

    const maxPart = Math.max(...program.pieces.map((p) => p.part || 0));
    if (maxPart === 1) return language === 'es' ? 'Parte única' : 'Single part';
    return `${language === 'es' ? 'Parte' : 'Part'} ${part}`;
  };

  return (
    <>
    <section id="programs" className="bg-muted/30 py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="w-10 h-0.5 bg-secondary mb-4" />
        <div className="flex items-center gap-3">
          <Music2 className="h-7 w-7 text-secondary" />
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {lbl.heading}
          </h2>
        </div>
        <p className="mt-4 text-lg text-secondary-foreground font-body max-w-3xl">{lbl.intro}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-[220px_1fr_auto]">
          <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
            {lbl.type}
            <Select value={type} onValueChange={(v) => setType(v as FilterType)}>
              <SelectTrigger className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm focus:border-accent focus:ring-2 focus:ring-accent">
                <SelectValue placeholder={typeLabels[language === "es" ? "es" : "en"].unset} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-card text-foreground shadow-lg">
                {(["unset", "all", "navideno", "religioso", "profano"] as FilterType[]).map((val) => (
                  <SelectItem
                    key={val}
                    value={val}
                    className="font-medium data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                  >
                    {typeLabels[language === "es" ? "es" : "en"][val as keyof typeof typeLabels["es"]]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lbl.search}
              className="pl-9 h-10 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-secondary-foreground focus:border-accent focus:ring-2 focus:ring-accent"
            />
          </div>
          {isAuthed && (
            <div className="flex items-end justify-end">
              <Button
                onClick={openAdd}
                className="h-10 rounded-xl border border-border bg-accent text-sm font-semibold text-accent-foreground hover:bg-accent/90 inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {language === "es" ? "Añadir" : "Add"}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-secondary-foreground sm:text-sm">
          <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">
            {lbl.type}:{' '}
            {typeLabels[language === "es" ? "es" : "en"][type as keyof typeof typeLabels["es"]]}
          </span>
          <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
            {lbl.pieces}: {filtered.reduce((acc, p) => acc + (p.pieces?.length || 0), 0)}
          </span>
          <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
            {language === "es" ? "Programas" : "Programs"}: {filtered.length}
          </span>
        </div>

        <div className="mt-10 space-y-6">
          {filtered.length === 0 ? (
            <p className="px-2 text-secondary-foreground">{lbl.empty}</p>
          ) : (
            filtered.map((p) => {
              const hasSecond = p.pieces.some((piece) => piece.part === 2);
              return (
                <article
                  key={p.id}
                  className="rounded-2xl border border-border/60 bg-card shadow-sm px-6 py-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="secondary" className="text-xs font-semibold uppercase">
                          {typeLabels[language === "es" ? "es" : "en"][p.type]}
                        </Badge>
                        {p.durationMinutes ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-secondary-foreground">
                            <Clock className="h-4 w-4" /> {p.durationMinutes} min
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isAuthed && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(p)}
                              className="inline-flex items-center justify-center rounded-full border border-border/60 bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition px-2 py-1"
                              title={language === "es" ? "Editar" : "Edit"}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProgram(p)}
                              className="inline-flex items-center justify-center rounded-full border border-red-500/60 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition px-2 py-1"
                              title={language === "es" ? "Eliminar" : "Delete"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        <h3 className="text-2xl font-headline font-bold text-foreground leading-tight">
                          {language === "es"
                            ? `Programa ${toRoman(p.displayNum ?? filtered.indexOf(p) + 1)}: ${p.name}`
                            : `Program ${toRoman(p.displayNum ?? filtered.indexOf(p) + 1)}: ${p.name}`}
                        </h3>
                      </div>
                      {p.description && (
                        <p className="text-secondary-foreground text-sm sm:text-base max-w-3xl">
                          {p.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase text-secondary-foreground">
                        <span>
                          {lbl.created}: {formatDate(p.createdAt)}
                        </span>
                        <span>
                          {lbl.updated}: {formatDate(p.updatedAt)}
                        </span>
                        <span>
                          {lbl.pieces}: {p.pieces.length}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-secondary-foreground text-sm">
                      <ListFilter className="h-4 w-4" />
                      {language === "es" ? "Orden por parte" : "Ordered by part"}
                    </div>
                  </div>

                  {(() => {
                    const parts = Array.from(new Set(p.pieces.map((piece) => piece.part))).sort((a, b) => a - b);
                    const cols = parts.length > 1 ? "sm:grid-cols-2" : "sm:grid-cols-1";
                    return (
                      <div className={`mt-6 grid gap-6 ${cols}`}>
                        {parts.map((part) => {
                          const list = partPieces(p, part);
                          const headerText = labelForPart(part, p);
                          const showHeader = parts.length > 1 || headerText !== '';
                          return (
                            <div
                              key={part}
                              className="space-y-3 rounded-2xl border border-border/60 bg-background/60 p-4"
                            >
                              {showHeader && (
                                <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                  <span className="inline-block h-2 w-2 rounded-full bg-secondary" />
                                  <span>{headerText}</span>
                                  <span className="text-xs font-semibold text-secondary-foreground">
                                    ({list.length})
                                  </span>
                                </h4>
                              )}
                              {list.length === 0 ? (
                                <p className="text-sm text-secondary-foreground">
                                  {language === "es" ? "Sin piezas" : "No pieces"}
                                </p>
                              ) : (
                                <ol className="space-y-2">
                                  {list.map((piece) => (
                                    <li
                                      key={`${piece.part}-${piece.order}-${piece.number}`}
                                      className="flex items-center gap-3 px-1 py-1"
                                    >
                                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold">
                                        {piece.order}
                                      </span>
                                      <p className="text-sm font-semibold text-foreground">
                                        {piece.title}
                                        {piece.composer ? ` (${piece.composer})` : ""}
                                        {piece.notes ? (
                                          <span className="text-xs font-normal text-secondary-foreground italic"> — {piece.notes}</span>
                                        ) : null}
                                      </p>
                                    </li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>

    <Dialog
      open={addOpen || editOpen}
      onOpenChange={(open) => {
        if (!open) {
          setAddOpen(false);
          setEditOpen(false);
        }
      }}
    >
      <DialogContent className="w-[80vw] max-w-none bg-background max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {language === "es"
              ? editId
                ? "Editar programa"
                : "Añadir programa"
              : editId
                ? "Edit program"
                : "Add program"}
          </DialogTitle>
        </DialogHeader>

        {editLoading ? (
          <p className="text-sm text-secondary-foreground">
            {language === "es" ? "Cargando..." : "Loading..."}
          </p>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                {language === "es" ? "Tipo de programa" : "Program type"}
                <Select value={editType} onValueChange={(v) => setEditType(v as ProgramType)}>
                  <SelectTrigger className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm">
                    <SelectValue placeholder={typeLabels[language === "es" ? "es" : "en"].unset} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-border bg-card text-foreground shadow-lg">
                    {(["navideno", "religioso", "profano"] as ProgramType[]).map((val) => (
                      <SelectItem key={val} value={val}>
                        {typeLabels[language === "es" ? "es" : "en"][val as keyof typeof typeLabels["es"]]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                {language === "es" ? "Nombre" : "Name"}
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
                {language === "es" ? "Duración (min)" : "Duration (min)"}
                <Input
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  inputMode="numeric"
                />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
              {language === "es" ? "Descripción" : "Description"}
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </label>

            <div className="space-y-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent-foreground bg-accent/80 rounded-full px-3 py-1 inline-flex">
                  {language === "es" ? "Piezas del programa" : "Program pieces"}
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {([1, 2] as number[]).map((part) => {
                  const list = editPieces
                    .map((p, idx) => ({ ...p, _idx: idx }))
                    .filter((p) => p.part === part);
                  const header = part === 1 ? lbl.part1 : lbl.part2;
                  return (
                    <div key={part} className="space-y-3 rounded-2xl border border-border/60 bg-background/60 p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-secondary" />
                          <span>{header}</span>
                          <span className="text-xs font-semibold text-secondary-foreground">
                            ({list.length})
                          </span>
                        </h4>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditPieces((prev) => [
                              ...prev,
                              { number: "", part, notes: "" },
                            ])
                          }
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {language === "es" ? "Añadir" : "Add"}
                        </Button>
                      </div>

                      {list.length === 0 ? (
                        <p className="text-sm text-secondary-foreground">
                          {language === "es" ? "Sin piezas" : "No pieces"}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {list.map((piece) => {
                            const globalIndex = piece._idx;
                            const ref = piece.number ? repertoireMap[piece.number] : undefined;
                            const isNoteOpen = noteOpenIndex === globalIndex;
                            return (
                              <div key={`${piece.number}-${part}-${globalIndex}`} className="space-y-2">
                                <div
                                  className={`grid grid-cols-[auto,1fr,auto] gap-2 items-center rounded-lg px-2 py-2 ${
                                    dragOverIndex === globalIndex ? "ring-2 ring-accent/70 bg-accent/10" : ""
                                  }`}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOverIndex(globalIndex);
                                  }}
                                  onDrop={() => {
                                    if (dragIndex === null || dragIndex === globalIndex) return;
                                    setEditPieces((prev) => {
                                      const next = [...prev];
                                      const [moved] = next.splice(dragIndex, 1);
                                      moved.part = part;
                                      next.splice(globalIndex, 0, moved);
                                      return next;
                                    });
                                    setDragIndex(null);
                                    setDragOverIndex(null);
                                  }}
                                  onDragLeave={() => {
                                    if (dragOverIndex === globalIndex) setDragOverIndex(null);
                                  }}
                                >
                                  <button
                                    type="button"
                                    className="text-secondary-foreground hover:text-foreground cursor-move"
                                    title={language === "es" ? "Reordenar" : "Reorder"}
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData("text/plain", String(globalIndex));
                                      setDragIndex(globalIndex);
                                    }}
                                    onDragEnd={() => {
                                      setDragIndex(null);
                                      setDragOverIndex(null);
                                    }}
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </button>
                                  <div className="space-y-1 relative">
                                    <Input
                                      value={piece.title ?? ""}
                                      onChange={(e) => {
                                        const title = e.target.value;
                                        const exact = repertoireList.find(
                                          (r) => normalize(r.title) === normalize(title)
                                        );
                                        setEditPieces((prev) =>
                                          prev.map((p, i) =>
                                            i === globalIndex
                                              ? {
                                                  ...p,
                                                  title,
                                                  number: exact?.id ?? p.number,
                                                  composer: exact?.composer ?? p.composer,
                                                }
                                              : p,
                                          ),
                                        );
                                        setActivePieceIndex(globalIndex);
                                      }}
                                      onFocus={() => setActivePieceIndex(globalIndex)}
                                      onBlur={() => setTimeout(() => setActivePieceIndex(null), 150)}
                                      placeholder={language === "es" ? "Nombre de la pieza" : "Piece name"}
                                    />
                                    {activePieceIndex === globalIndex && (
                                      <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-border bg-card shadow-lg">
                                        {repertoireList
                                          .filter((r) =>
                                            normalize(r.title).includes(normalize(piece.title || ""))
                                          )
                                          .slice(0, 50)
                                          .map((r) => (
                                            <button
                                              key={r.id}
                                              type="button"
                                              onClick={() => {
                                                setEditPieces((prev) =>
                                                  prev.map((p, i) =>
                                                    i === globalIndex
                                                      ? {
                                                          ...p,
                                                          title: r.title,
                                                          number: r.id,
                                                          composer: r.composer,
                                                        }
                                                      : p,
                                                  ),
                                                );
                                                setActivePieceIndex(null);
                                              }}
                                              className="block w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                            >
                                              {r.title}
                                              {r.composer ? ` · ${r.composer}` : ""}
                                            </button>
                                          ))}
                                      </div>
                                    )}
                                    {ref?.title ? (
                                      <p className="text-[11px] text-secondary-foreground">
                                        {ref.title}
                                        {ref.composer ? ` · ${ref.composer}` : ""}
                                      </p>
                                    ) : null}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant={isNoteOpen ? "secondary" : "ghost"}
                                      title={language === "es" ? "Notas" : "Notes"}
                                      onClick={() =>
                                        setNoteOpenIndex(isNoteOpen ? null : globalIndex)
                                      }
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      title={language === "es" ? "Eliminar" : "Remove"}
                                      onClick={() =>
                                        setEditPieces((prev) => prev.filter((_p, i) => i !== globalIndex))
                                      }
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                </div>
                                {isNoteOpen && (
                                  <div className="rounded-lg border border-border/60 bg-background/60 p-2">
                                    <Textarea
                                      value={piece.notes ?? ""}
                                      onChange={(e) => {
                                        const notes = e.target.value;
                                        setEditPieces((prev) =>
                                          prev.map((p, i) => (i === globalIndex ? { ...p, notes } : p)),
                                        );
                                      }}
                                      placeholder={language === "es" ? "Notas" : "Notes"}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              const msg =
                language === "es"
                  ? "¿Seguro que quieres cancelar? No se guardarán los cambios."
                  : "Are you sure you want to cancel? Changes will not be saved.";
              if (!window.confirm(msg)) return;
              setAddOpen(false);
              setEditOpen(false);
            }}
          >
            {language === "es" ? "Cancelar" : "Cancel"}
          </Button>
          <Button
            type="button"
            disabled={editSaving || editLoading}
            onClick={async () => {
              if (!editName.trim()) {
                alert(language === "es" ? "Indica un nombre." : "Please provide a name.");
                return;
              }
              const payload = {
                tipo: editType,
                nombre: editName,
                descripcion: editDescription || null,
                duracion_total_min: editDuration ? Number(editDuration) : null,
                pieces: editPieces
                  .filter((p) => p.number)
                  .map((p) => ({
                    number: p.number,
                    part: p.part,
                    notes: p.notes || null,
                  })),
              };
              try {
                setEditSaving(true);
                const res = await fetch(
                  editId ? `/api/programas/${editId}` : "/api/programas",
                  {
                    method: editId ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  },
                );
                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  alert(err?.error || (language === "es" ? "No se pudo guardar." : "Save failed."));
                  return;
                }
                await refreshPrograms();
                setAddOpen(false);
                setEditOpen(false);
              } finally {
                setEditSaving(false);
              }
            }}
          >
            {language === "es" ? "Guardar" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
