import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { isDbEnabled } from '@/lib/runtime-env';
import { getDbPool } from '@/lib/db';

type CollectionItem = {
  number: string;
  title: string;
  voices?: string | null;
};

export async function POST(req: Request) {
  if (!isDbEnabled()) return NextResponse.json({ error: 'DB desactivada' }, { status: 400 });
  try {
    const body = await req.json().catch(() => ({}));
    const number = body.number ? String(body.number) : '';
    if (!number) {
      return NextResponse.json({ error: 'number requerido' }, { status: 400 });
    }

    const periodId = body.period_id ? Number(body.period_id) : null;
    const generoId = body.genero_id ? Number(body.genero_id) : null;
    const title = body.title ? String(body.title) : '';
    if (!title) {
      return NextResponse.json({ error: 'title requerido' }, { status: 400 });
    }

    const composer = body.composer ?? null;
    const items = Array.isArray(body.items) ? (body.items as CollectionItem[]) : [];

    const pool = await getDbPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `INSERT INTO repertorio
          (number, parent_number, period_id, genero_id, title, composer, composer_inherited, arranger, voices, voices_inherited, note, is_collection, page, update_date, raw_text)
         VALUES
          (?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, 1, NULL, CURDATE(), NULL)`,
        [number, null, periodId, generoId, title, composer, composer],
      );

      for (const item of items) {
        const itemNumber = item.number ? String(item.number) : '';
        const itemTitle = item.title ? String(item.title) : '';
        if (!itemNumber || !itemTitle) continue;
        await conn.query(
          `INSERT INTO repertorio
            (number, parent_number, period_id, genero_id, title, composer, composer_inherited, arranger, voices, voices_inherited, note, is_collection, page, update_date, raw_text)
           VALUES
            (?, ?, ?, ?, ?, NULL, ?, NULL, ?, ?, NULL, 0, NULL, CURDATE(), NULL)`,
          [
            itemNumber,
            number,
            periodId,
            generoId,
            itemTitle,
            composer,
            item.voices ?? null,
            item.voices ?? null,
          ],
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
    console.error('Error insertando colección', err);
    const message = err instanceof Error ? err.message : 'No se pudo insertar colección';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!isDbEnabled()) return NextResponse.json({ error: 'DB desactivada' }, { status: 400 });
  try {
    const body = await req.json().catch(() => ({}));
    const number = body.number ? String(body.number) : '';
    if (!number) {
      return NextResponse.json({ error: 'number requerido' }, { status: 400 });
    }
    const periodId = body.period_id ? Number(body.period_id) : null;
    const generoId = body.genero_id ? Number(body.genero_id) : null;
    const title = body.title ? String(body.title) : '';
    if (!title) {
      return NextResponse.json({ error: 'title requerido' }, { status: 400 });
    }
    const composer = body.composer ?? null;
    const items = Array.isArray(body.items)
      ? (body.items as Array<{ id?: string; title: string; voices?: string | null }>)
      : [];

    const pool = await getDbPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `UPDATE repertorio
           SET period_id = ?,
               genero_id = ?,
               title = ?,
               composer = ?,
               composer_inherited = ?
         WHERE number = ?`,
        [periodId, generoId, title, composer, composer, number],
      );

      const [existingRows] = await conn.query<Array<{ number: string } & RowDataPacket>>(
        `SELECT number FROM repertorio WHERE parent_number = ?`,
        [number],
      );
      const existing = existingRows.map((r) => String(r.number));

      // temp renaming to avoid PK collisions when re-numbering
      const tempMap = new Map<string, string>();
      let tmpIdx = 1;
      for (const oldNumber of existing) {
        const tmp = `${number}.__tmp${tmpIdx++}`;
        tempMap.set(oldNumber, tmp);
        await conn.query(`UPDATE repertorio SET number = ? WHERE number = ?`, [tmp, oldNumber]);
        await conn.query(`UPDATE programa_piezas SET pieza_number = ? WHERE pieza_number = ?`, [tmp, oldNumber]);
        await conn.query(`UPDATE repertorio_audio SET repertorio_number = ? WHERE repertorio_number = ?`, [tmp, oldNumber]);
        await conn.query(`UPDATE repertorio_video SET repertorio_number = ? WHERE repertorio_number = ?`, [tmp, oldNumber]);
      }

      const usedTemps = new Set<string>();

      // Update/insert items in desired order
      for (let idx = 0; idx < items.length; idx += 1) {
        const item = items[idx];
        const finalNumber = `${number}.${idx + 1}`;
        const titleItem = item.title ? String(item.title) : '';
        if (!titleItem) continue;
        const voices = item.voices ?? null;
        const temp = item.id && tempMap.has(item.id) ? tempMap.get(item.id)! : null;

        if (temp) {
          usedTemps.add(temp);
          await conn.query(
            `UPDATE repertorio
               SET number = ?,
                   parent_number = ?,
                   period_id = ?,
                   genero_id = ?,
                   title = ?,
                   composer_inherited = ?,
                   voices = ?,
                   voices_inherited = ?,
                   is_collection = 0
             WHERE number = ?`,
            [finalNumber, number, periodId, generoId, titleItem, composer, voices, voices, temp],
          );
          await conn.query(`UPDATE programa_piezas SET pieza_number = ? WHERE pieza_number = ?`, [finalNumber, temp]);
          await conn.query(`UPDATE repertorio_audio SET repertorio_number = ? WHERE repertorio_number = ?`, [finalNumber, temp]);
          await conn.query(`UPDATE repertorio_video SET repertorio_number = ? WHERE repertorio_number = ?`, [finalNumber, temp]);
        } else {
          await conn.query(
            `INSERT INTO repertorio
              (number, parent_number, period_id, genero_id, title, composer, composer_inherited, arranger, voices, voices_inherited, note, is_collection, page, update_date, raw_text)
             VALUES
              (?, ?, ?, ?, ?, NULL, ?, NULL, ?, ?, NULL, 0, NULL, CURDATE(), NULL)`,
            [finalNumber, number, periodId, generoId, titleItem, composer, voices, voices],
          );
        }
      }

      // Delete temp rows not used (removed items)
      for (const temp of tempMap.values()) {
        if (usedTemps.has(temp)) continue;
        await conn.query(`DELETE FROM repertorio WHERE number = ?`, [temp]);
        await conn.query(`DELETE FROM programa_piezas WHERE pieza_number = ?`, [temp]);
        await conn.query(`DELETE FROM repertorio_audio WHERE repertorio_number = ?`, [temp]);
        await conn.query(`DELETE FROM repertorio_video WHERE repertorio_number = ?`, [temp]);
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
    console.error('Error actualizando colección', err);
    const message = err instanceof Error ? err.message : 'No se pudo actualizar colección';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
