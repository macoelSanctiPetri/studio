import activosJson from '@/../public/data/activos.json';

export type Activo = {
  id: string;
  actuacion_id: string;
  tipo: 'foto' | 'video';
  ruta: string;
  estado: 'raw' | 'select' | 'final' | 'descartado';
  uso: 'Press' | 'Redes' | 'Archivo' | 'Interno';
  autor?: string | null;
};

const activos: Activo[] = activosJson as Activo[];

export const getActivosFinales = (actuacionId: string) =>
  activos.filter((a) => a.actuacion_id === actuacionId && a.estado === 'final');

export const getFotosFinales = (actuacionId: string) =>
  getActivosFinales(actuacionId).filter((a) => a.tipo === 'foto');

export const getVideosFinales = (actuacionId: string) =>
  getActivosFinales(actuacionId).filter((a) => a.tipo === 'video');
