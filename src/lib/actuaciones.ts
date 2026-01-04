export type EstadoActuacion = 'Proxima' | 'Pasada';

export type Actuacion = {
  id: string;
  titulo: string;
  fecha: string; // ISO datetime string (para ordenación)
  fecha_visible?: string | null; // texto opcional para mostrar (p.ej. "Junio 2026 (día por confirmar)")
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

export const formatFechaLarga = (fecha: string, fechaVisible?: string | null, locale = 'es-ES') => {
  if (fechaVisible) return fechaVisible;
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(
    new Date(fecha),
  );
};

export const formatHora = (fecha: string, locale = 'es-ES') =>
  new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(fecha));
