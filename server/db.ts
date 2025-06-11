import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let db: any = null;

try {
  if (process.env.DATABASE_URL) {
    console.log("Initializing PostgreSQL connection...");
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log("Database connection established");
  } else {
    console.warn("DATABASE_URL not set - database features will be disabled");
  }
} catch (error) {
  console.error("Database connection failed:", error);
  console.warn("Continuing without database - some features may not work");
}

export { pool, db };