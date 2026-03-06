const db = require('../config/db');   // ✅ IMPORTANT (not database/connection)

const Internship = {

    getAll: (callback) => {
        db.query("SELECT * FROM internships ORDER BY id DESC", callback);
    },

    create: (data, callback) => {
        const sql = `
            INSERT INTO internships (title, description, eligibility, deadline, website)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            data.title,
            data.description,
            data.eligibility,
            data.deadline,
            data.website
        ], callback);
    },

    delete: (id, callback) => {
        db.query("DELETE FROM internships WHERE id = ?", [id], callback);
    }

};

module.exports = Internship;
