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
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT number,
              parent_number,
              period_id,
              genero_id,
              title,
              composer,
              composer_inherited,
              voices,
              voices_inherited,
              is_collection
       FROM repertorio
       WHERE number = ?`,
      [params.id],
    );
    const parent = rows[0];
    if (!parent) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    let children: RowDataPacket[] = [];
    if (parent.is_collection) {
      const [childRows] = await pool.query<RowDataPacket[]>(
        `SELECT number, title, voices, voices_inherited
         FROM repertorio
         WHERE parent_number = ?
         ORDER BY CAST(SUBSTRING_INDEX(number,'.',-1) AS UNSIGNED)`,
        [params.id],
      );
      children = childRows;
    }

    return NextResponse.json({
      parent,
      children,
    });
  } catch (err) {
    console.error('Error cargando detalle de repertorio', err);
    const message = err instanceof Error ? err.message : 'Error cargando repertorio';
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
    const generoId = payload.genero_id
      ? Number(payload.genero_id)
      : payload.group_name
        ? String(payload.group_name).toLowerCase().includes('prof')
          ? 2
          : String(payload.group_name).toLowerCase().includes('nav')
            ? 3
            : 1
        : null;
    const periodId = payload.period_id
      ? Number(payload.period_id)
      : payload.period
        ? String(payload.period).toLowerCase().includes('no renac')
          ? 2
          : 1
        : null;

    await pool.query(
      `UPDATE repertorio
         SET title=?,
             composer=?,
             composer_inherited=?,
             voices=?,
             voices_inherited=?,
             period_id=COALESCE(?, period_id),
             genero_id=COALESCE(?, genero_id),
             note=?
       WHERE number=?`,
      [
        payload.title ?? null,
        payload.composer ?? null,
        payload.composer ?? null,
        payload.voices ?? null,
        payload.voices ?? null,
        periodId,
        generoId,
        payload.note ?? null,
        params.id,
      ],
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error actualizando repertorio', err);
    const message = err instanceof Error ? err.message : 'Error actualizando repertorio';
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
      await conn.query(`DELETE FROM repertorio_audio WHERE repertorio_number = ?`, [params.id]);
      await conn.query(`DELETE FROM repertorio_video WHERE repertorio_number = ?`, [params.id]);
      await conn.query(`DELETE FROM programa_piezas WHERE pieza_number = ?`, [params.id]);

      // delete children first
      const [childRows] = await conn.query<RowDataPacket[]>(
        `SELECT number FROM repertorio WHERE parent_number = ?`,
        [params.id],
      );
      for (const row of childRows) {
        const childNumber = row.number?.toString?.() ?? '';
        if (!childNumber) continue;
        await conn.query(`DELETE FROM repertorio_audio WHERE repertorio_number = ?`, [childNumber]);
        await conn.query(`DELETE FROM repertorio_video WHERE repertorio_number = ?`, [childNumber]);
        await conn.query(`DELETE FROM programa_piezas WHERE pieza_number = ?`, [childNumber]);
      }
      await conn.query(`DELETE FROM repertorio WHERE parent_number = ?`, [params.id]);
      await conn.query(`DELETE FROM repertorio WHERE number = ?`, [params.id]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error borrando repertorio', err);
    const message = err instanceof Error ? err.message : 'Error borrando repertorio';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
