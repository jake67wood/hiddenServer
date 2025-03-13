const { Pool } = require('pg');
require('dotenv').config();

const connection = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://root:gMUN1iwijZKZxdKiCSPDeFaZ6hCptK54@dpg-cv9j4b5ds78s73bplvt0-a/secrets_wdgc",
  ssl: {
    rejectUnauthorized: false, // Necesario para Render
  },
});

module.exports = connection;
