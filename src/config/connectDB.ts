import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'], // optional, useful for debugging
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to the database');
  } catch (error) {
    console.error('❌ DB connection error:', error);
    process.exit(1); // optional: exit app if DB connection fails
  }
};

export default prisma;
