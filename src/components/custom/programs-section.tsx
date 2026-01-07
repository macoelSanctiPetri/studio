"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { loadPrograms, Program, ProgramType } from "@/lib/programs-loader";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Search, Music2, ListFilter, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    loadPrograms().then(setPrograms);
  }, []);

  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();

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

        <div className="mt-8 grid gap-4 sm:grid-cols-[220px_1fr]">
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
                      <h3 className="text-2xl font-headline font-bold text-foreground leading-tight">
                        {language === "es"
                          ? `Programa ${toRoman(p.displayNum ?? filtered.indexOf(p) + 1)}: ${p.name}`
                          : `Program ${toRoman(p.displayNum ?? filtered.indexOf(p) + 1)}: ${p.name}`}
                      </h3>
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
  );
}
