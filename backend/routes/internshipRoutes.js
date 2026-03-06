const express = require("express");
const router = express.Router();

const internshipController = require("../controllers/internshipController");

/* GET all internships */
router.get("/internships", internshipController.getInternships);

/* ADMIN add internship */
router.post("/admin/internships", internshipController.addInternship);

/* ADMIN delete internship */
router.delete("/admin/internships/:id", internshipController.deleteInternship);

module.exports = router;
