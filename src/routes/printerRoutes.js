const express = require("express");
const {
  getAllPrinters,
  getPrinterById,
  createPrinter,
  updatePrinter,
  deletePrinter,
} = require("../controllers/printerController");

const router = express.Router();

router.get("/", getAllPrinters);
router.get("/:id", getPrinterById);
router.post("/", createPrinter);
router.put("/:id", updatePrinter);
router.delete("/:id", deletePrinter);

module.exports = router;
