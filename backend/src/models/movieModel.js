const db = require("../config/db");

const Movie = {

    getAll: (search, callback) => {

        let sql = "SELECT * FROM phim";
        let params = [];

        if (search) {
            sql += " WHERE ten_phim LIKE ?";
            params.push(`%${search}%`);
        }

        db.query(sql, params, callback);
    },

    create: (data, callback) => {

        const sql = `
        INSERT INTO phim
        (ten_phim,the_loai,thoi_luong,ngay_khoi_chieu,mo_ta,anh_poster,link_trailer,do_tuoi_gioi_han,nuoc_san_xuat,tinh_trang)
        VALUES (?,?,?,?,?,?,?,?,?,?)
        `;

        db.query(sql, [
            data.ten_phim,
            data.the_loai,
            data.thoi_luong,
            data.ngay_khoi_chieu,
            data.mo_ta,
            data.anh_poster,
            data.link_trailer,
            data.do_tuoi_gioi_han,
            data.nuoc_san_xuat,
            data.tinh_trang
        ], callback);
    },

    update: (id, data, callback) => {

        const sql = `
        UPDATE phim
        SET ten_phim=?,the_loai=?,thoi_luong=?,ngay_khoi_chieu=?,mo_ta=?,anh_poster=?,link_trailer=?,do_tuoi_gioi_han=?,nuoc_san_xuat=?,tinh_trang=?
        WHERE ma_phim=?
        `;

        db.query(sql, [
            data.ten_phim,
            data.the_loai,
            data.thoi_luong,
            data.ngay_khoi_chieu,
            data.mo_ta,
            data.anh_poster,
            data.link_trailer,
            data.do_tuoi_gioi_han,
            data.nuoc_san_xuat,
            data.tinh_trang,
            id
        ], callback);
    },

    delete: (id, callback) => {

        const sql = "DELETE FROM phim WHERE ma_phim=?";

        db.query(sql, [id], callback);
    }

};

module.exports = Movie;