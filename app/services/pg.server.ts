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

export async function ensureTables() {
  const createTableQueries = [
    `
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      is_admin BOOLEAN DEFAULT FALSE
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS projects (
      project_id SERIAL PRIMARY KEY,
      project_name VARCHAR(255) NOT NULL
    );
    `,
    `
      CREATE TABLE IF NOT EXISTS project_participants (
      participant_id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
    );
    `,
    `
      CREATE TABLE IF NOT EXISTS instruments (
      instrument_id SERIAL PRIMARY KEY,
      instrument_name VARCHAR(255) NOT NULL,
      section VARCHAR(100) NOT NULL
    );
    `,
    `
      CREATE TABLE IF NOT EXISTS instrument_players (
      player_id SERIAL PRIMARY KEY,
      instrument_id INTEGER NOT NULL REFERENCES instruments(instrument_id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
    );
    `,
    `
      CREATE TABLE IF NOT EXISTS rehearsals (
      rehearsal_id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
      rehearsal_date TIMESTAMP WITH TIME ZONE NOT NULL,
      location VARCHAR(255) NOT NULL,
      notes TEXT
    );`,
  ];

  for (const queryText of createTableQueries) {
    await query(queryText);
  }
}

ensureTables();

export { pool };
