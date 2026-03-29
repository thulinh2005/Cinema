const productModel = require("../models/productModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cấu hình Multer để upload ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Tạo unique string từ timestamp và random
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const productController = {
    // Middleware upload ảnh
    uploadImage: upload.single("anh_san_pham"),

    // API: Lấy danh sách sản phẩm
    getAll: async (req, res) => {
        try {
            const { search = "", type = "", status = "", page = 1, limit = 10 } = req.query;
            const result = await productModel.getAllProducts({ search, type, status, page, limit });
            res.json({ success: true, data: result.products, total: result.total, totalPages: result.totalPages });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    },

    // API: Lấy chi tiết 1 sản phẩm
    getById: async (req, res) => {
        try {
            const id = req.params.id;
            const product = await productModel.getProductById(id);
            if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
            res.json({ success: true, data: product });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    },

    // API: Thêm sản phẩm
    create: async (req, res) => {
        try {
            let { ten_sp, loai_sp, gia_ban, trang_thai, combo_items } = req.body;
            let anh_san_pham = req.file ? `/uploads/${req.file.filename}` : null;

            // Chuyển combo_items từ chuỗi JSON sang array (vì data gửi qua FormData thường là string)
            if (typeof combo_items === "string") {
                try { combo_items = JSON.parse(combo_items); } catch (e) { combo_items = []; }
            }

            if (!ten_sp || String(ten_sp).trim() === "") {
                return res.status(400).json({ success: false, message: "Tên sản phẩm không được rỗng" });
            }
            if (!gia_ban || isNaN(gia_ban) || Number(gia_ban) < 1000) {
                return res.status(400).json({ success: false, message: "Giá bán phải >= 1000" });
            }

            // Validate cho Combo
            if (loai_sp === "Combo") {
                if (!combo_items || combo_items.length < 2) {
                    return res.status(400).json({ success: false, message: "Combo phải có ít nhất 2 sản phẩm" });
                }
            }

            const ma_sp = await productModel.createProduct({ ten_sp, loai_sp, gia_ban, anh_san_pham, trang_thai }, combo_items);
            res.json({ success: true, message: "Thêm sản phẩm thành công", data: ma_sp });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    },

    // API: Cập nhật sản phẩm
    update: async (req, res) => {
        try {
            const id = req.params.id;
            let { ten_sp, loai_sp, gia_ban, trang_thai, combo_items } = req.body;
            let anh_san_pham = req.file ? `/uploads/${req.file.filename}` : undefined; // undefined để ko cập nhật trường ảnh nếu ko gửi file

            if (typeof combo_items === "string") {
                try { combo_items = JSON.parse(combo_items); } catch (e) { combo_items = []; }
            }

            if (!ten_sp || String(ten_sp).trim() === "") {
                return res.status(400).json({ success: false, message: "Tên sản phẩm không được rỗng" });
            }
            if (!gia_ban || isNaN(gia_ban) || Number(gia_ban) < 1000) {
                return res.status(400).json({ success: false, message: "Giá bán phải >= 1000" });
            }

            if (loai_sp === "Combo") {
                if (!combo_items || combo_items.length < 2) {
                    return res.status(400).json({ success: false, message: "Combo phải có ít nhất 2 sản phẩm" });
                }
            }

            await productModel.updateProduct(id, { ten_sp, loai_sp, gia_ban, anh_san_pham, trang_thai }, combo_items);
            res.json({ success: true, message: "Cập nhật sản phẩm thành công" });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    },

    // API: Xóa sản phẩm
    delete: async (req, res) => {
        try {
            const id = req.params.id;
            await productModel.deleteProduct(id);
            res.json({ success: true, message: "Đã xóa sản phẩm" });
        } catch (error) {
            console.error(error);
            if (error.message && error.message.includes("Combo")) {
                return res.status(400).json({ success: false, message: error.message });
            }
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    },

    // API: Lấy sản phẩm lẻ để chọn đưa vào combo
    getSingles: async (req, res) => {
        try {
            const items = await productModel.getSingleProducts();
            res.json({ success: true, data: items });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    }
};

module.exports = productController;
