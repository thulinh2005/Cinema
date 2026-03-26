const express = require("express");
const router = express.Router();

const {
  getShowtime,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  getByIdShowtime,
  updateStatusShowtime,
  getAvailableSeatsShowtime,
} = require("../controllers/showtimeController");

// DANH SÁCH + FILTER + PAGINATION
router.get("/", getShowtime);

// CHI TIẾT (tránh conflict)
router.get("/detail/:id", getByIdShowtime);

// THÊM
router.post("/", createShowtime);

// SỬA
router.put("/:id", updateShowtime);

// XÓA
router.delete("/:id", deleteShowtime);

// TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI
router.put("/auto-update/status", updateStatusShowtime);

// KIỂM TRA GHẾ TRỐNG
router.get("/:id/available-seats", getAvailableSeatsShowtime);

module.exports = router;
