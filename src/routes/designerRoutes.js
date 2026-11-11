const express = require("express");
const {
  getAllDesigners,
  getDesignerById,
  createDesigner,
} = require("../controllers/designerController");

const router = express.Router();

router.get("/", getAllDesigners);
router.get("/:id", getDesignerById);
router.post("/", createDesigner);

module.exports = router;
