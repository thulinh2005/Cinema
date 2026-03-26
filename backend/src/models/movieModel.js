const db = require("../config/db");

const Movie = {
  // LẤY DANH SÁCH + SEARCH + FILTER + PAGINATION
  getAll: (search, page, limit, the_loai, tinh_trang, do_tuoi_gioi_han, nuoc_san_xuat, callback) => {
    let sql = "SELECT ma_phim, ten_phim, the_loai, thoi_luong, ngay_khoi_chieu, mo_ta, anh_poster, link_trailer, do_tuoi_gioi_han, nuoc_san_xuat, tinh_trang FROM phim WHERE 1=1";
    let params = [];

    if (search) {
      sql += " AND ten_phim LIKE ?";
      params.push(`%${search}%`);
    }

    if (the_loai) {
      sql += " AND the_loai = ?";
      params.push(the_loai);
    }

    if (tinh_trang) {
      sql += " AND tinh_trang = ?";
      params.push(tinh_trang);
    }

    if (do_tuoi_gioi_han) {
      sql += " AND do_tuoi_gioi_han = ?";
      params.push(do_tuoi_gioi_han);
    }

    if (nuoc_san_xuat) {
      sql += " AND nuoc_san_xuat = ?";
      params.push(nuoc_san_xuat);
    }

    const offset = (page - 1) * limit;
    sql += " ORDER BY ngay_khoi_chieu DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    db.query(sql, params, callback);
  },

  // ĐẾM TỔNG
  count: (search, the_loai, tinh_trang, do_tuoi_gioi_han, nuoc_san_xuat, callback) => {
    let sql = "SELECT COUNT(*) AS total FROM phim WHERE 1=1";
    let params = [];

    if (search) {
      sql += " AND ten_phim LIKE ?";
      params.push(`%${search}%`);
    }

    if (the_loai) {
      sql += " AND the_loai = ?";
      params.push(the_loai);
    }

    if (tinh_trang) {
      sql += " AND tinh_trang = ?";
      params.push(tinh_trang);
    }

    if (do_tuoi_gioi_han) {
      sql += " AND do_tuoi_gioi_han = ?";
      params.push(do_tuoi_gioi_han);
    }

    if (nuoc_san_xuat) {
      sql += " AND nuoc_san_xuat = ?";
      params.push(nuoc_san_xuat);
    }

    db.query(sql, params, callback);
  },

  // THÊM PHIM
  create: (data, callback) => {
    const sql = `
      INSERT INTO phim
      (ten_phim, the_loai, thoi_luong, ngay_khoi_chieu, mo_ta, anh_poster, link_trailer, do_tuoi_gioi_han, nuoc_san_xuat, tinh_trang)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

  // CẬP NHẬT PHIM
  update: (id, data, callback) => {
    const sql = `
      UPDATE phim
      SET ten_phim=?, the_loai=?, thoi_luong=?, ngay_khoi_chieu=?, mo_ta=?, anh_poster=?, link_trailer=?, do_tuoi_gioi_han=?, nuoc_san_xuat=?, tinh_trang=?
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

  // XÓA PHIM
  delete: (id, callback) => {
    const sql = "DELETE FROM phim WHERE ma_phim=?";
    db.query(sql, [id], callback);
  },

  // CHI TIẾT PHIM
  getById: (id, callback) => {
    const sql = "SELECT ma_phim, ten_phim, the_loai, thoi_luong, ngay_khoi_chieu, mo_ta, anh_poster, link_trailer, do_tuoi_gioi_han, nuoc_san_xuat, tinh_trang FROM phim WHERE ma_phim = ?";
    db.query(sql, [id], callback);
  },

  // KIỂM TRA TRÙNG TÊN PHIM
  checkDuplicateTitle: (ten_phim, excludeId, callback) => {
    let sql = "SELECT COUNT(*) AS count FROM phim WHERE LOWER(ten_phim) = LOWER(?)";
    let params = [ten_phim];
    
    if (excludeId) {
      sql += " AND ma_phim != ?";
      params.push(excludeId);
    }
    
    db.query(sql, params, (err, result) => {
      if (err) {
        console.error("checkDuplicateTitle error:", err);
        return callback(err);
      }
      console.log("checkDuplicateTitle result:", result);
      callback(err, result);
    });
  }
};

module.exports = Movie;