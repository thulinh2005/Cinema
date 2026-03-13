const db = require("../config/db");

const Customer = {

    getAll: (search, callback) => {
        let sql = "SELECT * FROM khach_hang";
        let params = [];

        if (search) {
            sql += " WHERE ho_ten LIKE ? OR so_dien_thoai LIKE ?";
            params.push(`%${search}%`, `%${search}%`);
        }

        db.query(sql, params, callback);
    },

    create: (data, callback) => {
        const sql = `
            INSERT INTO khach_hang 
            (ho_ten, ngay_sinh, so_dien_thoai, diem_tich_luy, hang_thanh_vien)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            data.ho_ten,
            data.ngay_sinh,
            data.so_dien_thoai,
            data.diem_tich_luy || 0,
            data.hang_thanh_vien || "STANDARD"
        ], callback);
    },

    update: (id, data, callback) => {
        const sql = `
            UPDATE khach_hang 
            SET ho_ten=?, ngay_sinh=?, so_dien_thoai=?, hang_thanh_vien=? 
            WHERE ma_kh=?
        `;

        db.query(sql, [
            data.ho_ten,
            data.ngay_sinh,
            data.so_dien_thoai,
            data.hang_thanh_vien,
            id
        ], callback);
    },

    delete: (id, callback) => {
        const sql = "DELETE FROM khach_hang WHERE ma_kh=?";
        db.query(sql, [id], callback);
    }

};

module.exports = Customer;