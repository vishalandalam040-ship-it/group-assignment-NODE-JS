const express = require("express");
const { initializeDatabase, getDefaultDbPath } = require("./config/db");
const designerRoutes = require("./routes/designerRoutes");
const printerRoutes = require("./routes/printerRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const auditRoutes = require("./routes/auditRoutes");

function createApp(databasePath = getDefaultDbPath()) {
  const db = initializeDatabase(databasePath, {
    forceReset: process.env.NODE_ENV === "test",
    skipSeed: false,
  });

  const app = express();
  app.locals.db = db;

  app.use(express.json());

  app.get("/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "PrintPoint Centre backend is running",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/designers", designerRoutes);
  app.use("/printers", printerRoutes);
  app.use("/reservations", reservationRoutes);
  app.use("/audit", auditRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || "Internal server error";

    console.error(error);

    res.status(statusCode).json({
      success: false,
      message,
    });
  });

  return app;
}

module.exports = { createApp };
