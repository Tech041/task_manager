import { prisma } from "../src/lib/prisma.js";

const tasks = [
  { title: "Set up project repository", description: "Initialise Git and add .gitignore", status: "COMPLETED" },
  { title: "Design database schema", description: "Define the tasks table and status enum", status: "COMPLETED" },
  { title: "Create initial migration", description: "Generate and commit the SQL migration", status: "COMPLETED" },
  { title: "Build GET /api/tasks endpoint", description: "Return all tasks, newest first", status: "COMPLETED" },
  { title: "Build POST /api/tasks endpoint", description: "Validate input and create a task", status: "IN_PROGRESS" },
  { title: "Build PATCH status endpoint", description: "Update a task's status with 404 handling", status: "IN_PROGRESS" },
  { title: "Write Mocha tests", description: "Cover valid and invalid scenarios", status: "PENDING" },
  { title: "Add GitHub Actions CI", description: "Run backend tests on every push", status: "PENDING" },
  { title: "Build React task list", description: "Display tasks with loading and error states", status: "PENDING" },
  { title: "Write the README", description: "Document setup, env vars, database and tests", status: "PENDING" },
] as const;

async function main() {
  await prisma.task.deleteMany(); // clear old rows so re-running doesn't create duplicates
  await prisma.task.createMany({ data: tasks.map((t) => ({ ...t })) });
  console.log(`Seeded ${tasks.length} tasks`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });