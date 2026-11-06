"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require(".././app"));
const prisma_js_1 = require("../src/lib/prisma.js");
const createTaskInDb = (overrides = {}) => prisma_js_1.prisma.task.create({
    data: {
        title: "Existing task",
        description: "Seeded for tests",
        ...overrides,
    },
});
describe("Tasks API", () => {
    beforeEach(async () => {
        await prisma_js_1.prisma.task.deleteMany();
    });
    after(async () => {
        await prisma_js_1.prisma.task.deleteMany();
        await prisma_js_1.prisma.$disconnect();
    });
    // 1. Successfully retrieving tasks
    describe("GET /api/tasks", () => {
        it("returns 200 and all tasks", async () => {
            await createTaskInDb({ title: "First" });
            await createTaskInDb({ title: "Second", status: "COMPLETED" });
            const res = await (0, supertest_1.default)(app_1.default).get("/api/tasks");
            (0, chai_1.expect)(res.status).to.equal(200);
            (0, chai_1.expect)(res.body).to.be.an("array").with.lengthOf(2);
            (0, chai_1.expect)(res.body[0]).to.have.all.keys("id", "title", "description", "status", "createdAt");
        });
        it("returns an empty array when there are no tasks", async () => {
            const res = await (0, supertest_1.default)(app_1.default).get("/api/tasks");
            (0, chai_1.expect)(res.status).to.equal(200);
            (0, chai_1.expect)(res.body).to.deep.equal([]);
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
            const res = await (0, supertest_1.default)(app_1.default).get("/api/tasks");
            (0, chai_1.expect)(res.body.map((t) => t.title)).to.deep.equal([
                "Newer",
                "Older",
            ]);
        });
    });
    // 2. Successfully creating a task
    describe("POST /api/tasks (valid data)", () => {
        it("returns 201 and the created task, defaulting status to PENDING", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post("/api/tasks")
                .send({ title: "Write tests", description: "Cover the API" });
            (0, chai_1.expect)(res.status).to.equal(201);
            (0, chai_1.expect)(res.body).to.include({
                title: "Write tests",
                description: "Cover the API",
                status: "PENDING",
            });
            (0, chai_1.expect)(res.body.id).to.be.a("number");
            (0, chai_1.expect)(res.body.createdAt).to.be.a("string");
        });
        it("persists the task in the database", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post("/api/tasks")
                .send({ title: "Persisted task" });
            const saved = await prisma_js_1.prisma.task.findUnique({
                where: { id: res.body.id },
            });
            (0, chai_1.expect)(saved).to.not.equal(null);
            (0, chai_1.expect)(saved?.title).to.equal("Persisted task");
        });
        it("accepts an explicit status and a missing description", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post("/api/tasks")
                .send({ title: "Already started", status: "IN_PROGRESS" });
            (0, chai_1.expect)(res.status).to.equal(201);
            (0, chai_1.expect)(res.body.status).to.equal("IN_PROGRESS");
            (0, chai_1.expect)(res.body.description).to.equal(null);
        });
        it("trims whitespace from the title", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post("/api/tasks")
                .send({ title: "   Padded title   " });
            (0, chai_1.expect)(res.status).to.equal(201);
            (0, chai_1.expect)(res.body.title).to.equal("Padded title");
        });
    });
    // 3. Rejecting invalid or missing required data
    describe("POST /api/tasks (invalid data)", () => {
        const invalidPayloads = [
            ["an empty body", {}],
            ["a missing title", { description: "No title here" }],
            ["an empty title", { title: "" }],
            ["a whitespace-only title", { title: "     " }],
            ["a non-string title", { title: 123 }],
            ["a title over 150 characters", { title: "a".repeat(151) }],
            ["an invalid status", { title: "Valid title", status: "DONE" }],
        ];
        invalidPayloads.forEach(([name, payload]) => {
            it(`returns 400 for ${name}`, async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post("/api/tasks")
                    .send(payload);
                (0, chai_1.expect)(res.status).to.equal(400);
                (0, chai_1.expect)(res.body.error).to.equal("Validation failed");
                (0, chai_1.expect)(res.body.details).to.be.an("array").that.is.not.empty;
            });
        });
        it("does not save anything when validation fails", async () => {
            await (0, supertest_1.default)(app_1.default).post("/api/tasks").send({ title: "" });
            (0, chai_1.expect)(await prisma_js_1.prisma.task.count()).to.equal(0);
        });
        it("returns 400 for a malformed JSON body", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post("/api/tasks")
                .set("Content-Type", "application/json")
                .send('{"title": "broken"');
            (0, chai_1.expect)(res.status).to.equal(400);
            (0, chai_1.expect)(res.body.error).to.equal("Invalid JSON body");
        });
    });
    // 4. Successfully updating a task's status
    describe("PATCH /api/tasks/:id/status (valid)", () => {
        it("returns 200 and the updated task", async () => {
            const task = await createTaskInDb();
            const res = await (0, supertest_1.default)(app_1.default)
                .patch(`/api/tasks/${task.id}/status`)
                .send({ status: "COMPLETED" });
            (0, chai_1.expect)(res.status).to.equal(200);
            (0, chai_1.expect)(res.body.id).to.equal(task.id);
            (0, chai_1.expect)(res.body.status).to.equal("COMPLETED");
        });
        it("persists the new status in the database", async () => {
            const task = await createTaskInDb();
            await (0, supertest_1.default)(app_1.default)
                .patch(`/api/tasks/${task.id}/status`)
                .send({ status: "IN_PROGRESS" });
            const saved = await prisma_js_1.prisma.task.findUnique({ where: { id: task.id } });
            (0, chai_1.expect)(saved?.status).to.equal("IN_PROGRESS");
        });
        ["PENDING", "IN_PROGRESS", "COMPLETED"].forEach((status) => {
            it(`accepts the status ${status}`, async () => {
                const task = await createTaskInDb();
                const res = await (0, supertest_1.default)(app_1.default)
                    .patch(`/api/tasks/${task.id}/status`)
                    .send({ status });
                (0, chai_1.expect)(res.status).to.equal(200);
                (0, chai_1.expect)(res.body.status).to.equal(status);
            });
        });
        it("only changes the status, leaving other fields untouched", async () => {
            const task = await createTaskInDb({
                title: "Keep me",
                description: "Unchanged",
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .patch(`/api/tasks/${task.id}/status`)
                .send({ status: "COMPLETED" });
            (0, chai_1.expect)(res.body.title).to.equal("Keep me");
            (0, chai_1.expect)(res.body.description).to.equal("Unchanged");
        });
    });
    describe("PATCH /api/tasks/:id/status (invalid)", () => {
        it("returns 400 for an invalid status value", async () => {
            const task = await createTaskInDb();
            const res = await (0, supertest_1.default)(app_1.default)
                .patch(`/api/tasks/${task.id}/status`)
                .send({ status: "NOPE" });
            (0, chai_1.expect)(res.status).to.equal(400);
            (0, chai_1.expect)(res.body.error).to.equal("Validation failed");
        });
        it("returns 400 when status is missing", async () => {
            const task = await createTaskInDb();
            const res = await (0, supertest_1.default)(app_1.default)
                .patch(`/api/tasks/${task.id}/status`)
                .send({});
            (0, chai_1.expect)(res.status).to.equal(400);
        });
        it("does not change the task when the status is invalid", async () => {
            const task = await createTaskInDb();
            await (0, supertest_1.default)(app_1.default)
                .patch(`/api/tasks/${task.id}/status`)
                .send({ status: "NOPE" });
            const saved = await prisma_js_1.prisma.task.findUnique({ where: { id: task.id } });
            (0, chai_1.expect)(saved?.status).to.equal("PENDING");
        });
        ["abc", "0", "-5", "1.5"].forEach((badId) => {
            it(`returns 400 for the invalid id "${badId}"`, async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .patch(`/api/tasks/${badId}/status`)
                    .send({ status: "COMPLETED" });
                (0, chai_1.expect)(res.status).to.equal(400);
            });
        });
        it("returns 400 for an id larger than the database allows", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/api/tasks/99999999999/status")
                .send({ status: "COMPLETED" });
            (0, chai_1.expect)(res.status).to.equal(400);
        });
    });
    // 5. Handling a request for a task that does not exist
    describe("Non-existent resources", () => {
        it("returns 404 when updating a task that does not exist", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/api/tasks/999999/status")
                .send({ status: "COMPLETED" });
            (0, chai_1.expect)(res.status).to.equal(404);
            (0, chai_1.expect)(res.body).to.deep.equal({ error: "Task not found" });
        });
        it("returns 404 for an unknown route", async () => {
            const res = await (0, supertest_1.default)(app_1.default).get("/api/does-not-exist");
            (0, chai_1.expect)(res.status).to.equal(404);
            (0, chai_1.expect)(res.body.error).to.include("Route not found");
        });
    });
});
