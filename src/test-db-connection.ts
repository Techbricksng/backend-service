import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to MongoDB using Prisma.");
  } catch (error) {
    console.error(" Error connecting to MongoDB:", error);
  } 
}

main();
