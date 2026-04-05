const db = require("../config/db");

const Invoice = {
  getAll: (search, page, limit, callback) => {
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];

    if (search) {
      conditions.push("(kh.ten_kh LIKE ? OR nv.ho_ten LIKE ? OR hd.ma_hd = ?)");
      params.push(`%${search}%`, `%${search}%`, parseInt(search) || 0);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
      SELECT hd.ma_hd, hd.ngay_lap, hd.tong_tien,
             hd.ma_kh, COALESCE(kh.ten_kh, 'Khách vãng lai') AS ten_kh,
             hd.ma_nv, COALESCE(nv.ho_ten, 'Hệ thống') AS ten_nv,
             (SELECT GROUP_CONCAT(DISTINCT p.ten_phim SEPARATOR ', ')
              FROM ve v
              JOIN suat_chieu sc ON v.ma_suat_chieu = sc.ma_suat_chieu
              JOIN phim p ON sc.ma_phim = p.ma_phim
              WHERE v.ma_hd = hd.ma_hd) AS ten_phim_list
      FROM hoa_don hd
      LEFT JOIN khach_hang kh ON hd.ma_kh = kh.ma_kh
      LEFT JOIN nhan_vien nv ON hd.ma_nv = nv.ma_nv
      ${where}
      ORDER BY hd.ma_hd DESC
      LIMIT ? OFFSET ?
    `;

    db.query(sql, [...params, parseInt(limit), offset], callback);
  },

  count: (search, callback) => {
    let conditions = [];
    let params = [];

    if (search) {
      conditions.push("(kh.ten_kh LIKE ? OR nv.ho_ten LIKE ? OR hd.ma_hd = ?)");
      params.push(`%${search}%`, `%${search}%`, parseInt(search) || 0);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
      SELECT COUNT(*) AS total
      FROM hoa_don hd
      LEFT JOIN khach_hang kh ON hd.ma_kh = kh.ma_kh
      LEFT JOIN nhan_vien nv ON hd.ma_nv = nv.ma_nv
      ${where}
    `;

    db.query(sql, params, callback);
  },

  // CHI TIẾT MỘT HÓA ĐƠN
  getById: (id, callback) => {
    const sql = `
      SELECT hd.ma_hd, hd.ngay_lap, hd.tong_tien,
             COALESCE(kh.ten_kh, 'Khách vãng lai') as ten_kh, 
             COALESCE(kh.email, 'Không có') as email_kh, 
             COALESCE(kh.so_dien_thoai, 'Không có') as so_dien_thoai,
             COALESCE(nv.ho_ten, 'Hệ thống') as ten_nv
      FROM hoa_don hd
      LEFT JOIN khach_hang kh ON hd.ma_kh = kh.ma_kh
      LEFT JOIN nhan_vien nv ON hd.ma_nv = nv.ma_nv
      WHERE hd.ma_hd = ?
    `;
    db.query(sql, [id], callback);
  },

  // DANH SÁCH VÉ THEO HÓA ĐƠN
  getTicketsByInvoice: (id, callback) => {
    const sql = `
      SELECT v.ma_ve, v.gia_ve, v.trang_thai,
             g.so_ghe, g.loai_ghe,
             sc.ngay_chieu, sc.gio_chieu,
             p.ten_phim,
             pc.ten_phong
      FROM ve v
      JOIN ghe g ON v.ma_ghe = g.ma_ghe
      JOIN suat_chieu sc ON v.ma_suat_chieu = sc.ma_suat_chieu
      JOIN phim p ON sc.ma_phim = p.ma_phim
      JOIN phong_chieu pc ON sc.ma_phong = pc.ma_phong
      WHERE v.ma_hd = ?
    `;
    db.query(sql, [id], callback);
  },

  // DANH SÁCH SẢN PHẨM THEO HÓA ĐƠN
  getProductsByInvoice: (id, callback) => {
    const sql = `
      SELECT ct.ma_ct, ct.so_luong, ct.don_gia,
             sp.ten_sp, sp.loai_sp
      FROM chi_tiet_hoa_don_sp ct
      JOIN san_pham sp ON ct.ma_sp = sp.ma_sp
      WHERE ct.ma_hd = ?
    `;
    db.query(sql, [id], callback);
  },

  // CẬP NHẬT HÓA ĐƠN (đơn giản, không tính điểm - giữ lại để tương thích)
  update: (id, data, callback) => {
    const { ma_kh, ma_nv, tong_tien } = data;
    const sql = `
      UPDATE hoa_don
      SET ma_kh = ?, ma_nv = ?, tong_tien = ?
      WHERE ma_hd = ?
    `;
    db.query(sql, [ma_kh || null, ma_nv || null, tong_tien, id], callback);
  },

  // THÊM HÓA ĐƠN
  create: (data, callback) => {
    const { ma_kh, ma_nv, tong_tien } = data;
    const sql = `
      INSERT INTO hoa_don (ma_kh, ma_nv, tong_tien)
      VALUES (?, ?, ?)
    `;
    db.query(sql, [ma_kh, ma_nv, tong_tien], callback);
  },

  // XÓA HÓA ĐƠN
  delete: (id, callback) => {
    db.query("DELETE FROM hoa_don WHERE ma_hd = ?", [id], callback);
  },
};

module.exports = Invoice;