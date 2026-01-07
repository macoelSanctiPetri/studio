import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { isDbEnabled } from '@/lib/runtime-env';
import { getDbPool } from '@/lib/db';

type DbRow = RowDataPacket & {
  programa_id: number;
  tipo: string;
  nombre: string;
  descripcion: string | null;
  duracion_total_min: number | null;
  fecha_creacion: string | Date | null;
  fecha_ultima_revision: string | Date | null;
  parte: number | null;
  orden_en_parte: number | null;
  pieza_number: string | null;
  notas: string | null;
  pieza_titulo: string | null;
  pieza_compositor: string | null;
};

export async function GET() {
  if (!isDbEnabled()) {
    return NextResponse.json({ programs: [] });
  }

  try {
    const pool = await getDbPool();
    const [rows] = await pool.query<DbRow[]>(
      `SELECT 
        p_sub.programa_id,
        p_sub.tipo,
        p_sub.nombre,
        p_sub.descripcion,
        p_sub.duracion_total_min,
        p_sub.fecha_creacion,
        p_sub.fecha_ultima_revision,
        p_sub.display_num,
        pp.parte,
        pp.orden_en_parte,
        pp.pieza_number,
        pp.notas,
        r.title AS pieza_titulo,
        r.composer AS pieza_compositor
      FROM (
        SELECT 
          p.id AS programa_id,
          p.tipo,
          p.nombre,
          p.descripcion,
          p.duracion_total_min,
          p.fecha_creacion,
          p.fecha_ultima_revision,
          ROW_NUMBER() OVER (PARTITION BY p.tipo ORDER BY p.id) AS display_num
        FROM programas p
      ) AS p_sub
      LEFT JOIN programa_piezas pp ON pp.programa_id = p_sub.programa_id
      LEFT JOIN repertorio r ON r.number = pp.pieza_number
      ORDER BY p_sub.programa_id, pp.parte, pp.orden_en_parte`
    );

    const map = new Map<number, any>();
    rows.forEach((r) => {
      if (!map.has(r.programa_id)) {
        map.set(r.programa_id, {
          id: r.programa_id,
          name: r.nombre,
          description: r.descripcion,
          displayNum: (r as any).display_num ?? null,
          type: r.tipo,
          durationMinutes: r.duracion_total_min,
          createdAt: r.fecha_creacion ? r.fecha_creacion.toString() : null,
          updatedAt: r.fecha_ultima_revision ? r.fecha_ultima_revision.toString() : null,
          pieces: [] as any[],
        });
      }
      if (r.pieza_number) {
        map.get(r.programa_id).pieces.push({
          number: r.pieza_number,
          title: r.pieza_titulo ?? '',
          composer: r.pieza_compositor ?? undefined,
          part: r.parte ?? 0,
          order: r.orden_en_parte ?? 0,
          notes: r.notas,
        });
      }
    });

    const programs = Array.from(map.values());
    return NextResponse.json({ programs });
  } catch (err) {
    console.error('Error cargando programas', err);
    const message = err instanceof Error ? err.message : 'No se pudo cargar programas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isDbEnabled()) {
    return NextResponse.json({ error: 'DB no habilitada' }, { status: 500 });
  }

  try {
    const payload = await req.json();
    const pool = await getDbPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query<any>(
        `INSERT INTO programas (tipo, nombre, descripcion, duracion_total_min, fecha_creacion, fecha_ultima_revision)
         VALUES (?, ?, ?, ?, CURDATE(), CURDATE())`,
        [
          payload.tipo,
          payload.nombre,
          payload.descripcion ?? null,
          payload.duracion_total_min ?? null,
        ],
      );
      const programId = result.insertId;
      const pieces: Array<{ number: string; part: number; notes?: string | null }> =
        Array.isArray(payload.pieces) ? payload.pieces : [];
      const orderByPart = new Map<number, number>();
      for (const piece of pieces) {
        if (!piece?.number) continue;
        const part = Number(piece.part) || 1;
        const nextOrder = (orderByPart.get(part) ?? 0) + 1;
        orderByPart.set(part, nextOrder);
        await conn.query(
          `INSERT INTO programa_piezas
            (programa_id, pieza_number, parte, orden_en_parte, notas)
           VALUES (?, ?, ?, ?, ?)`,
          [programId, piece.number, part, nextOrder, piece.notes ?? null],
        );
      }
      await conn.commit();
      return NextResponse.json({ ok: true, id: programId });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Error creando programa', err);
    const message = err instanceof Error ? err.message : 'No se pudo crear programa';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
