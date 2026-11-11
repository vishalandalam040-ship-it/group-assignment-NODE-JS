const { initializeDatabase, getDefaultDbPath } = require("./db");

const databasePath = getDefaultDbPath();
const db = initializeDatabase(databasePath, { forceReset: false, skipSeed: false });

console.log(`Database initialized successfully at ${databasePath}`);

db.close();
