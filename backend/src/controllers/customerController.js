const Customer = require("../models/customerModel");
const bcrypt = require("bcryptjs");

// LẤY DANH SÁCH
exports.getCustomer = (req, res) => {
  const {
    search = "",
    page = 1,
    limit = 5,
    trang_thai = "",
    hang_thanh_vien = "",
  } = req.query;

  Customer.count(search, trang_thai, hang_thanh_vien, (err, countResult) => {
    if (err) return res.status(500).json({ message: "Lỗi server", err });

    const total = countResult[0].total;

    Customer.getAll(
      search,
      page,
      limit,
      trang_thai,
      hang_thanh_vien,
      (err, data) => {
        if (err) return res.status(500).json({ message: "Lỗi server", err });

        res.json({
          data,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        });
      }
    );
  });
};

// THÊM
exports.createCustomer = async (req, res) => {
  try {
    const data = req.body;

    if (!data.ten_kh || !data.email || !data.mat_khau) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
      });
    }

    data.mat_khau = await bcrypt.hash(data.mat_khau, 10);

    Customer.create(data, (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            message: "Email đã tồn tại",
          });
        }

        return res.status(500).json({ message: "Lỗi server", err });
      }

      res.status(201).json({
        message: "Thêm khách hàng thành công",
        id: result.insertId,
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", err });
  }
};

// SỬA
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.mat_khau) {
      data.mat_khau = await bcrypt.hash(data.mat_khau, 10);
    }

    Customer.update(id, data, (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi server", err });

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Không tìm thấy khách hàng",
        });
      }

      res.json({ message: "Cập nhật thành công" });
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", err });
  }
};

// HỦY TÀI KHOẢN (thay cho xóa cứng)
exports.deleteCustomer = (req, res) => {
  const { id } = req.params;

  Customer.cancel(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", err });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy khách hàng",
      });
    }

    res.json({ message: "Tài khoản đã được chuyển sang trạng thái Đã hủy" });
  });
};

// CHI TIẾT
exports.getByIdCustomer = (req, res) => {
  const { id } = req.params;

  Customer.getById(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", err });

    if (!result || result.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy khách hàng",
      });
    }

    res.json(result[0]);
  });
};