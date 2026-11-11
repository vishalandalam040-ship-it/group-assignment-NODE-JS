function getAuditLogs(req, res, next) {
  try {
    const db = req.app.locals.db;

    const audits = db
      .prepare(
        "SELECT id, action, printer_id, time FROM audit_logs ORDER BY time DESC, id DESC LIMIT 10"
      )
      .all();

    res.status(200).json({
      success: true,
      count: audits.length,
      data: audits,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAuditLogs,
};
