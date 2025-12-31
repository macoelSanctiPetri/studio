import type { Pool } from 'mysql2/promise';
import { dbConfig } from './runtime-env';

let pool: Pool | null = null;

export async function getDbPool(): Promise<Pool> {
  if (pool) return pool;
  const mysql = await import('mysql2/promise');
  pool = mysql.createPool({
    ...dbConfig(),
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    charset: 'utf8mb4_spanish_ci',
  });
  return pool;
}
