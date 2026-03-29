const db = require("../config/db");

const Movie = {
    getAll: (search, searchField, page, limit, the_loai, tinh_trang, do_tuoi_gioi_han, nuoc_san_xuat, callback) => {
        let sql = "SELECT * FROM phim WHERE 1=1";
        let params = [];
        const offset = (page - 1) * limit;

        if (search) {
            const allowedFields = ["ten_phim", "the_loai", "nuoc_san_xuat", "ngay_khoi_chieu", "tinh_trang", "do_tuoi_gioi_han", "mo_ta"];
            const field = allowedFields.includes(searchField) ? searchField : "ten_phim";
            
            if (field === "ngay_khoi_chieu") {
                sql += ` AND ngay_khoi_chieu LIKE ?`;
                params.push(`%${search}%`);
            } else {
                sql += ` AND ${field} LIKE ?`;
                params.push(`%${search}%`);
            }
        }
        if (the_loai) { sql += " AND the_loai = ?"; params.push(the_loai); }
        if (tinh_trang) { sql += " AND tinh_trang = ?"; params.push(tinh_trang); }
        if (do_tuoi_gioi_han) { sql += " AND do_tuoi_gioi_han = ?"; params.push(do_tuoi_gioi_han); }
        if (nuoc_san_xuat) { sql += " AND nuoc_san_xuat = ?"; params.push(nuoc_san_xuat); }

        sql += " ORDER BY ma_phim DESC LIMIT ? OFFSET ?";
        params.push(parseInt(limit), parseInt(offset));

        db.query(sql, params, callback); // Dùng db.query với callback
    },

    count: (search, searchField, the_loai, tinh_trang, do_tuoi_gioi_han, nuoc_san_xuat, callback) => {
        let sql = "SELECT COUNT(*) AS total FROM phim WHERE 1=1";
        let params = [];

        if (search) {
            const allowedFields = ["ten_phim", "the_loai", "nuoc_san_xuat", "ngay_khoi_chieu", "tinh_trang", "do_tuoi_gioi_han", "mo_ta"];
            const field = allowedFields.includes(searchField) ? searchField : "ten_phim";
            
            if (field === "ngay_khoi_chieu") {
                sql += ` AND (DATE_FORMAT(ngay_khoi_chieu, '%Y-%m-%d') LIKE ? OR DATE_FORMAT(ngay_khoi_chieu, '%d/%m/%Y') LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            } else {
                sql += ` AND ${field} LIKE ?`;
                params.push(`%${search}%`);
            }
        }
        if (the_loai) { sql += " AND the_loai = ?"; params.push(the_loai); }
        if (tinh_trang) { sql += " AND tinh_trang = ?"; params.push(tinh_trang); }
        if (do_tuoi_gioi_han) { sql += " AND do_tuoi_gioi_han = ?"; params.push(do_tuoi_gioi_han); }
        if (nuoc_san_xuat) { sql += " AND nuoc_san_xuat = ?"; params.push(nuoc_san_xuat); }

        db.query(sql, params, callback);
    },

    getAllNames: (callback) => {
        // Chỉ lấy ma_phim và ten_phim để load cho nhanh
        const sql = "SELECT ma_phim, ten_phim FROM phim WHERE tinh_trang != 'Ngừng chiếu'";
        db.query(sql, callback);
    },

    getById: (ma_phim, callback) => {
        const sql = "SELECT * FROM phim WHERE ma_phim = ?";
        db.query(sql, [ma_phim], callback);
    },

    create: (data, callback) => {
        const sql = `INSERT INTO phim (ten_phim, the_loai, thoi_luong, ngay_khoi_chieu, mo_ta, anh_poster, link_trailer, do_tuoi_gioi_han, nuoc_san_xuat, tinh_trang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [
            data.ten_phim, data.the_loai, data.thoi_luong, data.ngay_khoi_chieu,
            data.mo_ta, data.anh_poster, data.link_trailer, data.do_tuoi_gioi_han,
            data.nuoc_san_xuat, data.tinh_trang
        ], callback);
    },

    update: (ma_phim, data, callback) => {
        const sql = `UPDATE phim SET 
          ten_phim = COALESCE(?, ten_phim), the_loai = COALESCE(?, the_loai), 
          thoi_luong = COALESCE(?, thoi_luong), ngay_khoi_chieu = COALESCE(?, ngay_khoi_chieu), 
          mo_ta = COALESCE(?, mo_ta), anh_poster = COALESCE(?, anh_poster), 
          link_trailer = COALESCE(?, link_trailer), do_tuoi_gioi_han = COALESCE(?, do_tuoi_gioi_han), 
          nuoc_san_xuat = COALESCE(?, nuoc_san_xuat), tinh_trang = COALESCE(?, tinh_trang) 
          WHERE ma_phim = ?`;

        db.query(sql, [
            data.ten_phim || null, data.the_loai || null, data.thoi_luong || null,
            data.ngay_khoi_chieu || null, data.mo_ta || null, data.anh_poster || null,
            data.link_trailer || null, data.do_tuoi_gioi_han || null,
            data.nuoc_san_xuat || null, data.tinh_trang || null, ma_phim
        ], callback);
    },

    delete: (ma_phim, callback) => {
        const sql = "DELETE FROM phim WHERE ma_phim = ?";
        db.query(sql, [ma_phim], callback);
    },

    getReferencedShowtimes: (ma_phim, callback) => {
        const sql = "SELECT COUNT(*) as count FROM suat_chieu WHERE ma_phim = ?";
        db.query(sql, [ma_phim], (err, result) => {
            if (err) {
                console.error('Error checking showtimes:', err);
                callback(err, 0);
            } else {
                callback(null, result[0].count);
            }
        });
    }
};

module.exports = Movie;

