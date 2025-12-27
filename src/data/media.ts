export type MediaVideo = {
  id: string;
  title: { es: string; en: string };
  note?: { es: string; en: string };
};

export const mediaVideos: MediaVideo[] = [
  {
    id: 'bn-AzifndPQ',
    title: {
      es: 'Ave verum corpus — W. A. Mozart',
      en: 'Ave verum corpus — W. A. Mozart',
    },
    note: {
      es: 'Concierto en St. Peterskirche (Viena).',
      en: 'Concert at St. Peterskirche (Vienna).',
    },
  },
  {
    id: 'wpoYWmjf_lg',
    title: {
      es: 'Versa est in Luctum — F. de Peñalosa',
      en: 'Versa est in Luctum — F. de Peñalosa',
    },
    note: {
      es: 'Concierto Santa Cueva de Cádiz.',
      en: 'Santa Cueva de Cádiz concert.',
    },
  },
  {
    id: 'J175qXpqlSg',
    title: {
      es: 'Rey a quien Reyes adoran — Anónimo (Cancionero de Upsala)',
      en: 'Rey a quien Reyes adoran — Anonymous (Cancionero de Upsala)',
    },
    note: {
      es: 'Concierto Iglesia San José Artesano · San Fernando (Cádiz).',
      en: 'Concert at Iglesia San José Artesano · San Fernando (Cádiz).',
    },
  },
  {
    id: 'Z-LLvd9OX5Y',
    title: {
      es: 'Brindis — W. A. Mozart',
      en: 'Brindis — W. A. Mozart',
    },
    note: {
      es: 'Celebración Día de Europa 2024 · Patio de las Naciones · Antiguo Hospital Real (Universidad de Cádiz).',
      en: 'Europe Day 2024 celebration · Patio de las Naciones · Former Hospital Real (University of Cádiz).',
    }
  },
];
