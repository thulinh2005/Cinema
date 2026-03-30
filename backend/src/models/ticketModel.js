const db = require("../config/db");

const Ticket = {

    getAll: (filters, callback) => {
        let sql = `
            SELECT v.*, p.ten_phim, pc.ten_phong, sc.ngay_chieu, sc.gio_chieu, g.so_ghe, sc.ma_phim, sc.ma_phong
            FROM ve v
            JOIN suat_chieu sc ON v.ma_suat_chieu = sc.ma_suat_chieu
            JOIN phim p ON sc.ma_phim = p.ma_phim
            JOIN phong_chieu pc ON sc.ma_phong = pc.ma_phong
            JOIN ghe g ON v.ma_ghe = g.ma_ghe
            WHERE 1=1
        `;
        const params = [];

        if (filters.ma_phim) {
            sql += " AND sc.ma_phim = ?";
            params.push(filters.ma_phim);
        }
        if (filters.ma_phong) {
            sql += " AND sc.ma_phong = ?";
            params.push(filters.ma_phong);
        }
        if (filters.ma_suat_chieu) {
            sql += " AND v.ma_suat_chieu = ?";
            params.push(filters.ma_suat_chieu);
        }

        sql += " ORDER BY v.ma_ve DESC";

        db.query(sql, params, callback);
    },

    getStats: (filters, callback) => {
        let sql = `
            SELECT 
                COUNT(CASE WHEN v.trang_thai = 'DA_THANH_TOAN' THEN 1 END) as tong_da_ban,
                COUNT(CASE WHEN v.trang_thai = 'CHO_THANH_TOAN' THEN 1 END) as tong_chua_ban
            FROM ve v
            JOIN suat_chieu sc ON v.ma_suat_chieu = sc.ma_suat_chieu
            WHERE 1=1
        `;
        const params = [];

        if (filters.ma_phim) {
            sql += " AND sc.ma_phim = ?";
            params.push(filters.ma_phim);
        }
        if (filters.ma_phong) {
            sql += " AND sc.ma_phong = ?";
            params.push(filters.ma_phong);
        }
        if (filters.ma_suat_chieu) {
            sql += " AND v.ma_suat_chieu = ?";
            params.push(filters.ma_suat_chieu);
        }

        db.query(sql, params, callback);
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