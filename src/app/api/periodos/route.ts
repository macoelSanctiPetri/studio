import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { isDbEnabled } from '@/lib/runtime-env';
import { getDbPool } from '@/lib/db';

const fallback = [
  { id: 1, descripcion: 'Polifonía del Renacimiento' },
  { id: 2, descripcion: 'Polifonía no Renacentista' },
];

export async function GET() {
  try {
    if (!isDbEnabled()) {
      return NextResponse.json({ rows: fallback });
    }
    const pool = await getDbPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, descripcion FROM periodos ORDER BY id`,
    );
    return NextResponse.json({ rows });
  } catch (err) {
    console.error('Error cargando periodos', err);
    return NextResponse.json({ rows: fallback });
  }
}
