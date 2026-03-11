const express = require("express");
const router = express.Router();

const { getDanhSachPhim } = require("../controllers/phimController");

router.get("/phim", getDanhSachPhim);

module.exports = router;