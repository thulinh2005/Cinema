const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
    const { ten_dang_nhap, mat_khau } = req.body;

    const sql = `
    SELECT * FROM tai_khoan
    WHERE ten_dang_nhap = ?
      AND trang_thai = 1
  `;

    db.query(sql, [ten_dang_nhap], async (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi server" });

        if (result.length === 0) {
            return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);

        if (!isMatch) {
            return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
        }

        // Tạo token
        const token = jwt.sign(
            {
                ma_tk: user.ma_tk,
                vai_tro: user.vai_tro
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );

        res.json({
            message: "Đăng nhập thành công",
            token,
            user: {
                ma_tk: user.ma_tk,
                ten_dang_nhap: user.ten_dang_nhap,
                vai_tro: user.vai_tro
            }
        });
    });
};