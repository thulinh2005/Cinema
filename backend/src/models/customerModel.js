const db = require("../config/db");

const Customer = {
  // LẤY DANH SÁCH + SEARCH + FILTER + PAGINATION
  getAll: (search, page, limit, trang_thai, hang_thanh_vien, callback) => {
    let sql = "SELECT * FROM khach_hang WHERE 1=1";
    let params = [];

    if (search) {
      sql += " AND (ten_kh LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (trang_thai) {
      sql += " AND trang_thai = ?";
      params.push(trang_thai);
    }

    if (hang_thanh_vien) {
      sql += " AND hang_thanh_vien = ?";
      params.push(hang_thanh_vien);
    }

    const offset = (page - 1) * limit;
    sql += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    db.query(sql, params, callback);
  },

  // ĐẾM TỔNG
  count: (search, trang_thai, hang_thanh_vien, callback) => {
    let sql = "SELECT COUNT(*) AS total FROM khach_hang WHERE 1=1";
    let params = [];

    if (search) {
      sql += " AND (ten_kh LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (trang_thai) {
      sql += " AND trang_thai = ?";
      params.push(trang_thai);
    }

    if (hang_thanh_vien) {
      sql += " AND hang_thanh_vien = ?";
      params.push(hang_thanh_vien);
    }

    db.query(sql, params, callback);
  },

  // THÊM KHÁCH HÀNG
  create: (data, callback) => {
    const sql = `
      INSERT INTO khach_hang 
      (ten_kh, email, so_dien_thoai, mat_khau, ngay_sinh, gioi_tinh, dia_chi, hang_thanh_vien, diem_tich_luy, trang_thai) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        data.ten_kh,
        data.email,
        data.so_dien_thoai,
        data.mat_khau,
        data.ngay_sinh,
        data.gioi_tinh,
        data.dia_chi,
        data.hang_thanh_vien || "Standard",
        data.diem_tich_luy || 0,
        data.trang_thai || "Hoạt động",
      ],
      callback
    );
  },

  // CẬP NHẬT
  update: (id, data, callback) => {
    let sql = `
      UPDATE khach_hang SET 
      ten_kh = ?, 
      email = ?, 
      so_dien_thoai = ?, 
      ngay_sinh = ?, 
      gioi_tinh = ?, 
      dia_chi = ?, 
      hang_thanh_vien = ?, 
      trang_thai = ?
    `;

    let params = [
      data.ten_kh,
      data.email,
      data.so_dien_thoai,
      data.ngay_sinh,
      data.gioi_tinh,
      data.dia_chi,
      data.hang_thanh_vien,
      data.trang_thai,
    ];

    if (data.mat_khau) {
      sql += ", mat_khau = ?";
      params.push(data.mat_khau);
    }

    sql += " WHERE ma_kh = ?";
    params.push(id);

    db.query(sql, params, callback);
  },

  // HỦY TÀI KHOẢN (thay vì xóa)
  cancel: (id, callback) => {
    const sql = "UPDATE khach_hang SET trang_thai = ? WHERE ma_kh = ?";
    db.query(sql, ["Đã hủy", id], callback);
  },

  // CHI TIẾT
  getById: (id, callback) => {
    const sql = "SELECT * FROM khach_hang WHERE ma_kh = ?";
    db.query(sql, [id], callback);
  },
};

module.exports = Customer;