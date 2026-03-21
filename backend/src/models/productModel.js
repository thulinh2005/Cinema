const db = require("../config/db");

const Product = {

    getAll: (search, callback) => {

        let sql = "SELECT * FROM san_pham";
        let params = [];

        if (search) {
            sql += " WHERE ten_sp LIKE ?";
            params.push(`%${search}%`);
        }

        db.query(sql, params, callback);
    },

    create: (data, callback) => {

        const sql = `
        INSERT INTO san_pham
        (ten_sp, loai_sp, gia_ban, anh_san_pham, trang_thai)
        VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            data.ten_sp,
            data.loai_sp,
            data.gia_ban,
            data.anh_san_pham,
            data.trang_thai
        ], callback);
    },

    update: (id, data, callback) => {

        const sql = `
        UPDATE san_pham
        SET ten_sp=?, loai_sp=?, gia_ban=?, anh_san_pham=?, trang_thai=?
        WHERE ma_sp=?
        `;

        db.query(sql, [
            data.ten_sp,
            data.loai_sp,
            data.gia_ban,
            data.anh_san_pham,
            data.trang_thai,
            id
        ], callback);
    },

    delete: (id, callback) => {

        const sql = "DELETE FROM san_pham WHERE ma_sp=?";

        db.query(sql, [id], callback);
    }

};

module.exports = Product;