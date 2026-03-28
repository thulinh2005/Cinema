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

// CẬP NHẬT
router.put("/:id", updateInvoice);

// XÓA
router.delete("/:id", deleteInvoice);

module.exports = router;
