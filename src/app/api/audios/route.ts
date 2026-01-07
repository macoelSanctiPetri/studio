import { NextResponse } from 'next/server';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import type { RowDataPacket } from 'mysql2';
import { isDbEnabled } from '@/lib/runtime-env';
import { getDbPool } from '@/lib/db';
import { CsvRow, parseRepertoireCsv } from '@/lib/repertoire-shared';

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
  parent_number?: string;
};

const audioDefinitions: AudioDefinition[] = [
  { slug: 'verbo-caro', match: 'verbum caro', src: '/audio/Verbum_Caro.mp3' },
  { slug: 'jubilate-deo', match: 'jubilate', src: '/audio/Jubilate_deo.mp3' },
  { slug: 'coventry-carol', match: 'coventry carol', src: '/audio/Coventry_Carol.mp3' },
  { slug: 'tambalagumba', match: 'tambalagumba', src: '/audio/Tambalagumba.mp3' },
  { slug: 'nino-de-mil-sales', match: 'nino de mil sales', src: '/audio/nino_de_mil_sales.mp3' },
  {
    slug: 'nino-dios',
    match: 'nino dios d amor herido',
    src: '/audio/Nino_dios_de_amor_herido.mp3',
    period: 'Polifonía del Renacimiento',
    group: 'Navideñas',
  },
];

const slugNumberFallback: Record<string, string> = {
  'verbo-caro': '301.3',
  'jubilate-deo': '326',
  'coventry-carol': '306',
  'tambalagumba': '623',
  'nino-de-mil-sales': '321',
  'nino-dios': '303',
};

const normalize = (value?: string) =>
  (value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s]/gi, '')
    .toLowerCase();

async function loadFromCsv(): Promise<AudioTrack[]> {
  const file = path.join(process.cwd(), 'public', 'data', 'repertorio.csv');
  const content = await fs.readFile(file, 'utf8');
  const rows: CsvRow[] = parseRepertoireCsv(content);

  const getCollectionTitle = (parent?: string) =>
    parent
      ? rows.find((r) => r.number === parent && r.is_collection === '1')?.title?.trim()
      : undefined;

  return audioDefinitions.map((def) => {
    const matchNorm = normalize(def.match);
    const candidates = rows.filter((r) =>
      [r.title, r.raw_text].some((v) => normalize(v).includes(matchNorm)),
    );
    const pickScore = (r: CsvRow) =>
      (normalize(r.group_name).includes('nav') ? 2 : 0) + (r.is_collection === '0' ? 1 : 0);
    const row = candidates.sort((a, b) => pickScore(b) - pickScore(a))[0];
    const composer = row?.composer?.trim() || row?.composer_inherited?.trim();
    const forcedTitle = def.slug === 'nino-dios' ? 'Niño Dios D\'Amor Herido' : undefined;
    const forcedComposer = def.slug === 'nino-dios' ? 'F. Guerrero' : undefined;
    const collection = getCollectionTitle(row?.parent_number);

    return {
      slug: row?.number || slugNumberFallback[def.slug] || def.slug,
      title: forcedTitle || row?.title?.trim() || row?.raw_text?.trim() || def.match,
      composer: forcedComposer || composer,
      period: def.period || row?.period?.trim(),
      group: def.group || row?.group_name?.trim(),
      collection: collection?.trim(),
      src: def.src,
      parent_number: row?.parent_number,
    };
  });
}

async function loadFromDb(): Promise<AudioTrack[]> {
  const pool = await getDbPool();

  // Cargamos repertorio para obtener títulos/compositores y colecciones
  const [repRows] = await pool.query<RowDataPacket[]>(
    `SELECT r.number,
            r.parent_number,
            r.is_collection,
            r.title,
            r.composer,
            r.composer_inherited,
            p.descripcion AS period,
            g.nombre AS group_name
     FROM repertorio r
     LEFT JOIN periodos p ON p.id = r.period_id
     LEFT JOIN generos g ON g.id = r.genero_id`,
  );
  const repMap = new Map<
    string,
    {
      number: string;
      parent_number?: string;
      is_collection: string;
      title?: string;
      composer?: string;
      composer_inherited?: string;
      period?: string;
      group_name?: string;
    }
  >();
  repRows.forEach((r) =>
    repMap.set(r.number?.toString?.() ?? '', {
      number: r.number?.toString?.() ?? '',
      parent_number: r.parent_number?.toString?.(),
      is_collection: r.is_collection?.toString?.() ?? '0',
      title: r.title ?? '',
      composer: r.composer ?? '',
      composer_inherited: r.composer_inherited ?? '',
      period: r.period ?? '',
      group_name: r.group_name ?? '',
    }),
  );

  const getCollectionTitle = (parent?: string) => {
    if (!parent) return undefined;
    const r = repMap.get(parent);
    return r && r.is_collection === '1' ? r.title : undefined;
  };

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT repertorio_number, audio_url
     FROM repertorio_audio
     ORDER BY repertorio_number, id`,
  );

  return rows.map((r) => {
    const rep = repMap.get(r.repertorio_number?.toString?.() ?? '');
    return {
      slug: rep?.number || r.repertorio_number?.toString?.() || r.audio_url,
      title: rep?.title || r.audio_url,
      composer: rep?.composer || rep?.composer_inherited,
      period: rep?.period,
      group: rep?.group_name,
      collection: getCollectionTitle(rep?.parent_number),
      src: r.audio_url,
      parent_number: rep?.parent_number,
    };
  });
}

export async function GET() {
  try {
    const rows = isDbEnabled() ? await loadFromDb() : await loadFromCsv();
    return NextResponse.json({ rows });
  } catch (err) {
    console.error('Error cargando audios', err);
    const message = err instanceof Error ? err.message : 'No se pudieron cargar los audios';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
