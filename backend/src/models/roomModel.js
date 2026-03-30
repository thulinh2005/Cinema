const db = require("../config/db");

const Room = {
    getAll: (search, callback) => {
        let sql = "SELECT * FROM phong_chieu";
        let params = [];
        if (search && search.toString().trim() !== "") {
            sql += " WHERE ten_phong LIKE ?";
            params.push(`%${search.toString().trim()}%`);
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
        const sql = `
            SELECT g.ma_ghe, g.ma_phong, g.hang, g.cot, g.so_ghe, g.loai_ghe, 
                   g.trang_thai, g.has_aisle, g.has_aisle_horizontal, p.ten_phong 
            FROM ghe g 
            JOIN phong_chieu p ON g.ma_phong = p.ma_phong 
            WHERE g.ma_phong = ? 
            ORDER BY g.hang ASC, g.cot ASC
        `;
        db.query(sql, [roomId], callback);
    },
    // CHỈ GIỮ 1 HÀM NÀY VÀ PHẢI CÓ ĐỦ 8 CỘT
    createSeatsBulk: (seatData, callback) => {
        const sql = "INSERT INTO ghe (ma_phong, hang, cot, so_ghe, loai_ghe, trang_thai, has_aisle, has_aisle_horizontal) VALUES ?";
        db.query(sql, [seatData], callback);
    },
    updateSeatCount: (roomId, count, callback) => {
        const sql = "UPDATE phong_chieu SET so_ghe = ? WHERE ma_phong = ?";
        db.query(sql, [count, roomId], callback);
    }
};

module.exports = Room;