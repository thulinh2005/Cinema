const db = require("../config/db");

const User = {
    findByUsername: (username, callback) => {
        const sql = "SELECT * FROM tai_khoan WHERE ten_dang_nhap = ? AND trang_thai = 1";
        db.query(sql, [username], callback);
    }
};

module.exports = User;