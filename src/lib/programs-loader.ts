import { isDbEnabled } from './runtime-env';

export type ProgramType = 'navideno' | 'religioso' | 'profano';

export type ProgramPiece = {
  number: string; // repertorio.number
  title: string;
  composer?: string;
  part: number;
  order: number;
  notes?: string | null;
};

export type Program = {
  id: number;
  name: string;
  description?: string | null;
  displayNum?: number | null;
  type: ProgramType;
  durationMinutes?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  pieces: ProgramPiece[];
};

const normalizeType = (raw: string): ProgramType => {
  const t = raw.toLowerCase();
  if (t.includes('nav')) return 'navideno';
  if (t.includes('prof')) return 'profano';
  return 'religioso';
};

export async function loadPrograms(): Promise<Program[]> {
  try {
    const res = await fetch('/api/programas', { cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const payload = await res.json();
    const rows = (payload?.programs ?? []) as Program[];
    return rows.map((p) => ({
      ...p,
      type: normalizeType((p as any).type ?? (p as any).tipo ?? ''),
      displayNum: (p as any).displayNum ?? (p as any).display_num ?? null,
      pieces: (p.pieces ?? []).map((piece) => ({
        ...piece,
        part: Number(piece.part),
        order: Number(piece.order),
      })),
    }));
  } catch (err) {
    console.warn('No se pudieron cargar programas desde la API; se devolverá lista vacía.', err);
    return [];
  }
}

// pequeño helper para SSR o tests
export function isProgramsEnabled() {
  return isDbEnabled();
}
