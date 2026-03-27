const db = require("../config/db");

const Ticket = {

getAll: (search, callback) => {

let sql = `
SELECT v.*, g.so_ghe, sc.ma_phong
FROM ve v
JOIN ghe g ON v.ma_ghe = g.ma_ghe
JOIN suat_chieu sc ON v.ma_suat_chieu = sc.ma_suat_chieu
`;

if (search) {
sql += ` WHERE v.ma_ve LIKE '%${search}%' OR v.ma_hd LIKE '%${search}%'`;
}

db.query(sql, callback);

},

cancel: (id, callback) => {

const sql = `
UPDATE ve
SET trang_thai='Đã huỷ'
WHERE ma_ve=?
`;

db.query(sql, [id], callback);

}

};

module.exports = Ticket;