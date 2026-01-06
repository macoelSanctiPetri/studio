import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { isDbEnabled } from '@/lib/runtime-env';
import { getDbPool } from '@/lib/db';
import { mediaVideos } from '@/data/media';

type VideoRow = {
  slug: string; // número de repertorio o id
  src: string; // url de youtube
  title?: string;
  note?: string;
  parent_number?: string;
};

// Fallback estático (sin DB): asignamos números de repertorio conocidos
const staticVideos: VideoRow[] = [
  {
    slug: '405',
    src: 'https://www.youtube.com/watch?v=bn-AzifndPQ',
    title: 'Ave verum corpus - W. A. Mozart',
    note: 'Concierto en St. Peterskirche (Viena).',
  },
  {
    slug: '151',
    src: 'https://www.youtube.com/watch?v=wpoYWmjf_lg',
    title: 'Versa est in Luctum - F. de Peñalosa',
    note: 'Concierto Santa Cueva de Cádiz.',
  },
  {
    slug: '301.2',
    src: 'https://www.youtube.com/watch?v=J175qXpqlSg',
    title: 'Rey a quien Reyes adoran',
    note: 'Iglesia San José Artesano – San Fernando (Cádiz).',
    parent_number: '301',
  },
  {
    slug: '512',
    src: 'https://www.youtube.com/watch?v=Z-LLvd9OX5Y',
    title: 'Brindis - W. A. Mozart',
    note: 'Celebración Día de Europa 2024 – Patio de las Naciones.',
  },
  // Falta Requiem hasta que se asigne número
];

async function loadFromDb(): Promise<VideoRow[]> {
  const pool = await getDbPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT v.repertorio_number AS slug,
            v.video_url AS src,
            v.title,
            v.note,
            r.parent_number
     FROM repertorio_video v
     LEFT JOIN repertorio r ON r.number = v.repertorio_number
     ORDER BY v.id`,
  );
  return rows.map((r) => ({
    slug: r.slug?.toString?.() ?? '',
    src: r.src ?? '',
    title: r.title ?? '',
    note: r.note ?? '',
    parent_number: r.parent_number?.toString?.(),
  }));
}

export async function GET() {
  try {
    const rows = isDbEnabled() ? await loadFromDb() : staticVideos;
    return NextResponse.json({ rows });
  } catch (err) {
    console.error('Error cargando videos', err);
    const message = err instanceof Error ? err.message : 'No se pudieron cargar los videos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
