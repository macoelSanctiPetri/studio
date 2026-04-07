#!/usr/bin/env node
/**
 * Sincroniza public/data/actuaciones.json con la tabla MySQL `actuaciones`.
 * No borra filas: hace UPSERT por `id`.
 *
 * Requiere:
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */

const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
require('dotenv').config();

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Falta la variable de entorno ${key}`);
    process.exit(1);
  }
}

const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: dbPort,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  charset: 'utf8mb4_spanish_ci',
});

function toMysqlDatetime(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

async function loadActuaciones() {
  const file = path.join(process.cwd(), 'public', 'data', 'actuaciones.json');
  const raw = (await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, '');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('actuaciones.json no contiene un array');
  }
  return parsed;
}

async function main() {
  const rows = await loadActuaciones();
  if (rows.length === 0) {
    console.log('No hay actuaciones para sincronizar.');
    await pool.end();
    return;
  }

  const sql = `
    INSERT INTO actuaciones (
      id, titulo, fecha, lugar, map_url, estado, cabecera_url, cartel_url,
      descripcion_corta, descripcion_detalle, tickets_url, hora_puertas
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      titulo = VALUES(titulo),
      fecha = VALUES(fecha),
      lugar = VALUES(lugar),
      map_url = VALUES(map_url),
      estado = VALUES(estado),
      cabecera_url = VALUES(cabecera_url),
      cartel_url = VALUES(cartel_url),
      descripcion_corta = VALUES(descripcion_corta),
      descripcion_detalle = VALUES(descripcion_detalle),
      tickets_url = VALUES(tickets_url),
      hora_puertas = VALUES(hora_puertas),
      actualizado_en = CURRENT_TIMESTAMP
  `;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const a of rows) {
      await conn.query(sql, [
        a.id ?? null,
        a.titulo ?? null,
        toMysqlDatetime(a.fecha),
        a.lugar ?? null,
        a.map_url ?? null,
        a.estado ?? null,
        a.cabecera_url ?? null,
        a.cartel_url ?? null,
        a.descripcion_corta ?? null,
        a.descripcion_detalle ?? null,
        a.tickets_url ?? null,
        a.hora_puertas ?? null,
      ]);
    }
    await conn.commit();
    console.log(`Sincronizadas ${rows.length} actuaciones.`);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Error sincronizando actuaciones -> DB', err);
  process.exit(1);
});

