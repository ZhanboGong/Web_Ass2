const dbCon = require("../db/database");
const connection = dbCon.getConnection();

const express = require("express");
const router = express.Router();

// 需要进行修改 select all
router.get("/", (req, res) => {
    connection.query("select * from categories ORDER BY CategoryID", (err, records, fields) => {
        if (err) {
            console.error("Error while retrieve the data");
        } else {
            res.send(records);
        }
    })
})

// 需要进行修改 select sth. through id
router.get("/:id", (req, res) => {
    connection.query("select * from categories where id=" + req.params.id, (err, records, fields) => {
        if (err) {
            console.error("Error while retrieve the data");
        } else {
            res.send(records);
        }
    })
})

module.exports = router;