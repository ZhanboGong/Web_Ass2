/**
 * 需要对sql语句进行安全处理
 * 可考虑加异步处理
 */
const dbCon = require("../db/database");

const express = require("express");
const router = express.Router();


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

router.get('/events', (req, res) => {
    const connection = dbCon.getConnection();
    let { date, location, category } = req.query;
    let sql = `
    SELECT e.EventID, e.EventName, e.EventDescription, e.EventDate,
           e.Location, e.TicketPrice, e.GoalAmount, e.CurrentStatus,
           e.GoalAttendees, e.CurrentAttendees,
           c.CategoryName
    FROM EVENTS e
    JOIN CATEGORIES c ON e.CategoryID = c.CategoryID
    WHERE 1=1`;
    let param = [];

    if (date) { sql += ' AND e.EventDate = ?'; param.push(date); }
    if (location) { sql += ' AND e.Location LIKE ?'; param.push(`%${location}%`); }
    if (category) { sql += ' AND c.CategoryName LIKE ?'; param.push(`%${category}%`); }

    sql += ' ORDER BY e.EventDate';
    connection.query(sql, param, (err, records) => {
        if (err) {
            console.error("Error while retrieve the data", err);
            res.status(500).json({ error: 'Server Error' });
            return;
        }
        res.json(records);
        connection.end();
    });
});

router.get('/events/:id', (req, res) => {
    const connection = dbCon.getConnection();
    const sql = `
    SELECT e.EventID, e.EventName, e.EventDescription, e.EventDate,
           e.Location, e.TicketPrice, e.GoalAmount, e.CurrentStatus,
           e.GoalAttendees, e.CurrentAttendees,
           c.CategoryName
    FROM EVENTS e
    JOIN CATEGORIES c ON e.CategoryID = c.CategoryID
    WHERE e.EventID = ?`;
    connection.query(sql, [req.params.id], (err, records) => {
        if (err) {
            console.error("Error while retrieve the data", err);
            res.status(500).json({ error: 'Server Error' });
            return;
        }
        if (!records.length) {
            res.status(404).json({ msg: 'Not found' });
            connection.end();
            return;
        }
        res.json(records[0]);
        connection.end();
    });
});


module.exports = router;