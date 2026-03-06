const db = require("../config/db");

/* =============================
   ADD INTERNSHIP
============================= */
exports.addInternship = (req, res) => {
  const { title, description, eligibility, website, deadline } = req.body;

  if (!title || !description || !eligibility || !deadline) {
    return res.status(400).json({ message: "All required fields missing" });
  }

  const sql = `
    INSERT INTO internships (title, description, eligibility, website, deadline)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [title, description, eligibility, website, deadline], (err, result) => {
    if (err) {
      console.error("Add Internship Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(201).json({ message: "Internship added successfully" });
  });
};

/* =============================
   GET ALL INTERNSHIPS
============================= */
exports.getInternships = (req, res) => {
  const sql = "SELECT * FROM internships ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get Internship Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
};

/* =============================
   DELETE INTERNSHIP
============================= */
exports.deleteInternship = (req, res) => {
  const { id } = req.params;

  // 1. Get internship title to clean up related applications
  db.query("SELECT title FROM internships WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error("Delete Internship Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (rows.length > 0) {
      const schemeName = rows[0].title;
      // 2. Delete all applications linked to this internship
      db.query("DELETE FROM applications WHERE scheme_name = ?", [schemeName], (err) => {
        if (err) console.error("Error deleting related applications:", err);
      });
    }

    // 3. Delete the internship itself
    db.query("DELETE FROM internships WHERE id = ?", [id], (err) => {
      if (err) {
        console.error("Delete Internship Error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Internship and related applications deleted successfully" });
    });
  });
};
