export type TeamMember = {
  name: string;
  lastName?: string;
  role: string;
  photoUrl?: string;
  photoAlt?: string;
};

function parseCsvLine(line: string): string[] {
  // naive CSV for quoted, comma-separated values without embedded quotes
  const trimmed = line.trim().replace(/^"|"$/g, '');
  return trimmed.split('","');
}

const roleOrder = [
  'director',
  'soprano',
  'sopranos',
  'contralto',
  'contraltos',
  'alto',
  'altos',
  'tenor',
  'tenores',
  'bajo',
  'bajos',
];

function sortTeam(team: TeamMember[]) {
  const idx = (role: string) => {
    const pos = roleOrder.findIndex((r) => role.toLowerCase().includes(r));
    return pos === -1 ? roleOrder.length : pos;
  };
  return [...team].sort((a, b) => {
    const pa = idx(a.role || '');
    const pb = idx(b.role || '');
    if (pa !== pb) return pa - pb;
    // dentro de cada grupo, ordenar por apellidos (y luego nombre)
    const la = (a.lastName || '').trim();
    const lb = (b.lastName || '').trim();
    if (la && lb && la.toLowerCase() !== lb.toLowerCase()) {
      return la.localeCompare(lb, 'es', { sensitivity: 'base' });
    }
    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  });
}

export async function loadTeamData(): Promise<TeamMember[]> {
  try {
    const res = await fetch('/data/componentes.csv', { cache: 'no-store' });
    if (!res.ok) return [];
    const content = await res.text();
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const idx = (key: string) => headers.indexOf(key);
    const iNombre = idx('nombre');
    const iApellidos = idx('apellidos');
    const iFuncion = idx('funcion');
    const iFoto = idx('foto');

    const team = lines.slice(1).map((line) => {
      const cols = parseCsvLine(line);
      const first = iNombre >= 0 ? cols[iNombre] ?? '' : '';
      const last = iApellidos >= 0 ? cols[iApellidos] ?? '' : '';
      const role = iFuncion >= 0 ? cols[iFuncion] ?? '' : '';
      const photo = iFoto >= 0 ? cols[iFoto] ?? '' : '';
      const fullName = `${first} ${last}`.trim();
      const photoNormalized = photo.trim().toLowerCase();
      let photoUrl: string | undefined;

      if (photoNormalized === 'director') {
        photoUrl = '/avatars/director.JPG';
      } else if (photoNormalized === 'bajo_eduardo') {
        photoUrl = '/avatars/Bajo_Eduardo.JPG';
      } else if (photoNormalized === 'fallback' || photoNormalized === '') {
        photoUrl = '/avatars/fallback.png';
      } else if (photo.includes('.')) {
        // If CSV already provides a path or filename with extension, use it as-is (relative or absolute)
        photoUrl = photo;
      } else {
        // default: try within avatars, fallback final guard
        photoUrl = `/avatars/${photo}`;
      }

      return {
        name: fullName || 'Sin nombre',
        lastName: last,
        role: role || 'Voz',
        photoUrl,
        photoAlt: fullName ? `Foto de ${fullName}` : undefined,
      };
    });

    return sortTeam(team);
  } catch (err) {
    console.error('No se pudo leer /data/componentes.csv', err);
    return [];
  }
}
