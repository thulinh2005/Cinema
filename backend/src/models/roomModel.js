const db = require("../config/db");

const Room = {
    getAll: (search, callback) => {
        let sql = "SELECT * FROM phong_chieu";
        let params = [];
        if (search) {
            sql += " WHERE ten_phong LIKE ?";
            params.push(`%${search}%`);
        }
        db.query(sql, params, callback);
    },

    create: (data, callback) => {
        const sql = "INSERT INTO phong_chieu (ten_phong, so_ghe, loai_phong, trang_thai) VALUES (?, ?, ?, ?)";
        db.query(sql, [data.ten_phong, data.so_ghe, data.loai_phong, data.trang_thai], callback);
    },

    update: (id, data, callback) => {
        const sql = "UPDATE phong_chieu SET ten_phong = ?, loai_phong = ?, trang_thai = ? WHERE ma_phong = ?";
        db.query(sql, [data.ten_phong, data.loai_phong, data.trang_thai, id], callback);
    },

    delete: (id, callback) => {
        const sql = "DELETE FROM phong_chieu WHERE ma_phong = ?";
        db.query(sql, [id], callback);
    },

    getSeats: (roomId, callback) => {
        const sql = "SELECT * FROM ghe WHERE ma_phong = ? ORDER BY so_ghe ASC";
        db.query(sql, [roomId], callback);
    },

    createSeatsBulk: (seatData, callback) => {
        const sql = "INSERT INTO ghe (ma_phong, so_ghe, loai_ghe, trang_thai) VALUES ?";
        db.query(sql, [seatData], callback);
    }
};

module.exports = Room;