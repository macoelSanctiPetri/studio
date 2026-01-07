import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { isDbEnabled } from '@/lib/runtime-env';
import { getDbPool } from '@/lib/db';

const fallback = [
  { id: 1, nombre: 'Obra Religiosa' },
  { id: 2, nombre: 'Obra Profana' },
  { id: 3, nombre: 'Obra Navideña' },
];

export async function GET() {
  try {
    if (!isDbEnabled()) {
      return NextResponse.json({ rows: fallback });
    }
    const pool = await getDbPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, nombre FROM generos ORDER BY id`,
    );
    return NextResponse.json({ rows });
  } catch (err) {
    console.error('Error cargando generos', err);
    return NextResponse.json({ rows: fallback });
  }
}
