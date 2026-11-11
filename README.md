# PrintPoint Centre – 3D Printer Management System

## 1. Project overview
PrintPoint Centre is a backend-only 3D printer management API designed for a college assignment. The system manages designers, printers, reservations, availability, and activity history for a 3D printing facility.

## 2. Project objectives
- Build a modular Express.js backend.
- Use SQLite for persistent storage.
- Implement CRUD operations for printers and designers.
- Support reservations with SQL JOIN queries.
- Add validation and query parameter search.
- Log all printer add, update, and delete actions automatically.
- Test the backend using Node.js test runner and Supertest.

## 3. Technologies used
- Node.js
- Express.js
- SQLite
- better-sqlite3
- JavaScript (CommonJS)
- Node.js test runner
- Supertest
- Postman

## 4. Project folder structure
```text
printpoint-centre/
├── data/
│   └── printpoint.db
├── postman/
│   └── printpoint-centre.postman_collection.json
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── initDb.js
│   ├── controllers/
│   │   ├── auditController.js
│   │   ├── designerController.js
│   │   ├── printerController.js
│   │   └── reservationController.js
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── routes/
│   │   ├── auditRoutes.js
│   │   ├── designerRoutes.js
│   │   ├── printerRoutes.js
│   │   └── reservationRoutes.js
│   └── utils/
│       └── validators.js
├── test/
│   └── app.test.js
├── .gitignore
├── package.json
├── README.md
```

## 5. Installation requirements
- Node.js 22 LTS or later
- npm
- SQLite support through better-sqlite3
- VS C++ build tools for Windows native compilation when needed

## 6. Installation commands
```bash
npm ci
```
`better-sqlite3` installs a native binary for the current operating system and Node.js ABI. Run `npm ci` on each platform you use, and do not copy `node_modules` between Windows and Linux or between incompatible Node.js versions. On Windows, Visual C++ build tools may be needed if npm has to compile the native module.

## 7. How to initialize the database
```bash
npm run init-db
```
This creates the SQLite database and inserts seed data.

## 8. How to start the server
```bash
npm start
```
For development mode:
```bash
npm run dev
```

## 9. API endpoint documentation
### Health
- GET /health

### Designers
- GET /designers
- GET /designers/:id
- POST /designers

### Printers
- GET /printers
- GET /printers/:id
- POST /printers
- PUT /printers/:id
- DELETE /printers/:id

### Reservations
- GET /reservations
- POST /reservations

### Audit
- GET /audit

## 10. Example request bodies
### Create designer
```json
{
  "name": "Ava Reynolds",
  "email": "ava.reynolds@printpoint.com"
}
```

### Create printer
```json
{
  "name": "Prusa MK4",
  "material": "PLA",
  "status": "available"
}
```

### Create reservation
```json
{
  "designer_id": 1,
  "printer_id": 101,
  "reservation_date": "2026-11-10",
  "status": "confirmed"
}
```

## 11. Example API responses
### Health response
```json
{
  "success": true,
  "message": "PrintPoint Centre backend is running",
  "timestamp": "2026-11-10T15:30:00.000Z"
}
```

### Printer create response
```json
{
  "success": true,
  "data": {
    "id": 201,
    "name": "Prusa MK4",
    "material": "PLA",
    "status": "available"
  }
}
```

### Audit response
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 2,
      "action": "UPDATE",
      "printer_id": 201,
      "time": "2026-11-10T15:30:00.000Z"
    },
    {
      "id": 1,
      "action": "ADD",
      "printer_id": 201,
      "time": "2026-11-10T15:25:00.000Z"
    }
  ]
}
```

## 12. Database table descriptions
### designers
- id
- name
- email

### printers
- id
- name
- material
- status

### reservations
- id
- designer_id
- printer_id
- reservation_date
- status

### audit_logs
- id
- action
- printer_id
- time

## 13. Database relationship explanation
The `reservations` table stores references to both `designers` and `printers` using foreign keys. This creates a relationship between a designer and a printer reservation record. The design ensures that invalid references are prevented.

## 14. Audit trail explanation
Every successful ADD, UPDATE, and DELETE action on the printers table creates a corresponding record in `audit_logs`. These records are automatically inserted inside database transactions so they remain consistent with the printer change.

## 15. Postman testing instructions
1. Import the file `postman/printpoint-centre.postman_collection.json` into Postman.
2. Start the backend with `npm start`.
3. Run the `Printer CRUD Workflow` folder in order. The create request saves its returned ID to the `printerId` collection variable for the update, audit, and delete requests.
4. Confirm status codes and response bodies.

## 16. Expected outputs
When the project runs correctly, you should see:
- Healthy Express server response at /health
- Basic CRUD operations for designers and printers
- Reservation data returned via SQL JOIN
- Search by material using query parameters
- Automatic audit entries created for printer changes
- Passing automated Node.js tests
- Tests use isolated SQLite files in the OS temporary directory and remove them after each test

## Assignment compliance
This project follows the required backend assignment structure and includes modular Express routes, controller logic, SQLite database setup, validation, query-based filtering, and audit logging.
