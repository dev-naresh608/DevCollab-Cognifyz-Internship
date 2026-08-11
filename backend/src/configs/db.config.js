import pg from "pg";
import { env } from "./env.config.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();

    client.release();

    console.log("✅ PostgreSQL Connected");
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL");
    console.error(error.message);

    process.exit(1);
  }
};

export { pool };
