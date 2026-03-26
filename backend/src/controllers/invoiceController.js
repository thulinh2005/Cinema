const Invoice = require("../models/invoiceModel");

// LẤY DANH SÁCH (filter + pagination)
exports.getInvoices = (req, res) => {
  const {
    search = "",
    page = 1,
    limit = 8,
  } = req.query;

  Invoice.count(search, (err, countResult) => {
    if (err) return res.status(500).json({ message: "Lỗi server", err });

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    Invoice.getAll(search, page, limit, (err, data) => {
      if (err) return res.status(500).json({ message: "Lỗi server", err });

      res.json({
        data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      });
    });
  });
};

// CHI TIẾT HÓA ĐƠN (bao gồm vé + sản phẩm)
exports.getInvoiceById = (req, res) => {
  const { id } = req.params;

  Invoice.getById(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", err });
    if (!result || result.length === 0)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    const invoice = result[0];

    // Lấy vé
    Invoice.getTicketsByInvoice(id, (err, tickets) => {
      if (err) return res.status(500).json({ message: "Lỗi server", err });

      // Lấy sản phẩm
      Invoice.getProductsByInvoice(id, (err, products) => {
        if (err) return res.status(500).json({ message: "Lỗi server", err });

        res.json({ ...invoice, tickets, products });
      });
    });
  });
};

// CẬP NHẬT HÓA ĐƠN
exports.updateInvoice = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  Invoice.update(id, data, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    res.json({ message: "Cập nhật hóa đơn thành công" });
  });
};

// XÓA HÓA ĐƠN
exports.deleteInvoice = (req, res) => {
  const { id } = req.params;

  Invoice.delete(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    res.json({ message: "Xóa hóa đơn thành công" });
  });
};
