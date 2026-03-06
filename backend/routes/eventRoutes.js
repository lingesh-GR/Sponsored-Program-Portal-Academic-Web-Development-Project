const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");

/* PUBLIC */
router.get("/events", eventController.getEvents);

/* ADMIN */
router.post("/admin/events", eventController.addEvent);
router.delete("/admin/events/:id", eventController.deleteEvent);

module.exports = router;
