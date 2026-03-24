const db = require("../config/db");

const Showtime = {

    getAll: (callback) => {

        const sql = `
        SELECT sc.*, p.ten_phim, pc.ten_phong
        FROM suat_chieu sc
        JOIN phim p ON sc.ma_phim = p.ma_phim
        JOIN phong_chieu pc ON sc.ma_phong = pc.ma_phong
        `;

        db.query(sql, callback);
    },

    create: (data, callback) => {

        const sql = `
        INSERT INTO suat_chieu
        (ma_phim, ma_phong, ngay_chieu, gio_chieu, gio_ket_thuc, trang_thai)
        VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            data.ma_phim,
            data.ma_phong,
            data.ngay_chieu,
            data.gio_chieu,
            data.gio_ket_thuc,
            data.trang_thai
        ], callback);
    },

    delete: (id, callback) => {

        const sql = "DELETE FROM suat_chieu WHERE ma_suat_chieu=?";

        db.query(sql, [id], callback);
    }

};

module.exports = Showtime;