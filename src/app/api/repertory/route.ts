import { NextResponse } from 'next/server';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import type { RowDataPacket } from 'mysql2';
import { isDbEnabled } from '@/lib/runtime-env';
import { getDbPool } from '@/lib/db';
import { CsvRow, parseRepertoireCsv } from '@/lib/repertoire-shared';

async function loadFromCsv(): Promise<CsvRow[]> {
  const file = path.join(process.cwd(), 'public', 'data', 'repertorio.csv');
  const content = await fs.readFile(file, 'utf8');
  return parseRepertoireCsv(content);
}

async function loadFromDb(): Promise<CsvRow[]> {
  const pool = await getDbPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
      r.update_date,
      p.descripcion AS period,
      r.genero_id AS group_num,
      g.nombre AS group_name,
      r.number,
      r.parent_number,
      r.is_collection,
      r.title,
      r.composer,
      r.composer_inherited,
      r.arranger,
      r.voices,
      r.voices_inherited,
      r.note,
      r.page,
      r.raw_text
     FROM repertorio r
     LEFT JOIN periodos p ON p.id = r.period_id
     LEFT JOIN generos g ON g.id = r.genero_id`,
  );
  return rows.map((r) => ({
    update_date: r.update_date?.toString?.() ?? '',
    period: r.period ?? '',
    group_num: r.group_num?.toString?.() ?? '',
    group_name: r.group_name ?? '',
    number: r.number?.toString?.() ?? '',
    parent_number: r.parent_number?.toString?.() ?? '',
    is_collection: r.is_collection?.toString?.() ?? '',
    title: r.title ?? '',
    composer: r.composer ?? '',
    composer_inherited: r.composer_inherited ?? '',
    arranger: r.arranger ?? '',
    voices: r.voices ?? '',
    voices_inherited: r.voices_inherited ?? '',
    note: r.note ?? '',
    page: r.page?.toString?.() ?? '',
    raw_text: r.raw_text ?? '',
  }));
}

export async function GET() {
  try {
    const rows = isDbEnabled() ? await loadFromDb() : await loadFromCsv();
    return NextResponse.json({ rows });
  } catch (err) {
    console.error('Error cargando repertorio', err);
    const message = err instanceof Error ? err.message : 'No se pudo cargar el repertorio';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!isDbEnabled()) {
      return NextResponse.json({ error: 'DB desactivada' }, { status: 400 });
    }
    const body = await req.json().catch(() => ({}));
    const number = body.number ? String(body.number) : '';
    if (!number) {
      return NextResponse.json({ error: 'number requerido' }, { status: 400 });
    }

    const generoId = body.genero_id
      ? Number(body.genero_id)
      : body.group_name
        ? body.group_name.toLowerCase().includes('prof')
          ? 2
          : body.group_name.toLowerCase().includes('nav')
            ? 3
            : 1
        : null;
    const periodId = body.period_id
      ? Number(body.period_id)
      : body.period
        ? String(body.period).toLowerCase().includes('no renac')
          ? 2
          : 1
        : null;

    const pool = await getDbPool();
    await pool.query(
      `INSERT INTO repertorio
        (number, parent_number, period_id, genero_id, title, composer, composer_inherited, arranger, voices, voices_inherited, note, is_collection, page, update_date, raw_text)
       VALUES
        (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, NULL, CURDATE(), ?)`,
      [
        number,
        body.parent_number ?? null,
        periodId,
        generoId,
        body.title ?? null,
        body.composer ?? null,
        body.composer_inherited ?? null,
        body.voices ?? null,
        body.voices_inherited ?? null,
        body.note ?? null,
        body.is_collection ? 1 : 0,
        body.raw_text ?? null,
      ],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error insertando repertorio', err);
    const message = err instanceof Error ? err.message : 'No se pudo insertar repertorio';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
