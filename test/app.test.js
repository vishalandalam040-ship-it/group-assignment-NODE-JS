const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const { createApp } = require("../src/app");

let testDatabases = [];

beforeEach(() => {
  testDatabases = [];
});

afterEach(() => {
  for (const { db, dbPath } of testDatabases) {
    try {
      if (db && db.open) {
        db.close();
      }
    } finally {
      for (const filePath of [dbPath, `${dbPath}-wal`, `${dbPath}-shm`, `${dbPath}-journal`]) {
        fs.rmSync(filePath, { force: true });
        assert.equal(fs.existsSync(filePath), false, `Test database file was not removed: ${filePath}`);
      }
    }
  }
});

function buildApp() {
  const dbPath = path.join(os.tmpdir(), `printpoint-test-${process.pid}-${randomUUID()}.db`);
  const testDatabase = { db: null, dbPath };
  testDatabases.push(testDatabase);

  const app = createApp(dbPath);
  testDatabase.db = app.locals.db;
  return { app, dbPath };
}

test("GET /health returns backend status", async () => {
  const { app } = buildApp();
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.message, "PrintPoint Centre backend is running");
});

test("GET /designers returns seeded designers", async () => {
  const { app } = buildApp();
  const response = await request(app).get("/designers");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(Array.isArray(response.body.data));
  assert.ok(response.body.data.length >= 3);
});

test("POST /designers creates a new designer", async () => {
  const { app } = buildApp();
  const response = await request(app)
    .post("/designers")
    .send({ name: "Sofia Ahmed", email: "sofia.ahmed@printpoint.com" });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.name, "Sofia Ahmed");
  assert.equal(response.body.data.email, "sofia.ahmed@printpoint.com");
});

test("POST /printers creates a printer and adds audit record", async () => {
  const { app } = buildApp();
  const response = await request(app)
    .post("/printers")
    .send({ name: "Creality Ender 3", material: "PLA", status: "available" });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.name, "Creality Ender 3");

  const auditResponse = await request(app).get("/audit");
  assert.equal(auditResponse.status, 200);
  assert.equal(auditResponse.body.success, true);
  assert.equal(auditResponse.body.count, 1);
  assert.equal(auditResponse.body.data[0].action, "ADD");
  assert.equal(auditResponse.body.data[0].printer_id, response.body.data.id);
});

test("PUT /printers/:id updates a printer and logs an UPDATE audit record", async () => {
  const { app } = buildApp();
  const createResponse = await request(app)
    .post("/printers")
    .send({ name: "Creality Ender 3", material: "PLA", status: "available" });

  const response = await request(app)
    .put(`/printers/${createResponse.body.data.id}`)
    .send({ name: "Creality Ender 3 V2", material: "PETG", status: "printing" });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.name, "Creality Ender 3 V2");

  const auditResponse = await request(app).get("/audit");
  assert.equal(auditResponse.status, 200);
  assert.ok(auditResponse.body.data.some((entry) => entry.action === "UPDATE"));
});

test("GET /audit returns latest records newest first", async () => {
  const { app } = buildApp();
  const createResponse = await request(app)
    .post("/printers")
    .send({ name: "Creality Ender 3", material: "PLA", status: "available" });

  await request(app)
    .put(`/printers/${createResponse.body.data.id}`)
    .send({ name: "Creality Ender 3 V2", material: "PETG", status: "printing" });

  const response = await request(app).get("/audit");

  assert.equal(response.status, 200);
  assert.equal(response.body.count, 2);
  assert.deepEqual(
    response.body.data.map((entry) => entry.action),
    ["UPDATE", "ADD"]
  );
  response.body.data.forEach((entry) => {
    assert.ok(entry.time);
    assert.equal(entry.printer_id, createResponse.body.data.id);
  });
});

test("POST /printers validates required printer fields", async () => {
  const { app } = buildApp();
  const response = await request(app)
    .post("/printers")
    .send({ name: "", material: "PLA", status: "available" });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.match(response.body.message, /Printer name is required|Printer name must be a string/);
});

test("PUT /printers/:id with missing ID is rejected", async () => {
  const { app } = buildApp();
  const response = await request(app).put("/printers/not-a-number");

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("PUT /printers/:id on a non-existent printer returns 404", async () => {
  const { app } = buildApp();
  const response = await request(app)
    .put("/printers/9999")
    .send({ name: "Ghost Printer", material: "PLA", status: "available" });

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
});

test("DELETE /printers/:id on a non-existent printer returns 404", async () => {
  const { app } = buildApp();
  const response = await request(app).delete("/printers/9999");

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
});

test("GET /printers?material=PLA performs case-insensitive search", async () => {
  const { app } = buildApp();
  await request(app)
    .post("/printers")
    .send({ name: "Printer A", material: "PLA", status: "available" });
  await request(app)
    .post("/printers")
    .send({ name: "Printer B", material: "pla", status: "printing" });

  const response = await request(app).get("/printers?material=PLA");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.length >= 2);
  assert.ok(response.body.data.every((printer) => printer.material.toLowerCase() === "pla"));
});

test("GET /reservations returns JOIN data with designer and printer names", async () => {
  const { app } = buildApp();
  const response = await request(app).get("/reservations");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(Array.isArray(response.body.data));
  assert.ok(response.body.data.length >= 3);
  assert.ok(response.body.data[0].designer_name);
  assert.ok(response.body.data[0].printer_name);
});

test("POST /reservations rejects invalid foreign-key references", async () => {
  const { app } = buildApp();
  const response = await request(app)
    .post("/reservations")
    .send({ designer_id: 999, printer_id: 101, reservation_date: "2026-11-10", status: "pending" });

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.match(response.body.message, /Designer not found|Printer not found/);
});

test("Deleting a printer preserves audit history and logs DELETE action", async () => {
  const { app } = buildApp();
  const createResponse = await request(app)
    .post("/printers")
    .send({ name: "Test Delete Printer", material: "PLA", status: "available" });

  const deleteResponse = await request(app).delete(`/printers/${createResponse.body.data.id}`);
  assert.equal(deleteResponse.status, 200);
  assert.equal(deleteResponse.body.success, true);

  const auditResponse = await request(app).get("/audit");
  assert.equal(auditResponse.status, 200);
  assert.ok(auditResponse.body.data.some((entry) => entry.action === "DELETE" && entry.printer_id === createResponse.body.data.id));
});
