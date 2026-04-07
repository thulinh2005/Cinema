const db = require("../config/db");

const Showtime = {
  getAll: (page, limit, ngay_chieu, trang_thai, ma_phong, callback) => {
    let sql = `
      SELECT sc.ma_suat_chieu, sc.ma_phim, sc.ma_phong, 
        DATE_FORMAT(sc.ngay_chieu, '%Y-%m-%d') as ngay_chieu, 
        sc.gio_chieu, sc.gio_ket_thuc, sc.trang_thai, 
        p.ten_phim, pc.ten_phong,
        pc.so_ghe AS tong_ghe,
        (SELECT COUNT(*) FROM ve v WHERE v.ma_suat_chieu = sc.ma_suat_chieu) AS ghe_da_dat
      FROM suat_chieu sc
      JOIN phim p ON sc.ma_phim = p.ma_phim
      JOIN phong_chieu pc ON sc.ma_phong = pc.ma_phong
      WHERE 1=1
    `;
    let params = [];

    if (ngay_chieu && ngay_chieu !== "") {
      sql += " AND DATE(sc.ngay_chieu) = ?";
      params.push(ngay_chieu);
    }

    if (trang_thai && trang_thai !== "") {
      sql += " AND sc.trang_thai = ?";
      params.push(trang_thai);
    }

    if (ma_phong && ma_phong !== "") {
      sql += " AND sc.ma_phong = ?";
      params.push(ma_phong);
    }

    const validPage = parseInt(page) || 1;
    const validLimit = parseInt(limit) || 10;
    const offset = (validPage - 1) * validLimit;

    sql += " ORDER BY sc.ngay_chieu ASC, sc.gio_chieu ASC LIMIT ? OFFSET ?";
    params.push(validLimit, offset);

    db.query(sql, params, callback);
  },

  count: (ngay_chieu, trang_thai, ma_phong, callback) => {
    let sql = `
      SELECT COUNT(*) AS total FROM suat_chieu
      WHERE 1=1
    `;
    let params = [];

    if (ngay_chieu) {
      sql += " AND DATE(ngay_chieu) = ?";
      params.push(ngay_chieu);
    }

    if (trang_thai) {
      sql += " AND trang_thai = ?";
      params.push(trang_thai);
    }

    if (ma_phong) {
      sql += " AND ma_phong = ?";
      params.push(ma_phong);
    }

    db.query(sql, params, callback);
  },

  // THÊM SUẤT CHIẾU
  create: (data, callback) => {
    const sql = `
      INSERT INTO suat_chieu
      (ma_phim, ma_phong, ngay_chieu, gio_chieu, gio_ket_thuc, trang_thai)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        data.ma_phim,
        data.ma_phong,
        data.ngay_chieu,
        data.gio_chieu,
        data.gio_ket_thuc,
        data.trang_thai || "Chưa chiếu"
      ],
      callback
    );
  },

  // CẬP NHẬT SUẤT CHIẾU
  update: (id, data, callback) => {
    const sql = `
      UPDATE suat_chieu
      SET ma_phim=?, ma_phong=?, ngay_chieu=?, gio_chieu=?, gio_ket_thuc=?, trang_thai=?
      WHERE ma_suat_chieu=?
    `;

    db.query(
      sql,
      [
        data.ma_phim,
        data.ma_phong,
        data.ngay_chieu,
        data.gio_chieu,
        data.gio_ket_thuc,
        data.trang_thai,
        id
      ],
      callback
    );
  },

  // XÓA SUẤT CHIẾU
  delete: (id, callback) => {
    const sql = "DELETE FROM suat_chieu WHERE ma_suat_chieu=?";
    db.query(sql, [id], callback);
  },

  // CHI TIẾT SUẤT CHIẾU
  getById: (id, callback) => {
    const sql = `
      SELECT sc.ma_suat_chieu, sc.ma_phim, sc.ma_phong, 
        DATE_FORMAT(sc.ngay_chieu, '%Y-%m-%d') as ngay_chieu, 
        sc.gio_chieu, sc.gio_ket_thuc, sc.trang_thai, 
        p.ten_phim, pc.ten_phong
      FROM suat_chieu sc
      JOIN phim p ON sc.ma_phim = p.ma_phim
      JOIN phong_chieu pc ON sc.ma_phong = pc.ma_phong
      WHERE sc.ma_suat_chieu = ?
    `;
    db.query(sql, [id], callback);
  },

  // TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI
  updateStatusAuto: (callback) => {
    const sql = `
      UPDATE suat_chieu
      SET trang_thai = CASE
        WHEN CONCAT(ngay_chieu, ' ', gio_ket_thuc) < NOW() THEN 'Đã chiếu'
        WHEN CONCAT(ngay_chieu, ' ', gio_chieu) <= NOW() 
          AND CONCAT(ngay_chieu, ' ', gio_ket_thuc) >= NOW() THEN 'Đang chiếu'
        ELSE 'Chưa chiếu'
      END
      WHERE 1=1
    `;
    db.query(sql, callback);
  },

  // KIỂM TRA GHẾ TRỐNG
  getAvailableSeats: (showtimeId, callback) => {
    const sql = `
      SELECT 
        pc.so_ghe AS tong_ghe,
        COALESCE(COUNT(v.ma_ve), 0) AS ghe_da_dat,
        pc.so_ghe - COALESCE(COUNT(v.ma_ve), 0) AS ghe_trong
      FROM suat_chieu sc
      LEFT JOIN phong_chieu pc ON sc.ma_phong = pc.ma_phong
      LEFT JOIN ve v ON sc.ma_suat_chieu = v.ma_suat_chieu
      WHERE sc.ma_suat_chieu = ?
      GROUP BY sc.ma_suat_chieu, pc.so_ghe
    `;
    db.query(sql, [showtimeId], callback);
  }
};

module.exports = Showtime;