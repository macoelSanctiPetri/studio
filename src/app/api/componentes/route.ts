import { NextResponse } from 'next/server';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import type { RowDataPacket } from 'mysql2';
import { isDbEnabled } from '@/lib/runtime-env';
import { getDbPool } from '@/lib/db';

type ComponentRow = {
  nombre: string;
  apellidos: string;
  funcion: string;
  foto: string;
};

function parseCsvLine(line: string): string[] {
  const trimmed = line.trim().replace(/^"|"$/g, '');
  return trimmed.split('","');
}

async function loadFromCsv(): Promise<ComponentRow[]> {
  const file = path.join(process.cwd(), 'public', 'data', 'componentes.csv');
  const content = await fs.readFile(file, 'utf8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = (key: string) => headers.indexOf(key);
  const iNombre = idx('nombre');
  const iApellidos = idx('apellidos');
  const iFuncion = idx('funcion');
  const iFoto = idx('foto');

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    return {
      nombre: iNombre >= 0 ? cols[iNombre] ?? '' : '',
      apellidos: iApellidos >= 0 ? cols[iApellidos] ?? '' : '',
      funcion: iFuncion >= 0 ? cols[iFuncion] ?? '' : '',
      foto: iFoto >= 0 ? cols[iFoto] ?? '' : '',
    };
  });
}

async function loadFromDb(): Promise<ComponentRow[]> {
  const pool = await getDbPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT nombre, apellidos, funcion, foto FROM componentes`,
  );
  return rows.map((r) => ({
    nombre: r.nombre ?? '',
    apellidos: r.apellidos ?? '',
    funcion: r.funcion ?? '',
    foto: r.foto ?? '',
  }));
}

export async function GET() {
  try {
    const rows = isDbEnabled() ? await loadFromDb() : await loadFromCsv();
    return NextResponse.json({ rows });
  } catch (err) {
    console.error('Error cargando componentes', err);
    const message = err instanceof Error ? err.message : 'No se pudieron cargar los componentes';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
