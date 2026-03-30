const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");

const {
  getShowtime,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  getByIdShowtime,
  updateStatusShowtime,
  getAvailableSeatsShowtime,
  getDropdownData,
} = require("../controllers/showtimeController");

// LẤY DỮ LIỆU CÁC DROP DOWNS (PHIM VÀ PHÒNG)
router.get("/dropdown-data", verifyToken, getDropdownData);

// DANH SÁCH + FILTER + PAGINATION
router.get("/", verifyToken, getShowtime);

// CHI TIẾT (tránh conflict)
router.get("/detail/:id", verifyToken, getByIdShowtime);

// THÊM
router.post("/", verifyToken, createShowtime);

// SỬA
router.put("/:id", verifyToken, updateShowtime);

// XÓA
router.delete("/:id", verifyToken, deleteShowtime);

// TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI
router.put("/auto-update/status", verifyToken, updateStatusShowtime);

// KIỂM TRA GHẾ TRỐNG
router.get("/:id/available-seats", verifyToken, getAvailableSeatsShowtime);

module.exports = router;
