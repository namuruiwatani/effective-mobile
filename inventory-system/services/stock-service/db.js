const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: async () => {
    try {
      await pool.connect();
      console.log("Connected to the database");
    } catch (err) {
      console.error("Database connection error", err);
      process.exit(1);
    }
  },
};
