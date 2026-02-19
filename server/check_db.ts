
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

async function checkColumns() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("DATABASE_URL not found in environment");
        return;
    }

    console.log("Checking columns for user_forms...");

    const connection = await mysql.createConnection(dbUrl);

    try {
        const [rows] = await connection.execute("DESCRIBE user_forms");
        console.log("Columns in user_forms:");
        console.table(rows);
    } catch (error) {
        console.error("Error checking columns:", error);
    } finally {
        await connection.end();
    }
}

checkColumns();
