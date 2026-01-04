import { useEffect, useState } from 'react';
import type { Actuacion, EstadoActuacion } from './actuaciones';

const PLACEHOLDER = '/actuaciones/PLACEHOLDER/cabecera/placeholder-md.png';

export function useActuaciones(): {
  data: Actuacion[] | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<Actuacion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/actuaciones', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        if (!mounted) return;
        const rows = (payload?.rows || []) as any[];
        const norm = rows.map((a) => ({
          ...a,
          cabecera_url: a.cabecera_url ?? PLACEHOLDER,
          cartel_url: a.cartel_url ?? a.cabecera_url ?? PLACEHOLDER,
        })) as Actuacion[];
        setData(norm);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Error cargando actuaciones');
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
