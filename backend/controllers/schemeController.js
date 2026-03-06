const db = require("../config/db");

/* =============================
   GET ALL SCHEMES
============================= */
exports.getAllSchemes = (req, res) => {
  const sql = "SELECT * FROM schemes ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

/* =============================
   ADD SCHEME
============================= */
exports.addScheme = (req, res) => {
  const { title, description, eligibility, deadline, website } = req.body;

  const sql =
    "INSERT INTO schemes (title, description, eligibility, deadline, website) VALUES (?, ?, ?, ?, ?)";

  db.query(
    sql,
    [title, description, eligibility, deadline, website],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Scheme added successfully" });
    }
  );
};

/* =============================
   DELETE SCHEME
============================= */
exports.deleteScheme = (req, res) => {
  const id = req.params.id;

  // 1. Get scheme title to clean up related applications
  db.query("SELECT title FROM schemes WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    if (rows.length > 0) {
      const schemeName = rows[0].title;
      // 2. Delete all applications linked to this scheme
      db.query("DELETE FROM applications WHERE scheme_name = ?", [schemeName], (err) => {
        if (err) console.error("Error deleting related applications:", err);
      });
    }

    // 3. Delete the scheme itself
    db.query("DELETE FROM schemes WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Scheme and related applications deleted successfully" });
    });
  });
};
