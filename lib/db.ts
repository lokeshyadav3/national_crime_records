import { Pool, QueryResult } from 'pg';

type PgParam =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | Uint8Array
  | Record<string, unknown>;

const connectionString =
  process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING || '';

let warnedNoPrimary = false;
let warnedPrimaryFallback = false;

function isConnectionUnavailableError(error: unknown): boolean {
  const code: unknown =
    typeof error === 'object' && error !== null && 'code' in error
      ? (error as { code?: unknown }).code
      : undefined;

  // Node/network errors commonly seen when DB is unreachable
  const networkCodes = new Set([
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'ECONNRESET',
    'EPIPE',
    'ENETUNREACH',
    'EHOSTUNREACH',
  ]);
  if (typeof code === 'string' && networkCodes.has(code)) {
    return true;
  }

  // Postgres SQLSTATE class 08xxx = connection exception
  if (typeof code === 'string' && /^08\d{3}$/.test(code)) {
    return true;
  }

  return false;
}

// Primary (online) pool via connection string if provided
const primaryPool = connectionString
  ? new Pool({
    connectionString,
    ssl:
      process.env.DB_SSL === 'true' || /sslmode=require/i.test(connectionString)
        ? { rejectUnauthorized: false }
        : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
  })
  : null;

// Local fallback pool
const fallbackPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'national_crime_records',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 10, // Max number of clients in the pool
  idleTimeoutMillis: 30000,
});

export function getPool(): Pool {
  if (!primaryPool && !warnedNoPrimary) {
    warnedNoPrimary = true;
    console.warn(
      'DATABASE_URL is not set; using local database connection settings.'
    );
  }

  return primaryPool ?? fallbackPool;
}

// Execute query with error handling
export async function executeQuery<T = unknown>(
  query: string,
  params: readonly unknown[] = []
): Promise<T> {
  // Convert standard '?' placeholders to Postgres '$1, $2' format if needed
  // But standardizing on using $1, $2 in query strings is better in Postgres.
  // For compatibility with previous MySQL code which used '?', we might need a converter
  // OR we assume I will fix queries.
  // Actually, 'mysql2' uses '?' and 'pg' uses '$1', '$2'.
  // To avoid breaking ALL existing queries, I can try to replace '?' with '$n'.

  let pgQuery = query;
  let paramIndex = 1;
  while (pgQuery.includes('?')) {
    pgQuery = pgQuery.replace('?', `$${paramIndex}`);
    paramIndex++;
  }

  // Handle specific MySQL-syntax replacements if any (e.g. LAST_INSERT_ID() -> RETURNING id)
  // This is a basic adapter. Ideally, we should update queries in route files.

  const runWithPool = async (pool: Pool): Promise<T> => {
    const client = await pool.connect();
    try {
      const result: QueryResult = await client.query(
        query.includes('?') ? pgQuery : query,
        params as PgParam[]
      );

      if (result.command === 'INSERT' && result.rows.length > 0) {
        return result.rows as unknown as T;
      }

      return result.rows as unknown as T;
    } finally {
      client.release();
    }
  };

  try {
    if (primaryPool) {
      try {
        return await runWithPool(primaryPool);
      } catch (error) {
        if (isConnectionUnavailableError(error)) {
          if (!warnedPrimaryFallback) {
            warnedPrimaryFallback = true;
            console.warn(
              'Primary database unavailable; falling back to local database.'
            );
          }
          return await runWithPool(fallbackPool);
        }

        // If the primary DB is reachable but misconfigured (e.g., auth failure),
        // surface the error instead of silently switching databases.
        throw error;
      }
    }

    return await runWithPool(fallbackPool);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get a single row
export async function queryOne<T = unknown>(
  query: string,
  params: readonly unknown[] = []
): Promise<T | null> {
  const rows = await executeQuery<unknown[]>(query, params);
  return rows && rows.length > 0 ? (rows[0] as T) : null;
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    if (primaryPool) {
      try {
        const client = await primaryPool.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('Database connected successfully (primary)');
        return true;
      } catch (error) {
        if (isConnectionUnavailableError(error)) {
          console.warn('Primary database unavailable, testing fallback.');
        } else {
          console.error('Primary database connection failed:', error);
          return false;
        }
      }
    }

    const client = await fallbackPool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Database connected successfully (fallback)');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Close pool (for cleanup)
export async function closePool(): Promise<void> {
  if (primaryPool) {
    await primaryPool.end();
  }
  await fallbackPool.end();
}
