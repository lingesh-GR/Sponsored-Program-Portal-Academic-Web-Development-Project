const db = require("../config/db");

/* ================= GET EVENTS ================= */
exports.getEvents = async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM events ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Get events error:", err);
    res.status(500).json({ message: "Server error while fetching events" });
  }
};

/* ================= ADD EVENT ================= */
exports.addEvent = async (req, res) => {
  try {
    const { title, description, event_date, website } = req.body;

    if (!title || !description || !event_date) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    await db.promise().query(
      "INSERT INTO events (title, description, event_date, website) VALUES (?, ?, ?, ?)",
      [title, description, event_date, website || null]
    );

    res.status(201).json({ message: "Event added successfully" });

  } catch (err) {
    console.error("Add event error:", err);
    res.status(500).json({ message: "Server error while adding event" });
  }
};

/* ================= DELETE EVENT ================= */
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // 1. Get event title so we can clean up related applications
    const [rows] = await db.promise().query("SELECT title FROM events WHERE id = ?", [eventId]);

    if (rows.length > 0) {
      const schemeName = `[EVENT] ${rows[0].title}`;
      // 2. Delete all applications linked to this event
      await db.promise().query("DELETE FROM applications WHERE scheme_name = ?", [schemeName]);
    }

    // 3. Delete the event itself
    await db.promise().query("DELETE FROM events WHERE id = ?", [eventId]);

    res.json({ message: "Event and related applications deleted successfully" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ message: "Server error while deleting event" });
  }
};
