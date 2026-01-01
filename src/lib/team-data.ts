export type TeamMember = {
  name: string;
  lastName?: string;
  role: string;
  photoUrl?: string;
  photoAlt?: string;
};

const photoMap: Record<string, string> = {
  'eduardo gallardo de gomar': '/avatars/Componente_Director_Eduardo_Gallardo_de_Gomar.png',
  'adela canto carrillo': '/avatars/Componente_Soprano_Adela_Canto_Carrillo.png',
  'ana reyes vazquez': '/avatars/Componente_Soprano_Ana_Reyes_Vazquez.png',
  'laura raya leon': '/avatars/Componente_Soprano_Laura_Raya_Leon.png',
  'paqui soto lebron': '/avatars/Componente_Soprano_Paqui_Soto_Lebron.png',
  'rosa gonzalez diaz': '/avatars/Componente_Soprano_Rosa_Gonzalez_Diaz.png',
  'gemma garcia de lamo': '/avatars/Componente_Contralto_Gemma_Garcia_de_Lamo.png',
  'maria jesus crujeiras novas': '/avatars/Componente_Contralto_Maria_Jesus_Crujeiras_Novas.png',
  'susana martinez gomez': '/avatars/Componente_Contralto_Susana_Martinez_Gomez.png',
  'juan luis macias de la flor': '/avatars/Componente_Tenor_Juan_Luis_Macias_de_la_Flor.png',
  'ignacio moreno garrido': '/avatars/Componente_Tenor_Ignacio_Moreno_Garrido.png',
  'antonio martinez': '/avatars/Componente_Bajo_Antonio_Martinez.png',
  'antonio martinez sanchez': '/avatars/Componente_Bajo_Antonio_Martinez.png',
  'javier izquierdo anton': '/avatars/Componente_Bajo_Javier_Izquierdo_Anton.png',
  'manuel lopez coello': '/avatars/Componente_Bajo_Manuel_Lopez_Coello.png',
  'marcos a. garcia junio': '/avatars/Componente_Bajo_Marcos_A_Garcia_Junio.png',
  'eduardo gallardo de gomar (bajo)': '/avatars/Componente_Bajo_Eduardo_Gallardo_de_Gomar.png',
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

function normalizeName(name: string) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[¿?]/g, '?')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function resolvePhotoByName(fullName: string, role: string) {
  const base = normalizeName(fullName);
  const variants = new Set<string>([
    base,
    base.replace(/\?/g, ''), // quitar signos
    base.replace(/\?/g, 'a'),
    base.replace(/\?/g, 'e'),
    base.replace(/\?/g, 'i'),
    base.replace(/\?/g, 'o'),
    base.replace(/\?/g, 'u'),
  ]);

  for (const key of variants) {
    if (photoMap[key]) return photoMap[key];
    const keyedRole = `${key} (${role.toLowerCase()})`;
    if (photoMap[keyedRole]) return photoMap[keyedRole];
  }
  return undefined;
}

function sortTeam(team: TeamMember[]) {
  const idx = (role: string) => {
    const pos = roleOrder.findIndex((r) => role.toLowerCase().includes(r));
    return pos === -1 ? roleOrder.length : pos;
  };
  return [...team].sort((a, b) => {
    const pa = idx(a.role || '');
    const pb = idx(b.role || '');
    if (pa !== pb) return pa - pb;
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

      // Prioridad: usar la foto indicada si no es "fallback"
      if (photoNormalized && photoNormalized !== 'fallback') {
        if (photoNormalized === 'director') {
          photoUrl = '/avatars/Componente_Director_Eduardo_Gallardo_de_Gomar.png';
        } else if (photoNormalized === 'bajo_eduardo') {
          photoUrl = '/avatars/Componente_Bajo_Eduardo_Gallardo_de_Gomar.png';
        } else if (photoNormalized.startsWith('componente_')) {
          photoUrl = `/avatars/${photo}`;
        } else if (photoNormalized && photo.includes('.')) {
          photoUrl = photo;
        } else {
          photoUrl = `/avatars/${photo}`;
        }
      } else if (!photoNormalized) {
        // Sin valor de foto: intentamos resolver por nombre (tildes rotas, etc.)
        photoUrl = resolvePhotoByName(fullName, role);
      }

      if (!photoUrl) {
        photoUrl = '/avatars/fallback.png';
      }

      return {
        name: fullName || 'Sin nombre',
        lastName: last,
        role: role || 'Voz',
        photoUrl,
        photoAlt: fullName ? `Foto de ${fullName}` : undefined,
      };
    });

    if (process.env.NODE_ENV !== 'production') {
      console.debug('componentes API rows mapped', rows);
    }

    return sortTeam(team);
  } catch (err) {
    console.error('No se pudo leer componentes desde API', err);
    return [];
  }
}
