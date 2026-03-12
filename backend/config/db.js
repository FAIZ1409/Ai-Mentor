import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  "ai_mentor",     // database name
  "postgres",      // username
  "2004",
  {
    host: "localhost",
    dialect: "postgres",
    port: 5433,
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL Connected successfully.");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
export default connectDB;
