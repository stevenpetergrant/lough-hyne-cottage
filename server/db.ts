import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "../shared/schema";

let pool: mysql.Pool | null = null;
let db: any = null;

try {
  if (process.env.DATABASE_URL) {
    pool = mysql.createPool(process.env.DATABASE_URL);
    db = drizzle(pool, { schema, mode: 'default' });
    console.log("Database connection established");
  } else {
    console.warn("DATABASE_URL not set - database features will be disabled");
  }
} catch (error) {
  console.error("Database connection failed:", error);
  console.warn("Continuing without database - some features may not work");
}

export { pool, db };