const express = require("express");
const router = express.Router();

const schemeController = require("../controllers/schemeController");

// GET all schemes
router.get("/schemes", schemeController.getAllSchemes);

// ADMIN add scheme
router.post("/admin/schemes", schemeController.addScheme);

// ADMIN delete scheme
router.delete("/admin/schemes/:id", schemeController.deleteScheme);

module.exports = router;
