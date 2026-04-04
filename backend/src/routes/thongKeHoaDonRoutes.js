const express = require("express");
const router = express.Router();
const thongKeHoaDonController = require("../controllers/thongKeHoaDonController");

router.get("/tong-quan", thongKeHoaDonController.getOverview);
router.get("/doanh-thu-thoi-gian", thongKeHoaDonController.getRevenueByTime);

module.exports = router;
