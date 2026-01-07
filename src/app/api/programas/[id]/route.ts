import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { isDbEnabled } from '@/lib/runtime-env';
import { getDbPool } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!isDbEnabled()) return NextResponse.json({ error: 'DB no habilitada' }, { status: 500 });
  try {
    const pool = await getDbPool();
    const [programRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, tipo, nombre, descripcion, duracion_total_min, fecha_creacion, fecha_ultima_revision
       FROM programas WHERE id = ?`,
      [params.id],
    );
    const program = programRows[0];
    if (!program) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    const [pieceRows] = await pool.query<RowDataPacket[]>(
      `SELECT pp.parte, pp.orden_en_parte, pp.pieza_number, pp.notas,
              r.title AS pieza_titulo, r.composer AS pieza_compositor
       FROM programa_piezas pp
       LEFT JOIN repertorio r ON r.number = pp.pieza_number
       WHERE pp.programa_id = ?
       ORDER BY pp.parte, pp.orden_en_parte`,
      [params.id],
    );
    return NextResponse.json({ program, pieces: pieceRows });
  } catch (err) {
    console.error('Error cargando programa', err);
    const message = err instanceof Error ? err.message : 'Error cargando programa';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!isDbEnabled()) return NextResponse.json({ error: 'DB no habilitada' }, { status: 500 });
  try {
    const payload = await req.json();
    const pool = await getDbPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `UPDATE programas SET tipo=?, nombre=?, descripcion=?, duracion_total_min=?, fecha_ultima_revision=CURDATE() WHERE id=?`,
        [
          payload.tipo,
          payload.nombre,
          payload.descripcion ?? null,
          payload.duracion_total_min ?? null,
          params.id,
        ],
      );

      await conn.query(`DELETE FROM programa_piezas WHERE programa_id = ?`, [params.id]);

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
          [params.id, piece.number, part, nextOrder, piece.notes ?? null],
        );
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error actualizando programa', err);
    const message = err instanceof Error ? err.message : 'Error actualizando programa';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!isDbEnabled()) return NextResponse.json({ error: 'DB no habilitada' }, { status: 500 });
  try {
    const pool = await getDbPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(`DELETE FROM programa_piezas WHERE programa_id = ?`, [params.id]);
      await conn.query(`DELETE FROM programas WHERE id=?`, [params.id]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error borrando programa', err);
    const message = err instanceof Error ? err.message : 'Error borrando programa';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
