const axios = require('axios');
const db = require('../config/db');

/* =========================================
   📊 GOOGLE SHEETS SYNC CONTROLLER
   Fetches CSV data from a published Google Sheet
   and inserts new entries into the database.
========================================= */

// Base URL for fetching a published Google Sheet as CSV
function getSheetCSVUrl(sheetId, gid = 0) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

// Parse CSV text into array of objects
function parseCSV(csvText) {
    // Normalize line endings (Windows \r\n → \n)
    const normalized = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    console.log('📊 CSV Headers:', headers);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        console.log(`📊 Row ${i}:`, values);

        // Be flexible - pad with empty strings if fewer columns
        while (values.length < headers.length) values.push('');

        const row = {};
        headers.forEach((header, idx) => {
            row[header] = (values[idx] || '').trim().replace(/^"|"$/g, '');
        });
        rows.push(row);
    }

    console.log(`📊 Parsed ${rows.length} rows`);
    return rows;
}

// Handle CSV lines with commas inside quotes
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

/* =========================================
   SYNC SCHEMES
========================================= */
async function syncSchemes(sheetId, gid = 0) {
    const url = getSheetCSVUrl(sheetId, gid);
    const response = await axios.get(url);
    const rows = parseCSV(response.data);

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
        if (!row.title) continue;

        // Check if scheme already exists by title
        const [existing] = await db.promise().query(
            'SELECT id FROM schemes WHERE title = ?', [row.title]
        );

        if (existing.length > 0) {
            skipped++;
            continue;
        }

        await db.promise().query(
            'INSERT INTO schemes (title, description, eligibility, deadline, website) VALUES (?, ?, ?, ?, ?)',
            [row.title, row.description || '', row.eligibility || '', row.deadline || null, row.website || '']
        );
        inserted++;
    }

    return { type: 'schemes', inserted, skipped, total: rows.length };
}

/* =========================================
   SYNC INTERNSHIPS
========================================= */
async function syncInternships(sheetId, gid = 1) {
    const url = getSheetCSVUrl(sheetId, gid);
    const response = await axios.get(url);
    const rows = parseCSV(response.data);

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
        if (!row.title) continue;

        const [existing] = await db.promise().query(
            'SELECT id FROM internships WHERE title = ?', [row.title]
        );

        if (existing.length > 0) {
            skipped++;
            continue;
        }

        await db.promise().query(
            'INSERT INTO internships (title, description, eligibility, deadline, website) VALUES (?, ?, ?, ?, ?)',
            [row.title, row.description || '', row.eligibility || '', row.deadline || null, row.website || '']
        );
        inserted++;
    }

    return { type: 'internships', inserted, skipped, total: rows.length };
}

/* =========================================
   SYNC EVENTS
========================================= */
async function syncEvents(sheetId, gid = 2) {
    const url = getSheetCSVUrl(sheetId, gid);
    const response = await axios.get(url);
    const rows = parseCSV(response.data);

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
        if (!row.title) continue;

        const [existing] = await db.promise().query(
            'SELECT id FROM events WHERE title = ?', [row.title]
        );

        if (existing.length > 0) {
            skipped++;
            continue;
        }

        // Flexible column names: accept event_date OR deadline, location OR eligibility
        const eventDate = row.event_date || row.deadline || null;
        const location = row.location || row.eligibility || '';

        await db.promise().query(
            'INSERT INTO events (title, description, event_date, location, website) VALUES (?, ?, ?, ?, ?)',
            [row.title, row.description || '', eventDate, location, row.website || '']
        );
        inserted++;
    }

    return { type: 'events', inserted, skipped, total: rows.length };
}

/* =========================================
   SYNC ALL (called by route or cron)
========================================= */
exports.syncAll = async (req, res) => {
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId) {
        return res.status(400).json({
            message: 'Google Sheet ID not configured. Add GOOGLE_SHEET_ID to your .env file.'
        });
    }

    try {
        const results = [];

        // Sync schemes (gid=0 = first tab)
        try {
            const schemeResult = await syncSchemes(sheetId, 0);
            results.push(schemeResult);
        } catch (err) {
            results.push({ type: 'schemes', error: err.message });
        }

        // Sync internships (gid=1357300959 = second tab)
        try {
            const internResult = await syncInternships(sheetId, 1357300959);
            results.push(internResult);
        } catch (err) {
            results.push({ type: 'internships', error: err.message });
        }

        // Sync events (gid=1353083207 = third tab)
        try {
            const eventResult = await syncEvents(sheetId, 1353083207);
            results.push(eventResult);
        } catch (err) {
            results.push({ type: 'events', error: err.message });
        }

        const totalInserted = results.reduce((sum, r) => sum + (r.inserted || 0), 0);
        const totalSkipped = results.reduce((sum, r) => sum + (r.skipped || 0), 0);

        console.log(`📊 Sheets Sync: ${totalInserted} inserted, ${totalSkipped} skipped`);

        res.json({
            message: `Sync complete! ${totalInserted} new items added, ${totalSkipped} duplicates skipped.`,
            details: results
        });
    } catch (err) {
        console.error('Sync error:', err);
        res.status(500).json({ message: 'Sync failed: ' + err.message });
    }
};

/* =========================================
   AUTO-SYNC (for cron job — no req/res)
========================================= */
exports.autoSync = async () => {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) return;

    try {
        const schemeResult = await syncSchemes(sheetId, 0).catch(() => null);
        const internResult = await syncInternships(sheetId, 1357300959).catch(() => null);
        const eventResult = await syncEvents(sheetId, 1353083207).catch(() => null);

        const inserted = (schemeResult?.inserted || 0) + (internResult?.inserted || 0) + (eventResult?.inserted || 0);
        if (inserted > 0) {
            console.log(`🔄 Auto-sync: ${inserted} new items added from Google Sheets`);
        }
    } catch (err) {
        console.error('Auto-sync error:', err.message);
    }
};
