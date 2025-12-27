export type Period = 'renaissance' | 'non-renaissance';
export type WorkType = 'religious' | 'secular' | 'christmas';

export type RepertoireWork = {
  id: string;
  title: string;
  composer?: string;
  voices?: string;
  period: Period;
  type: WorkType;
  items?: string[]; // if collection
};

type CsvRow = {
  period: string;
  group_name: string;
  number: string;
  parent_number: string;
  is_collection: string;
  title: string;
  composer?: string;
  composer_inherited?: string;
  arranger?: string;
  voices?: string;
  voices_inherited?: string;
  note?: string;
  raw_text?: string;
};

const typeFromGroup = (group: string): WorkType => {
  const g = group.toLowerCase();
  if (g.includes('nav')) return 'christmas';
  if (g.includes('prof')) return 'secular';
  return 'religious';
};

const periodFromText = (period: string): Period => {
  const v = period.toLowerCase();
  if (v.includes('no renac') || v.includes('no-renac')) return 'non-renaissance';
  if (v.includes('renac')) return 'renaissance';
  return 'non-renaissance';
};

const composeItemText = (row: CsvRow): string => {
  // En la tabla solo queremos el nombre de la obra; autor y voces ya van en columnas aparte.
  if (row.title && row.title.trim().length > 0) return row.title.trim();
  if (row.raw_text && row.raw_text.trim().length > 0) return row.raw_text.trim();
  return 'Obra sin título';
};

export async function loadRepertoire(): Promise<RepertoireWork[]> {
  let rows: CsvRow[] = [];
  try {
    const res = await fetch('/data/repertorio.csv', { cache: 'no-store' });
    if (res.ok) {
      const text = await res.text();
      const parsed = parseCsv(text);
      if (parsed.length) rows = parsed;
    }
  } catch (err) {
    console.warn('No se pudo leer /data/repertorio.csv; se usará el fallback estático.', err);
  }

  if (rows.length) {
    return normalizeRows(rows);
  }

  // fallback: derive from legacy static dataset
  const { repertoireData } = await import('@/data/repertoire');
  return deriveFromLegacy(repertoireData);
}

// --- helpers -------------------------------------------------------

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const idx = (k: string) => headers.findIndex((h) => h === k);

  const indices = {
    period: idx('period'),
    group_name: idx('group_name'),
    number: idx('number'),
    parent_number: idx('parent_number'),
    is_collection: idx('is_collection'),
    title: idx('title'),
    composer: idx('composer'),
    composer_inherited: idx('composer_inherited'),
    arranger: idx('arranger'),
    voices: idx('voices'),
    voices_inherited: idx('voices_inherited'),
    note: idx('note'),
    raw_text: idx('raw_text'),
  };

  const get = (cols: string[], key: keyof typeof indices) => {
    const i = indices[key];
    return i >= 0 ? cols[i] || '' : '';
  };

  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    return {
      period: get(cols, 'period'),
      group_name: get(cols, 'group_name'),
      number: get(cols, 'number'),
      parent_number: get(cols, 'parent_number'),
      is_collection: get(cols, 'is_collection'),
      title: get(cols, 'title'),
      composer: get(cols, 'composer'),
      composer_inherited: get(cols, 'composer_inherited'),
      arranger: get(cols, 'arranger'),
      voices: get(cols, 'voices'),
      voices_inherited: get(cols, 'voices_inherited'),
      note: get(cols, 'note'),
      raw_text: get(cols, 'raw_text'),
    };
  });
}

function splitCsvLine(line: string): string[] {
  // simple CSV splitter supporting quoted fields
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function normalizeRows(rows: CsvRow[]): RepertoireWork[] {
  const parents = new Map<string, RepertoireWork>();
  const works: RepertoireWork[] = [];

  rows.forEach((row, idx) => {
    const period = periodFromText(row.period);
    const type = typeFromGroup(row.group_name);
    const id = row.number || `row-${idx}`;
    const composer = row.composer?.trim() || row.composer_inherited?.trim() || undefined;
    const voices = row.voices?.trim() || row.voices_inherited?.trim() || undefined;

    if (row.is_collection === '1') {
      const work: RepertoireWork = {
        id,
        title: row.title || row.raw_text || 'Colección',
        composer,
        voices,
        period,
        type,
        items: [],
      };
      parents.set(row.number, work);
      works.push(work);
    } else if (row.parent_number && parents.has(row.parent_number)) {
      const parent = parents.get(row.parent_number)!;
      parent.items?.push(composeItemText(row));
    } else {
      works.push({
        id,
        title: composeItemText(row),
        composer,
        voices,
        period,
        type,
      });
    }
  });

  return works;
}

type LegacyWork = {
  renaissance: string[];
  nonRenaissance: string[];
};
type LegacyData = Record<'religious' | 'secular' | 'christmas', LegacyWork>;

function deriveFromLegacy(legacy: LegacyData): RepertoireWork[] {
  const result: RepertoireWork[] = [];
  (['religious', 'secular', 'christmas'] as WorkType[]).forEach((type) => {
    const perList: Array<[Period, string[]]> = [
      ['renaissance', legacy[type].renaissance],
      ['non-renaissance', legacy[type].nonRenaissance],
    ];
    perList.forEach(([period, list]) => {
      list.forEach((title, idx) => {
        result.push({
          id: `${type}-${period}-${idx}`,
          title,
          period,
          type,
        });
      });
    });
  });
  return result;
}
