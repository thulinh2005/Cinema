const db = require("../config/db");

const getDanhSachPhim = (req, res) => {

    const sql = "SELECT * FROM phim";

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

};

module.exports = {
    getDanhSachPhim
};