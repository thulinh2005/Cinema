const db = require("../config/db");

const Employee = {

    getAll: (search, callback) => {

        let sql = `
            SELECT nv.*, tk.ten_dang_nhap 
            FROM nhan_vien nv
            LEFT JOIN tai_khoan tk ON nv.ma_tk = tk.ma_tk
        `;

        let params = [];

        if (search) {
            sql += " WHERE nv.ho_ten LIKE ?";
            params.push(`%${search}%`);
        }

        db.query(sql, params, callback);
    },

    create: (data, callback) => {

        const sql = `
            INSERT INTO nhan_vien
            (ho_ten, ngay_sinh, dia_chi, so_dien_thoai, email, anh_dai_dien, ma_tk)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            data.ho_ten,
            data.ngay_sinh,
            data.dia_chi,
            data.so_dien_thoai,
            data.email,
            data.anh_dai_dien,
            data.ma_tk
        ], callback);
    },

    update: (id, data, callback) => {

        const sql = `
            UPDATE nhan_vien
            SET ho_ten=?, ngay_sinh=?, dia_chi=?, so_dien_thoai=?, email=?
            WHERE ma_nv=?
        `;

        db.query(sql, [
            data.ho_ten,
            data.ngay_sinh,
            data.dia_chi,
            data.so_dien_thoai,
            data.email,
            id
        ], callback);
    },

    delete: (id, callback) => {

        const sql = "DELETE FROM nhan_vien WHERE ma_nv=?";

        db.query(sql, [id], callback);
    }

};

module.exports = Employee;