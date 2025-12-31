export const isDbEnabled = () =>
  process.env.USE_DB === '1' || process.env.NEXT_PUBLIC_USE_DB === '1';

export const dbConfig = () => {
  if (!isDbEnabled()) {
    throw new Error('Database not enabled by USE_DB env var.');
  }
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error('Faltan variables de entorno de base de datos (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME).');
  }
  return {
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  };
};
