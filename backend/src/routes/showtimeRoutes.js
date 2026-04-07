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

router.get("/dropdown-data", verifyToken, getDropdownData);
router.get("/", verifyToken, getShowtime);
router.get("/detail/:id", verifyToken, getByIdShowtime);
router.post("/", verifyToken, createShowtime);
router.put("/:id", verifyToken, updateShowtime);
router.delete("/:id", verifyToken, deleteShowtime);
router.put("/auto-update/status", verifyToken, updateStatusShowtime);
router.get("/:id/available-seats", verifyToken, getAvailableSeatsShowtime);

module.exports = router;
