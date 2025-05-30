import { Pool, QueryResult, QueryResultRow } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  max: parseInt(process.env.DB_MAX_CONNECTIONS || "10", 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10),
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const client = await pool.connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

export { pool };
