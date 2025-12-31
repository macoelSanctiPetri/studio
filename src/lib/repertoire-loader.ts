import {
  CsvRow,
  RepertoireWork,
  normalizeRows,
  parseRepertoireCsv,
  deriveFromLegacy,
} from './repertoire-shared';

export async function loadRepertoire(): Promise<RepertoireWork[]> {
  let rows: CsvRow[] = [];
  try {
    const res = await fetch('/api/repertory', { cache: 'no-store' });
    if (res.ok) {
      const payload = await res.json();
      const parsed = payload?.rows as CsvRow[] | undefined;
      if (parsed?.length) rows = parsed;
    }
  } catch (err) {
    console.warn('No se pudo leer repertorio desde API; se usará el fallback estático.', err);
  }

  if (rows.length) {
    return normalizeRows(rows);
  }

  // fallback: derive from legacy static dataset
  const { repertoireData } = await import('@/data/repertoire');
  return deriveFromLegacy(repertoireData);
}

export { RepertoireWork } from './repertoire-shared';

// helper para escenarios de SSR/CLI si se quiere parsear texto CSV directamente
export function parseRepertoireCsvText(text: string): CsvRow[] {
  return parseRepertoireCsv(text);
}
