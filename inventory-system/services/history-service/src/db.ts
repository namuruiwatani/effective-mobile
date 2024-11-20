import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function connectDB() {
  try {
    await pool.connect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}
