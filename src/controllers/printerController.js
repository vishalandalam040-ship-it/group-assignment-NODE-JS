const { validatePrinterPayload, validatePositiveInteger } = require("../utils/validators");

function getAllPrinters(req, res, next) {
  try {
    const db = req.app.locals.db;
    const materialParam = req.query.material;

    let sql = "SELECT * FROM printers";
    const params = [];

    if (materialParam !== undefined) {
      const trimmedMaterial = String(materialParam).trim();

      if (trimmedMaterial) {
        sql += " WHERE LOWER(material) = LOWER(?)";
        params.push(trimmedMaterial);
      }
    }

    sql += " ORDER BY id ASC";

    const printers = db.prepare(sql).all(...params);

    res.status(200).json({
      success: true,
      count: printers.length,
      data: printers,
    });
  } catch (error) {
    next(error);
  }
}

function getPrinterById(req, res, next) {
  try {
    const db = req.app.locals.db;
    const printerId = Number(req.params.id);

    const idError = validatePositiveInteger(req.params.id, "Printer ID");
    if (idError) {
      return res.status(400).json({
        success: false,
        message: idError,
      });
    }

    const printer = db.prepare("SELECT * FROM printers WHERE id = ?").get(printerId);

    if (!printer) {
      return res.status(404).json({
        success: false,
        message: "Printer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: printer,
    });
  } catch (error) {
    return next(error);
  }
}

function createPrinter(req, res, next) {
  try {
    const db = req.app.locals.db;
    const payload = req.body || {};
    const validationError = validatePrinterPayload(payload);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const insertTransaction = db.transaction(() => {
      const insertResult = db
        .prepare("INSERT INTO printers (name, material, status) VALUES (?, ?, ?)")
        .run(payload.name.trim(), payload.material.trim(), payload.status.trim());

      db.prepare("INSERT INTO audit_logs (action, printer_id, time) VALUES (?, ?, ?)")
        .run("ADD", Number(insertResult.lastInsertRowid), new Date().toISOString());

      return {
        id: Number(insertResult.lastInsertRowid),
        name: payload.name.trim(),
        material: payload.material.trim(),
        status: payload.status.trim(),
      };
    });

    const createdPrinter = insertTransaction();

    return res.status(201).json({
      success: true,
      data: createdPrinter,
    });
  } catch (error) {
    return next(error);
  }
}

function updatePrinter(req, res, next) {
  try {
    const db = req.app.locals.db;
    const printerId = Number(req.params.id);

    const idError = validatePositiveInteger(req.params.id, "Printer ID");
    if (idError) {
      return res.status(400).json({
        success: false,
        message: idError,
      });
    }

    const existingPrinter = db.prepare("SELECT * FROM printers WHERE id = ?").get(printerId);
    if (!existingPrinter) {
      return res.status(404).json({
        success: false,
        message: "Printer not found",
      });
    }

    const payload = req.body || {};
    const validationError = validatePrinterPayload(payload);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const updateTransaction = db.transaction(() => {
      const updateResult = db
        .prepare("UPDATE printers SET name = ?, material = ?, status = ? WHERE id = ?")
        .run(payload.name.trim(), payload.material.trim(), payload.status.trim(), printerId);

      if (updateResult.changes !== 1) {
        throw new Error("Printer update failed");
      }

      db.prepare("INSERT INTO audit_logs (action, printer_id, time) VALUES (?, ?, ?)")
        .run("UPDATE", printerId, new Date().toISOString());

      return {
        id: printerId,
        name: payload.name.trim(),
        material: payload.material.trim(),
        status: payload.status.trim(),
      };
    });

    const updatedPrinter = updateTransaction();

    return res.status(200).json({
      success: true,
      data: updatedPrinter,
    });
  } catch (error) {
    return next(error);
  }
}

function deletePrinter(req, res, next) {
  try {
    const db = req.app.locals.db;
    const printerId = Number(req.params.id);

    const idError = validatePositiveInteger(req.params.id, "Printer ID");
    if (idError) {
      return res.status(400).json({
        success: false,
        message: idError,
      });
    }

    const existingPrinter = db.prepare("SELECT * FROM printers WHERE id = ?").get(printerId);
    if (!existingPrinter) {
      return res.status(404).json({
        success: false,
        message: "Printer not found",
      });
    }

    const deleteTransaction = db.transaction(() => {
      const deleteResult = db.prepare("DELETE FROM printers WHERE id = ?").run(printerId);

      if (deleteResult.changes !== 1) {
        throw new Error("Printer deletion failed");
      }

      db.prepare("INSERT INTO audit_logs (action, printer_id, time) VALUES (?, ?, ?)")
        .run("DELETE", printerId, new Date().toISOString());

      return existingPrinter;
    });

    const deletedPrinter = deleteTransaction();

    return res.status(200).json({
      success: true,
      message: "Printer deleted successfully",
      data: deletedPrinter,
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(409).json({
        success: false,
        message: "Printer cannot be deleted because it is referenced by reservations",
      });
    }

    return next(error);
  }
}

module.exports = {
  getAllPrinters,
  getPrinterById,
  createPrinter,
  updatePrinter,
  deletePrinter,
};
