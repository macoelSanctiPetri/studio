import actuacionesJson from '@/../public/data/actuaciones.json';

export type EstadoActuacion = 'Proxima' | 'Pasada';

export type Actuacion = {
  id: string;
  titulo: string;
  fecha: string; // ISO datetime string
  lugar: string;
  map_url?: string | null;
  estado: EstadoActuacion;
  cabecera_url?: string | null;
  cartel_url?: string | null;
  descripcion_corta?: string | null;
  descripcion_detalle?: string | null;
  tickets_url?: string | null;
  hora_puertas?: string | null;
};

export const actuaciones: Actuacion[] = (actuacionesJson as Actuacion[]).map((a) => ({
  ...a,
  cartel_url: a.cartel_url ?? a.cabecera_url ?? null,
}));

export const upcomingActuaciones = actuaciones
  .filter((a) => a.estado === 'Proxima')
  .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

export const pastActuaciones = actuaciones
  .filter((a) => a.estado === 'Pasada')
  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

export const formatFechaLarga = (fecha: string, locale = 'es-ES') =>
  new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(
    new Date(fecha),
  );

export const formatHora = (fecha: string, locale = 'es-ES') =>
  new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(fecha));
