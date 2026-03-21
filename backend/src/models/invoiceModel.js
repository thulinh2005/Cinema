const db = require("../config/db");

const Invoice = {

    getAll: (callback) => {

        const sql = `
        SELECT hd.*, kh.ho_ten AS ten_kh, nv.ho_ten AS ten_nv
        FROM hoa_don hd
        LEFT JOIN khach_hang kh ON hd.ma_kh = kh.ma_kh
        LEFT JOIN nhan_vien nv ON hd.ma_nv = nv.ma_nv
        `;

        db.query(sql, callback);
    },

    create: (data, callback) => {

        const sql = `
        INSERT INTO hoa_don
        (tong_tien, ma_kh, ma_nv)
        VALUES (?, ?, ?)
        `;

        db.query(sql, [
            data.tong_tien,
            data.ma_kh,
            data.ma_nv
        ], callback);
    }

};

module.exports = Invoice;