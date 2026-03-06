const express = require("express");
const router = express.Router();

const applicationController = require("../controllers/applicationController");
const { verifyToken, isAdmin, isStudent } = require("../middleware/authMiddleware");

/* =========================
   STUDENT ROUTES
========================= */

// GET my applications
router.get(
  "/student/applications",
  verifyToken,
  isStudent,
  applicationController.getMyApplications
);

// GET my stats
router.get(
  "/student/applications/stats",
  verifyToken,
  isStudent,
  applicationController.getMyStats
);

// POST apply to scheme
router.post(
  "/student/applications",
  verifyToken,
  isStudent,
  applicationController.applyToScheme
);

/* =========================
   ADMIN ROUTES
========================= */

// GET all applications
router.get(
  "/admin/applications",
  verifyToken,
  isAdmin,
  applicationController.getAllApplications
);

// GET stats
router.get(
  "/admin/applications/stats",
  verifyToken,
  isAdmin,
  applicationController.getStats
);

// UPDATE status
router.put(
  "/admin/applications/status/:id",
  verifyToken,
  isAdmin,
  applicationController.updateStatus
);

// DELETE application
router.delete(
  "/admin/applications/:id",
  verifyToken,
  isAdmin,
  applicationController.deleteApplication
);

module.exports = router;
