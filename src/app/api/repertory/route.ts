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
    `SELECT update_date, period, group_num, group_name, number, parent_number, is_collection, title, composer, composer_inherited, arranger, voices, voices_inherited, note, page, raw_text FROM repertorio`,
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
