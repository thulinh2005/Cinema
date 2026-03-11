const db = require("../config/db");

exports.getSuatChieu = (req, res) => {

    const sql = "SELECT * FROM suat_chieu";

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

};