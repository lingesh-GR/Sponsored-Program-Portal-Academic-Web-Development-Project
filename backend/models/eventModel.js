const db = require('../config/db');


/* ===============================
   GET ALL EVENTS
================================= */
exports.getAllEvents = async () => {
  const [rows] = await db.query("SELECT * FROM events ORDER BY id DESC");
  return rows;
};

/* ===============================
   ADD EVENT
================================= */
exports.addEvent = async (event) => {
  const { title, description, event_date, location, website } = event;

  const sql = `
    INSERT INTO events (title, description, event_date, location, website)
    VALUES (?, ?, ?, ?, ?)
  `;

  await db.query(sql, [
    title,
    description,
    event_date || null,
    location || null,
    website || null
  ]);
};

/* ===============================
   DELETE EVENT
================================= */
exports.deleteEvent = async (id) => {
  await db.query("DELETE FROM events WHERE id = ?", [id]);
};
