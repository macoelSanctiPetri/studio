"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { Download, Music2, Play, Camera } from "lucide-react";
import PhotosCarousel from "./photos-carousel";
import { mediaVideos } from "@/data/media";

type CsvRow = {
  period: string;
  group_name: string;
  number: string;
  parent_number: string;
  is_collection: string;
  title: string;
  composer?: string;
  composer_inherited?: string;
  arranger?: string;
  voices?: string;
  voices_inherited?: string;
  note?: string;
  raw_text?: string;
};

type AudioDefinition = {
  slug: string;
  match: string;
  src: string;
  period?: string;
  group?: string;
};

type AudioTrack = {
  slug: string;
  title: string;
  composer?: string;
  period?: string;
  group?: string;
  collection?: string;
  src: string;
};

const audioDefinitions: AudioDefinition[] = [
  { slug: "verbo-caro", match: "verbum caro", src: "/audio/Verbum_Caro.mp3" },
  { slug: "jubilate-deo", match: "jubilate", src: "/audio/Jubilate_deo.mp3" },
  { slug: "coventry-carol", match: "coventry carol", src: "/audio/Coventry_Carol.mp3" },
  { slug: "tambalagumba", match: "tambalagumba", src: "/audio/Tambalagumba.mp3" },
  { slug: "nino-de-mil-sales", match: "nino de mil sales", src: "/audio/nino_de_mil_sales.mp3" },
  {
    slug: "nino-dios",
    match: "nino dios d amor herido",
    src: "/audio/Nino_dios_de_amor_herido.mp3",
    period: "Polifonía del Renacimiento",
    group: "Navideñas",
  },
];

const normalize = (value?: string) =>
  (value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/gi, "")
    .toLowerCase();

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (k: string) => headers.findIndex((h) => h === k);
  const indices = {
    period: idx("period"),
    group_name: idx("group_name"),
    number: idx("number"),
    parent_number: idx("parent_number"),
    is_collection: idx("is_collection"),
    title: idx("title"),
    composer: idx("composer"),
    composer_inherited: idx("composer_inherited"),
    arranger: idx("arranger"),
    voices: idx("voices"),
    voices_inherited: idx("voices_inherited"),
    note: idx("note"),
    raw_text: idx("raw_text"),
  };

  const get = (cols: string[], key: keyof typeof indices) => {
    const i = indices[key];
    return i >= 0 ? cols[i] || "" : "";
  };

  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    return {
      period: get(cols, "period"),
      group_name: get(cols, "group_name"),
      number: get(cols, "number"),
      parent_number: get(cols, "parent_number"),
      is_collection: get(cols, "is_collection"),
      title: get(cols, "title"),
      composer: get(cols, "composer"),
      composer_inherited: get(cols, "composer_inherited"),
      arranger: get(cols, "arranger"),
      voices: get(cols, "voices"),
      voices_inherited: get(cols, "voices_inherited"),
      note: get(cols, "note"),
      raw_text: get(cols, "raw_text"),
    };
  });
}

export default function MediaSection() {
  const { language } = useLanguage();
  const isEs = language === "es";
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/data/repertorio.csv", { cache: "no-store" });
        if (!res.ok) throw new Error("csv fetch failed");
        const text = await res.text();
        const rows = parseCsv(text);
        const mapped: AudioTrack[] = audioDefinitions.map((def) => {
          const matchNorm = normalize(def.match);
          const candidates = rows.filter((r) =>
            [r.title, r.raw_text].some((v) => normalize(v).includes(matchNorm))
          );
          const pickScore = (r: CsvRow) =>
            (normalize(r.group_name).includes("nav") ? 2 : 0) +
            (r.is_collection === "0" ? 1 : 0);
          const row = candidates.sort((a, b) => pickScore(b) - pickScore(a))[0];
          const composer = row?.composer?.trim() || row?.composer_inherited?.trim();
          const forcedTitle =
            def.slug === "nino-dios" ? "Niño Dios D´Amor Herido" : undefined;
          const forcedComposer = def.slug === "nino-dios" ? "F. Guerrero" : undefined;
          const collection =
            row?.parent_number &&
            rows.find(
              (r) => r.number === row.parent_number && r.is_collection === "1"
            )?.title;
          return {
            slug: def.slug,
            title: forcedTitle || row?.title?.trim() || row?.raw_text?.trim() || def.match,
            composer: forcedComposer || composer,
            period: def.period || row?.period?.trim(),
            group: def.group || row?.group_name?.trim(),
            collection: collection?.trim(),
            src: def.src,
          };
        });
        setTracks(mapped);
      } catch (err) {
        console.warn("No se pudo leer repertorio.csv para audios", err);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const headerLabel = isEs ? "Escucha nuestra música" : "Listen to our music";
  const emptyLabel = isEs
    ? "No se encontraron las obras en el repertorio."
    : "The requested works were not found in the repertoire.";

  return (
    <>
      <section
        id="media"
        className="py-24 sm:py-32 bg-background text-[#f7f2e8]"
      >
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="w-10 h-0.5 bg-secondary mb-4" />
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl text-white">
            {isEs ? "Multimedia" : "Media"}
          </h2>
          <p className="mt-3 text-lg text-white font-body max-w-3xl">
            {isEs
              ? "Fotos, vídeos y audios destacados del coro."
              : "Featured photos, videos, and audio tracks from the choir."}
          </p>

          {/* Fotos */}
        <div className="mt-10" id="photos">
          <div className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-white mb-2">
            <Camera className="h-4 w-4 text-accent" />
            <span>{isEs ? "Fotos" : "Photos"}</span>
          </div>
          <PhotosCarousel embedded />
        </div>

        {/* Vídeos */}
        <div className="mt-12" id="media-videos">
          <div className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-white mb-3">
            <Play className="h-4 w-4 text-accent" />
            <span>{isEs ? "Vídeos" : "Videos"}</span>
          </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {mediaVideos.map((video) => (
                <article
                  key={video.id}
                  className="rounded-2xl border bg-card shadow-sm overflow-hidden"
                  style={{
                    borderColor: "rgba(200,164,90,0.8)",
                    boxShadow: "0 0 0 2px rgba(200,164,90,0.28), 0 12px 32px rgba(0,0,0,0.14)",
                  }}
                >
                  <div className="relative aspect-video bg-neutral-900">
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={video.title[isEs ? "es" : "en"]}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-headline font-semibold text-foreground flex items-center gap-2">
                      <Play className="h-4 w-4 text-accent" />
                      {video.title[isEs ? "es" : "en"]}
                    </h3>
                    {video.note && (
                      <p className="text-sm text-secondary-foreground">
                        {video.note[isEs ? "es" : "en"]}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>

        {/* Audios */}
        <div className="mt-12" id="media-audios">
          <div className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-white mb-3">
            <Music2 className="h-4 w-4 text-accent" />
            <span>{headerLabel}</span>
          </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {loading && (
                <p className="text-secondary-foreground text-sm">{isEs ? "Cargando audios..." : "Loading audio..."}</p>
              )}
              {!loading && tracks.length === 0 && (
                <p className="text-secondary-foreground text-sm">{emptyLabel}</p>
              )}
              {!loading &&
                tracks.map((audio) => (
                  <article
                    key={audio.slug}
                    className="rounded-2xl border bg-card shadow-sm p-4 flex flex-col gap-3"
                    style={{
                      borderColor: "rgba(200,164,90,0.8)",
                      boxShadow: "0 0 0 2px rgba(200,164,90,0.28), 0 10px 26px rgba(0,0,0,0.12)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
                      <span>
                        {[audio.group, audio.period].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    <h3 className="text-lg font-headline font-semibold text-foreground flex items-center gap-2">
                      <Music2 className="h-4 w-4 text-accent" />
                      {audio.title}
                    </h3>
                    <p className="text-sm text-secondary-foreground">
                      {audio.composer || (isEs ? "Datos incompletos en el CSV" : "Incomplete data in CSV")}
                    </p>
                    {audio.collection && (
                      <p className="text-xs text-secondary-foreground/90">
                        {isEs ? "Colección: " : "Collection: "}
                        {audio.collection}
                      </p>
                    )}
                    <audio
                      controls
                      className="w-full audio-gold"
                      preload="none"
                      style={{
                        accentColor: "#c8a45a",
                      }}
                    >
                      <source src={audio.src} type="audio/mpeg" />
                      {isEs ? "Tu navegador no soporta audio." : "Your browser does not support audio."}
                    </audio>
                    <div className="flex justify-end">
                      <a
                        href={audio.src}
                        download
                        className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent"
                      >
                        <Download className="h-4 w-4" />
                        {isEs ? "Descargar MP3" : "Download MP3"}
                      </a>
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </div>
      </section>
      <style jsx global>{`
        .audio-gold::-webkit-media-controls-panel {
          background-color: #c8a45a;
          color: #2b241c;
          border-radius: 12px;
        }
        .audio-gold::-webkit-media-controls-play-button,
        .audio-gold::-webkit-media-controls-mute-button,
        .audio-gold::-webkit-media-controls-timeline,
        .audio-gold::-webkit-media-controls-volume-slider,
        .audio-gold::-webkit-media-controls-enclosure,
        .audio-gold::-webkit-media-controls-toggle-closed-captions-button,
        .audio-gold::-webkit-media-controls-fullscreen-button {
          filter: saturate(1.15) brightness(1.05);
        }
        .audio-gold::-webkit-media-controls-current-time-display,
        .audio-gold::-webkit-media-controls-time-remaining-display {
          color: #2b241c;
        }
        .audio-gold::-webkit-media-controls-timeline,
        .audio-gold::-webkit-media-controls-timeline-container {
          background-color: #d7b673;
          border-radius: 999px;
          padding: 2px;
        }
        .audio-gold::-webkit-media-controls-volume-slider {
          background-color: #d7b673;
          border-radius: 999px;
        }
      `}</style>
    </>
  );
}
