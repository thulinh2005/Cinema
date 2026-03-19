const express = require("express");
const router = express.Router();

const {
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getByIdCustomer,
} = require("../controllers/customerController");

// DANH SÁCH + SEARCH + PAGINATION
router.get("/", getCustomer);

// CHI TIẾT (tránh conflict)
router.get("/detail/:id", getByIdCustomer);

// THÊM
router.post("/", createCustomer);

// SỬA
router.put("/:id", updateCustomer);

// XÓA
router.delete("/:id", deleteCustomer);

module.exports = router;