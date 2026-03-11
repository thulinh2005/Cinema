const express = require("express");
const router = express.Router();

const suatchieuController = require("../controllers/suatchieuController");

router.get("/suatchieu", suatchieuController.getSuatChieu);

module.exports = router;