const { validateReservationPayload } = require("../utils/validators");

function getAllReservations(req, res, next) {
  try {
    const db = req.app.locals.db;

    const reservations = db
      .prepare(`
        SELECT
          r.id,
          d.name AS designer_name,
          p.name AS printer_name,
          r.reservation_date,
          r.status
        FROM reservations r
        INNER JOIN designers d ON d.id = r.designer_id
        INNER JOIN printers p ON p.id = r.printer_id
        ORDER BY r.id ASC
      `)
      .all();

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
}

function createReservation(req, res, next) {
  try {
    const db = req.app.locals.db;
    const payload = req.body || {};
    const validationError = validateReservationPayload(payload);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const designerId = Number(payload.designer_id);
    const printerId = Number(payload.printer_id);

    const designer = db.prepare("SELECT id FROM designers WHERE id = ?").get(designerId);
    if (!designer) {
      return res.status(404).json({
        success: false,
        message: "Designer not found",
      });
    }

    const printer = db.prepare("SELECT id FROM printers WHERE id = ?").get(printerId);
    if (!printer) {
      return res.status(404).json({
        success: false,
        message: "Printer not found",
      });
    }

    const result = db
      .prepare(
        "INSERT INTO reservations (designer_id, printer_id, reservation_date, status) VALUES (?, ?, ?, ?)"
      )
      .run(designerId, printerId, payload.reservation_date.trim(), payload.status.trim());

    return res.status(201).json({
      success: true,
      data: {
        id: Number(result.lastInsertRowid),
        designer_id: designerId,
        printer_id: printerId,
        reservation_date: payload.reservation_date.trim(),
        status: payload.status.trim(),
      },
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(409).json({
        success: false,
        message: "Reservation references an invalid designer or printer",
      });
    }

    return next(error);
  }
}

module.exports = {
  getAllReservations,
  createReservation,
};
