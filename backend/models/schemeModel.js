const db = require("../config/db");

exports.createScheme = (data, callback) => {
  const sql = `
    INSERT INTO schemes (title, description, eligibility, deadline, website)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [data.title, data.description, data.eligibility, data.deadline, data.website],
    callback
  );
};

exports.getAllSchemes = (callback) => {
  db.query("SELECT * FROM schemes ORDER BY created_at DESC", callback);
};

exports.deleteScheme = (id, callback) => {
  db.query("DELETE FROM schemes WHERE id = ?", [id], callback);
};
