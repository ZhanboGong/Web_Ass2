/**
 * 目标：
 * 需要对sql语句进行安全处理 （√）
 * 可考虑加异步处理
 */
const dbCon = require("../db/database");
const express = require("express");
const router = express.Router();

/**
 * GET:Obtain all categories for the construction of the filter.
 */
router.get('/categories', (req, res) => {
    const connection = dbCon.getConnection();
    connection.query(
        'SELECT * FROM categories ORDER BY CategoryName',
        (err, records) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Server Error' });
            } else {
                res.json(records);
            }
            connection.end();
        }
    );
});

/**
 * GET: Including fuzzy word search and the filters specified in ass2, 
 * it is used for the basic search on the home page and the advanced search (filters) on the search page.
 */
router.get('/events', (req, res) => {
    const connection = dbCon.getConnection();
    let { date, location, category, q } = req.query;
    let sql = `
    SELECT e.EventID, e.EventName, e.EventImage, e.EventDate,
           e.Location, e.Description, e.TicketPrice, e.CurrentAttendees,
           e.GoalAttendees,
           c.CategoryName
    FROM events e
    JOIN categories c ON e.CategoryID = c.CategoryID
    WHERE e.CurrentStatus = 1`;

    let params = [];
    if (q) {
        sql += ' AND (e.EventName LIKE ? OR e.Description LIKE ?)';
        params.push(`%${q}%`, `%${q}%`);
    }
    if (date) {
        sql += ' AND e.EventDate = ?';
        params.push(date);
    }
    if (location) {
        sql += ' AND e.Location LIKE ?';
        params.push(`%${location}%`);
    }
    if (category) {
        sql += ' AND c.CategoryName = ?';
        params.push(category);
    }

    sql += ' ORDER BY e.EventDate ASC';

    connection.query(sql, params, (err, records) => {
        if (err) {
            console.error("Error while retrieving data:", err);
            res.status(500).json({ error: 'Server Error' });
        } else {
            res.json(records);
        }
        connection.end();
    });
});

/**
 * GET: Retrieve the data with the specified ID, 
 * which is used for the transition from the home page and the search page to the specific event content page.
 */
router.get('/events/:id', (req, res) => {
    const connection = dbCon.getConnection();
    const sql = `
    SELECT e.EventID, e.EventName, e.EventImage, e.EventDate,
           e.Location, e.Description, e.TicketPrice, e.CurrentAttendees,
           e.GoalAttendees,
           c.CategoryName
    FROM events e
    JOIN categories c ON e.CategoryID = c.CategoryID
    WHERE e.EventID = ? AND e.CurrentStatus = 1`;

    connection.query(sql, [req.params.id], (err, records) => {
        if (err) {
            console.error("Error while retrieving data:", err);
            return res.status(500).json({ error: 'Server Error' });
        }
        if (!records.length) {
            return res.status(404).json({ msg: 'Event not found' });
        }
        res.json(records[0]);
        connection.end();
    });
});

/**
 * PUT:用于每次
 */
router.put('/events/:id', (req, res) => {
    const connection = dbCon.getConnection();
    const sql = '';
});

module.exports = router;