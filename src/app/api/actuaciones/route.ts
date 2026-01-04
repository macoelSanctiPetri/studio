import { NextResponse } from 'next/server';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import type { RowDataPacket } from 'mysql2';
import { isDbEnabled } from '@/lib/runtime-env';
import { getDbPool } from '@/lib/db';

type ActuacionRow = {
  id: string;
  titulo: string;
  fecha: string;
  lugar: string;
  map_url: string | null;
  estado: string;
  cabecera_url: string | null;
  cartel_url: string | null;
  descripcion_corta: string | null;
  descripcion_detalle: string | null;
  tickets_url: string | null;
  hora_puertas: string | null;
};

async function loadFromJson(): Promise<ActuacionRow[]> {
  const file = path.join(process.cwd(), 'public', 'data', 'actuaciones.json');
  const content = await fs.readFile(file, 'utf8');
  const data = JSON.parse(content) as ActuacionRow[];
  return data;
}

async function loadFromDb(): Promise<ActuacionRow[]> {
  const pool = await getDbPool();
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT id, titulo, fecha, lugar, map_url, estado, cabecera_url, cartel_url,
           descripcion_corta, descripcion_detalle, tickets_url, hora_puertas
    FROM actuaciones
  `);
  return rows.map((r) => ({
    id: r.id,
    titulo: r.titulo,
    fecha: r.fecha,
    lugar: r.lugar,
    map_url: r.map_url ?? null,
    estado: r.estado,
    cabecera_url: r.cabecera_url ?? null,
    cartel_url: r.cartel_url ?? null,
    descripcion_corta: r.descripcion_corta ?? null,
    descripcion_detalle: r.descripcion_detalle ?? null,
    tickets_url: r.tickets_url ?? null,
    hora_puertas: r.hora_puertas ?? null,
  }));
}

export async function GET() {
  try {
    const rows = isDbEnabled() ? await loadFromDb() : await loadFromJson();
    return NextResponse.json({ rows });
  } catch (err) {
    console.error('Error cargando actuaciones', err);
    const message = err instanceof Error ? err.message : 'No se pudieron cargar las actuaciones';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
