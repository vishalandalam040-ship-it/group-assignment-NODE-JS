function getAllDesigners(req, res, next) {
  try {
    const db = req.app.locals.db;
    const designers = db.prepare("SELECT * FROM designers ORDER BY id ASC").all();

    res.status(200).json({
      success: true,
      count: designers.length,
      data: designers,
    });
  } catch (error) {
    next(error);
  }
}

function getDesignerById(req, res, next) {
  try {
    const db = req.app.locals.db;
    const designerId = Number(req.params.id);

    if (!Number.isInteger(designerId) || designerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Designer ID must be a valid positive integer",
      });
    }

    const designer = db.prepare("SELECT * FROM designers WHERE id = ?").get(designerId);

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: "Designer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: designer,
    });
  } catch (error) {
    return next(error);
  }
}

function createDesigner(req, res, next) {
  try {
    const db = req.app.locals.db;
    const { name, email } = req.body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Designer name is required",
      });
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Designer email is required",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Designer email is invalid",
      });
    }

    const record = db
      .prepare("INSERT INTO designers (name, email) VALUES (?, ?)")
      .run(name.trim(), email.trim());

    return res.status(201).json({
      success: true,
      data: {
        id: Number(record.lastInsertRowid),
        name: name.trim(),
        email: email.trim(),
      },
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        success: false,
        message: "Designer email already exists",
      });
    }

    return next(error);
  }
}

module.exports = {
  getAllDesigners,
  getDesignerById,
  createDesigner,
};
