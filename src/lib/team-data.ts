export type TeamMember = {
  name: string;
  lastName?: string;
  role: string;
  photoUrl?: string;
  photoAlt?: string;
};

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
    const res = await fetch('/api/componentes', { cache: 'no-store' });
    if (!res.ok) return [];
    const payload = await res.json();
    const rows: Array<{ nombre: string; apellidos: string; funcion: string; foto: string }> =
      payload?.rows || [];

    const team = rows.map((row) => {
      const first = row.nombre ?? '';
      const last = row.apellidos ?? '';
      const role = row.funcion ?? '';
      const photo = row.foto ?? '';
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
        photoUrl = photo;
      } else {
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
    console.error('No se pudo leer componentes desde API', err);
    return [];
  }
}
