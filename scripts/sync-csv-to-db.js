#!/usr/bin/env node
/**
 * Sincroniza los CSV locales con la base de datos MySQL (Plesk).
 * Usa las variables de entorno:
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 *
 * Ejemplo (Plesk/cron):
 *   DB_HOST=... DB_USER=... DB_PASSWORD=... DB_NAME=admin_novamvsica node scripts/sync-csv-to-db.js
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

const repertorioColumns = [
  'update_date',
  'period',
  'group_num',
  'group_name',
  'number',
  'parent_number',
  'is_collection',
  'title',
  'composer',
  'composer_inherited',
  'arranger',
  'voices',
  'voices_inherited',
  'note',
  'page',
  'raw_text',
];

const componentesColumns = ['nombre', 'apellidos', 'funcion', 'foto'];

const splitCsvLine = (line) => {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
};

async function loadCsv(file) {
  const content = await fs.readFile(file, 'utf8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const idx = (k) => headers.findIndex((h) => h === k);
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i] ?? '';
    });
    return obj;
  });
}

async function importTable(table, columns, rows) {
  if (!rows.length) {
    console.log(`Nada que importar en ${table}.`);
    return;
  }
  const conn = await pool.getConnection();
  try {
    try {
      await conn.query(`TRUNCATE TABLE \`${table}\``);
    } catch (err) {
      if (err && err.code === 'ER_TRUNCATE_ILLEGAL_FK') {
        await conn.query(`DELETE FROM \`${table}\``);
      } else {
        throw err;
      }
    }
    const sql = `INSERT INTO \`${table}\` (${columns.map((c) => `\`${c}\``).join(',')}) VALUES ?`;
    const values = rows.map((row) => columns.map((c) => row[c] ?? null));
    await conn.query(sql, [values]);
    console.log(`Importadas ${rows.length} filas en ${table}.`);
  } finally {
    conn.release();
  }
}

async function main() {
  const base = path.join(process.cwd(), 'public', 'data');
  const repertorio = await loadCsv(path.join(base, 'repertorio.csv'));
  const componentes = await loadCsv(path.join(base, 'componentes.csv'));
  await importTable('repertorio', repertorioColumns, repertorio);
  await importTable('componentes', componentesColumns, componentes);
  await pool.end();
}

main().catch((err) => {
  console.error('Error sincronizando CSV -> DB', err);
  process.exit(1);
});
