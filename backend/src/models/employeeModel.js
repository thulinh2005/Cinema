const db = require("../config/db");

const Employee = {
    getAll: (search, callback) => {
        let sql = "SELECT * FROM nhan_vien";
        let params = [];

        if (search) {
            sql += " WHERE so_dien_thoai LIKE ? OR ma_nv LIKE ?";
            params.push(`%${search}%`, `%${search}%`);
        }

        db.query(sql, params, callback);
    },

    checkPhoneExists: (so_dien_thoai, callback) => {
        const sql = "SELECT * FROM nhan_vien WHERE so_dien_thoai = ?";
        db.query(sql, [so_dien_thoai], callback);
    },

    checkPhoneExistsExclude: (so_dien_thoai, ma_nv, callback) => {
        const sql = "SELECT * FROM nhan_vien WHERE so_dien_thoai = ? AND ma_nv != ?";
        db.query(sql, [so_dien_thoai, ma_nv], callback);
    },

    create: (data, callback) => {
        const { ho_ten, ngay_sinh, dia_chi, so_dien_thoai, email, anh_dai_dien, ma_tk, trang_thai, chuc_vu } = data;

        const sql = `INSERT INTO nhan_vien (ho_ten, ngay_sinh, dia_chi, so_dien_thoai, email, anh_dai_dien, ma_tk, trang_thai, chuc_vu)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(sql, [ho_ten, ngay_sinh, dia_chi, so_dien_thoai, email, anh_dai_dien, ma_tk, trang_thai, chuc_vu], callback);
    },

    update: (ma_nv, data, callback) => {
        const { ho_ten, ngay_sinh, dia_chi, so_dien_thoai, email, anh_dai_dien, ma_tk, trang_thai, chuc_vu } = data;

        const sql = `UPDATE nhan_vien 
                     SET ho_ten = ?, ngay_sinh = ?, dia_chi = ?, so_dien_thoai = ?, email = ?, anh_dai_dien = ?, ma_tk = ?, trang_thai = ?, chuc_vu = ?
                     WHERE ma_nv = ?`;

        db.query(sql, [ho_ten, ngay_sinh, dia_chi, so_dien_thoai, email, anh_dai_dien, ma_tk, trang_thai, chuc_vu, ma_nv], callback);
    },

    delete: (ma_nv, callback) => {
        const sql = "DELETE FROM nhan_vien WHERE ma_nv = ?";
        db.query(sql, [ma_nv], callback);
    }
};

module.exports = Employee;
