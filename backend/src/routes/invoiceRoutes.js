const express = require("express");
const router = express.Router();

const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoiceController");

// DANH SÁCH + FILTER + PAGINATION
router.get("/", getInvoices);

// CHI TIẾT
router.get("/:id", getInvoiceById);

// THÊM MỚI (tự động tích điểm 5%)
router.post("/", createInvoice);

// CẬP NHẬT
router.put("/:id", updateInvoice);

// XÓA
router.delete("/:id", deleteInvoice);

module.exports = router;
