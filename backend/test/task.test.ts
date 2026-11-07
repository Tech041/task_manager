import { expect } from "chai";
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/lib/prisma.js";

const createTaskInDb = (overrides: Record<string, unknown> = {}) =>
  prisma.task.create({
    data: {
      title: "Existing task",
      description: "Seeded for tests",
      ...overrides,
    },
  });

describe("Tasks API", () => {
  beforeEach(async () => {
    await prisma.task.deleteMany();
  });

  after(async () => {
    await prisma.task.deleteMany();
    await prisma.$disconnect();
  });

  // 1. Successfully retrieving tasks
  describe("GET /api/tasks", () => {
    it("returns 200 and all tasks", async () => {
      await createTaskInDb({ title: "First" });
      await createTaskInDb({ title: "Second", status: "COMPLETED" });

      const res = await request(app).get("/api/tasks");

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array").with.lengthOf(2);
      expect(res.body[0]).to.have.all.keys(
        "id",
        "title",
        "description",
        "status",
        "createdAt",
      );
    });

    it("returns an empty array when there are no tasks", async () => {
      const res = await request(app).get("/api/tasks");

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal([]);
    });

    it("returns the newest tasks first", async () => {
      await createTaskInDb({
        title: "Older",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      });
      await createTaskInDb({
        title: "Newer",
        createdAt: new Date("2026-06-01T00:00:00Z"),
      });

      const res = await request(app).get("/api/tasks");

      expect(res.body.map((t: { title: string }) => t.title)).to.deep.equal([
        "Newer",
        "Older",
      ]);
    });
  });

  // 2. Successfully creating a task
  describe("POST /api/tasks (valid data)", () => {
    it("returns 201 and the created task", async () => {
      const res = await request(app).post("/api/tasks").send({
        title: "Write tests",
        description: "Cover the API",
        status: "PENDING",
      });

      expect(res.status).to.equal(201);
      expect(res.body).to.include({
        title: "Write tests",
        description: "Cover the API",
        status: "PENDING",
      });
      expect(res.body.id).to.be.a("number");
      expect(res.body.createdAt).to.be.a("string");
    });

    it("persists the task in the database", async () => {
      const res = await request(app).post("/api/tasks").send({
        title: "Persisted task",
        description: "Saved to the database",
        status: "PENDING",
      });

      expect(res.status).to.equal(201);
      const saved = await prisma.task.findUnique({
        where: { id: res.body.id },
      });
      expect(saved).to.not.equal(null);
      expect(saved?.title).to.equal("Persisted task");
    });

    ["PENDING", "IN_PROGRESS", "COMPLETED"].forEach((status) => {
      it(`creates a task with the status ${status}`, async () => {
        const res = await request(app)
          .post("/api/tasks")
          .send({ title: "Status task", description: "Check status", status });

        expect(res.status).to.equal(201);
        expect(res.body.status).to.equal(status);
      });
    });

    it("trims whitespace from the title and description", async () => {
      const res = await request(app).post("/api/tasks").send({
        title: "   Padded title   ",
        description: "   Padded description   ",
        status: "PENDING",
      });

      expect(res.status).to.equal(201);
      expect(res.body.title).to.equal("Padded title");
      expect(res.body.description).to.equal("Padded description");
    });
  });

  // 3. Rejecting invalid or missing required data
  describe("POST /api/tasks (invalid data)", () => {
    const validDescription = "A valid description";
    const validStatus = "PENDING";

    const invalidPayloads: [string, unknown][] = [
      ["an empty body", {}],
      [
        "a missing title",
        { description: validDescription, status: validStatus },
      ],
      [
        "an empty title",
        { title: "", description: validDescription, status: validStatus },
      ],
      [
        "a whitespace-only title",
        { title: "     ", description: validDescription, status: validStatus },
      ],
      [
        "a non-string title",
        { title: 123, description: validDescription, status: validStatus },
      ],
      [
        "a title over 150 characters",
        {
          title: "a".repeat(151),
          description: validDescription,
          status: validStatus,
        },
      ],
      ["a missing description", { title: "Valid title", status: validStatus }],
      [
        "an empty description",
        { title: "Valid title", description: "", status: validStatus },
      ],
      [
        "a whitespace-only description",
        { title: "Valid title", description: "     ", status: validStatus },
      ],
      [
        "a non-string description",
        { title: "Valid title", description: 456, status: validStatus },
      ],
      [
        "a description over 1000 characters",
        {
          title: "Valid title",
          description: "a".repeat(1001),
          status: validStatus,
        },
      ],
      [
        "a missing status",
        { title: "Valid title", description: validDescription },
      ],
      [
        "an invalid status",
        { title: "Valid title", description: validDescription, status: "DONE" },
      ],
      [
        "a non-string status",
        { title: "Valid title", description: validDescription, status: 1 },
      ],
    ];

    invalidPayloads.forEach(([name, payload]) => {
      it(`returns 400 for ${name}`, async () => {
        const res = await request(app)
          .post("/api/tasks")
          .send(payload as object);

        expect(res.status).to.equal(400);
        expect(res.body.error).to.equal("Validation failed");
        expect(res.body.details).to.be.an("array").that.is.not.empty;
      });
    });

    it("does not save anything when validation fails", async () => {
      await request(app)
        .post("/api/tasks")
        .send({ title: "No description", status: "PENDING" });

      expect(await prisma.task.count()).to.equal(0);
    });

    it("returns 400 for a malformed JSON body", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Content-Type", "application/json")
        .send('{"title": "broken"');

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal("Invalid JSON body");
    });
  });

  // 4. Successfully updating a task's status
  describe("PATCH /api/tasks/:id/status (valid)", () => {
    it("returns 200 and the updated task", async () => {
      const task = await createTaskInDb();

      const res = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .send({ status: "COMPLETED" });

      expect(res.status).to.equal(200);
      expect(res.body.id).to.equal(task.id);
      expect(res.body.status).to.equal("COMPLETED");
    });

    it("persists the new status in the database", async () => {
      const task = await createTaskInDb();

      await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .send({ status: "IN_PROGRESS" });

      const saved = await prisma.task.findUnique({ where: { id: task.id } });
      expect(saved?.status).to.equal("IN_PROGRESS");
    });

    ["PENDING", "IN_PROGRESS", "COMPLETED"].forEach((status) => {
      it(`accepts the status ${status}`, async () => {
        const task = await createTaskInDb();

        const res = await request(app)
          .patch(`/api/tasks/${task.id}/status`)
          .send({ status });

        expect(res.status).to.equal(200);
        expect(res.body.status).to.equal(status);
      });
    });

    it("only changes the status, leaving other fields untouched", async () => {
      const task = await createTaskInDb({
        title: "Keep me",
        description: "Unchanged",
      });

      const res = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .send({ status: "COMPLETED" });

      expect(res.body.title).to.equal("Keep me");
      expect(res.body.description).to.equal("Unchanged");
    });
  });

  describe("PATCH /api/tasks/:id/status (invalid)", () => {
    it("returns 400 for an invalid status value", async () => {
      const task = await createTaskInDb();

      const res = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .send({ status: "NOPE" });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal("Validation failed");
    });

    it("returns 400 when status is missing", async () => {
      const task = await createTaskInDb();

      const res = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .send({});

      expect(res.status).to.equal(400);
    });

    it("does not change the task when the status is invalid", async () => {
      const task = await createTaskInDb();

      await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .send({ status: "NOPE" });

      const saved = await prisma.task.findUnique({ where: { id: task.id } });
      expect(saved?.status).to.equal("PENDING");
    });

    ["abc", "0", "-5", "1.5"].forEach((badId) => {
      it(`returns 400 for the invalid id "${badId}"`, async () => {
        const res = await request(app)
          .patch(`/api/tasks/${badId}/status`)
          .send({ status: "COMPLETED" });

        expect(res.status).to.equal(400);
      });
    });

    it("returns 400 for an id larger than the database allows", async () => {
      const res = await request(app)
        .patch("/api/tasks/99999999999/status")
        .send({ status: "COMPLETED" });

      expect(res.status).to.equal(400);
    });
  });

  // 5. Handling a request for a task that does not exist
  describe("Non-existent resources", () => {
    it("returns 404 when updating a task that does not exist", async () => {
      const res = await request(app)
        .patch("/api/tasks/999999/status")
        .send({ status: "COMPLETED" });

      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({ error: "Task not found" });
    });

    it("returns 404 for an unknown route", async () => {
      const res = await request(app).get("/api/does-not-exist");

      expect(res.status).to.equal(404);
      expect(res.body.error).to.include("Route not found");
    });
  });
});
