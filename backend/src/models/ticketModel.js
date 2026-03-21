const db = require("../config/db");

const Ticket = {

    getAll: (callback) => {

        const sql = `
        SELECT v.*, sc.ngay_chieu, sc.gio_chieu, g.so_ghe
        FROM ve v
        JOIN suat_chieu sc ON v.ma_suat_chieu = sc.ma_suat_chieu
        JOIN ghe g ON v.ma_ghe = g.ma_ghe
        `;

        db.query(sql, callback);
    },

    create: (data, callback) => {

        const sql = `
        INSERT INTO ve
        (ma_suat_chieu, ma_ghe, gia_ve, ma_hd, trang_thai)
        VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            data.ma_suat_chieu,
            data.ma_ghe,
            data.gia_ve,
            data.ma_hd,
            data.trang_thai
        ], callback);
    }

};

module.exports = Ticket;