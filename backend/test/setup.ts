import "dotenv/config";

const testUrl = process.env.TEST_DATABASE_URL;

if (!testUrl) {
  throw new Error(
    "TEST_DATABASE_URL is not set. Tests must never run against your dev database.",
  );
}

if (testUrl === process.env.DATABASE_URL && process.env.CI !== "true") {
  throw new Error(
    "TEST_DATABASE_URL must differ from DATABASE_URL. The tests delete all tasks.",
  );
}

// Point Prisma at the test database BEFORE the client is imported anywhere
process.env.DATABASE_URL = testUrl;
