const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const verifyToken = require("../middlewares/verifyToken");

router.post("/login", authController.login);

router.get("/profile", verifyToken, (req, res) => {
    res.json({
        message: "Token hợp lệ",
        user: req.user
    });
});

router.get("/admin", verifyToken, (req, res) => {
    if (req.user.vai_tro !== "QUAN_LY") {
        return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    res.json({ message: "Chào quản lý" });
});

module.exports = router;