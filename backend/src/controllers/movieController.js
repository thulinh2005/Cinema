const Movie = require("../models/movieModel"); 

// Helper function format ngay_khoi_chieu
const formatMovieDate = (movie) => {
    if (!movie) return null;
    return {
        ...movie,
        ngay_khoi_chieu: movie.ngay_khoi_chieu instanceof Date 
            ? movie.ngay_khoi_chieu.toISOString().split('T')[0]
            : movie.ngay_khoi_chieu
    };
};

// VALIDATION HELPER
const validateMovieData = (data, isUpdate = false) => {
    const fields = ["ten_phim", "the_loai", "mo_ta", "anh_poster", "link_trailer", "do_tuoi_gioi_han", "nuoc_san_xuat", "tinh_trang", "thoi_luong", "ngay_khoi_chieu"];
    
    // Trim dữ liệu nếu có
    fields.forEach(field => {
        if (data[field]) data[field] = String(data[field]).trim();
    });

    // 1. CHỈ CHECK TRỐNG TẤT CẢ KHI THÊM MỚI (isUpdate = false)
    if (!isUpdate) {
        for (let field of fields) {
            if (!data[field]) {
                return {
                    error: true,
                    status: 400,
                    response: { success: false, message: `Trường ${field} không được để trống khi thêm mới.` }
                };
            }
        }
    }

    // 2. VALIDATE ĐỊNH DẠNG (Dùng cho cả Thêm và Sửa - nhưng chỉ check khi TRƯỜNG ĐÓ có dữ liệu gửi lên)
    if (data.ngay_khoi_chieu) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(data.ngay_khoi_chieu)) {
            return { error: true, status: 400, response: { success: false, message: "Ngày khởi chiếu phải có định dạng YYYY-MM-DD" } };
        }
    }

    if (data.thoi_luong) {
        const thoi_luong = Number(data.thoi_luong);
        if (isNaN(thoi_luong) || thoi_luong <= 0) {
            return { error: true, status: 400, response: { success: false, message: "Thời lượng phải là số dương." } };
        }
    }

    if (data.link_trailer) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)(\/.+)?$/;
        if (!youtubeRegex.test(data.link_trailer)) {
            return { error: true, status: 400, response: { success: false, message: "Link Youtube không hợp lệ." } };
        }
    }

    return { error: false };
};

// --- CÁC HÀM XỬ LÝ (EXPORTS) ---

// LẤY DANH SÁCH PHIM
exports.getMovie = (req, res) => {
    const { search = "", page = 1, limit = 10, the_loai = "", tinh_trang = "", do_tuoi_gioi_han = "", nuoc_san_xuat = "" } = req.query;
    const validPage = Math.max(1, Number(page));
    const validLimit = Math.max(1, Number(limit));

    Movie.count(search, the_loai, tinh_trang, do_tuoi_gioi_han, nuoc_san_xuat, (err, countResult) => {
        if (err) return res.status(500).json({ success: false, message: "Lỗi đếm số lượng phim." });
        const total = countResult[0].total;

        Movie.getAll(search, validPage, validLimit, the_loai, tinh_trang, do_tuoi_gioi_han, nuoc_san_xuat, (err, data) => {
            if (err) return res.status(500).json({ success: false, message: "Lỗi lấy danh sách phim." });
            const formattedData = data.map(movie => formatMovieDate(movie));
            res.json({ data: formattedData, total, page: validPage, limit: validLimit, totalPages: Math.ceil(total / validLimit) });
        });
    });
};

// CHI TIẾT PHIM
exports.getByIdMovie = (req, res) => {
    const { ma_phim } = req.params;
    Movie.getById(ma_phim, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Lỗi server." });
        if (!result || result.length === 0) return res.status(404).json({ success: false, message: "Không tìm thấy phim." });
        res.json(formatMovieDate(result[0]));
    });
};

// THÊM PHIM
exports.createMovie = (req, res) => {
    const data = req.body;
    if (req.file) data.anh_poster = `/uploads/${req.file.filename}`;

    const validation = validateMovieData(data, false); // isUpdate = false
    if (validation.error) return res.status(validation.status).json(validation.response);

    Movie.create(data, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Lỗi thêm phim." });
        res.status(201).json({ success: true, message: "Thêm thành công", ma_phim
          : result.insertId });
    });
};

// CẬP NHẬT PHIM
exports.updateMovie = (req, res) => {
    const { ma_phim } = req.params;
    const data = req.body;
    if (req.file) data.anh_poster = "/uploads/" + req.file.filename;

    const validation = validateMovieData(data, true); // isUpdate = true -> Sẽ không bắt 10 trường
    if (validation.error) return res.status(validation.status).json(validation.response);

    Movie.update(ma_phim, data, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Lỗi cập nhật." });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Phim không tồn tại." });
        res.json({ success: true, message: "Cập nhật thành công" });
    });
};

// XÓA PHIM
exports.deleteMovie = (req, res) => {
    const { ma_phim } = req.params;
    
    if (!ma_phim) {
        return res.status(400).json({ success: false, message: "Thiếu mã phim để xóa" });
    }

    // Check FK references first
    Movie.getReferencedShowtimes(ma_phim, (err, showtimeCount) => {
        if (err) {
            console.error("Lỗi kiểm tra suất chiếu:", err);
            return res.status(500).json({ success: false, message: "Lỗi kiểm tra dữ liệu liên quan" });
        }

        if (showtimeCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Không thể xóa phim. Phim này đang có ${showtimeCount} suất chiếu liên quan. Vui lòng xóa suất chiếu trước.` 
            });
        }

        // Safe to delete
        Movie.delete(ma_phim, (err, result) => {
            if (err) {
                console.error("Lỗi xóa phim:", err);
                return res.status(500).json({ success: false, message: "Lỗi server khi xóa phim" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy phim để xóa" });
            }

            res.json({ success: true, message: "Xóa phim thành công" });
        });
    });
};
// const Movie = require("../models/movieModel");

// // Helper function format ngay_khoi_chieu
// const formatMovieDate = (movie) => {
//     if (!movie) return null;
//     return {
//         ...movie,
//         ngay_khoi_chieu: movie.ngay_khoi_chieu instanceof Date 
//             ? movie.ngay_khoi_chieu.toISOString().split('T')[0]
//             : movie.ngay_khoi_chieu
//     };
// };

// // VALIDATION HELPER
// const validateMovieData = (data, isUpdate = false) => {
//     const fields = ["ten_phim", "the_loai", "mo_ta", "anh_poster", "link_trailer", "do_tuoi_gioi_han", "nuoc_san_xuat", "tinh_trang", "thoi_luong", "ngay_khoi_chieu"];
    
//     // Trim dữ liệu nếu có
//     fields.forEach(field => {
//         if (data[field]) data[field] = String(data[field]).trim();
//     });

//     // 1. CHỈ CHECK TRỐNG TẤT CẢ KHI THÊM MỚI (isUpdate = false)
//     if (!isUpdate) {
//         for (let field of fields) {
//             if (!data[field]) {
//                 return {
//                     error: true,
//                     status: 400,
//                     response: { success: false, message: `Trường ${field} không được để trống khi thêm mới.` }
//                 };
//             }
//         }
//     }

//     // 2. VALIDATE ĐỊNH DẠNG (Dùng cho cả Thêm và Sửa - nhưng chỉ check khi TRƯỜNG ĐÓ có dữ liệu gửi lên)
//     if (data.ngay_khoi_chieu) {
//         const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
//         if (!dateRegex.test(data.ngay_khoi_chieu)) {
//             return { error: true, status: 400, response: { success: false, message: "Ngày khởi chiếu phải có định dạng YYYY-MM-DD" } };
//         }
//     }

//     if (data.thoi_luong) {
//         const thoi_luong = Number(data.thoi_luong);
//         if (isNaN(thoi_luong) || thoi_luong <= 0) {
//             return { error: true, status: 400, response: { success: false, message: "Thời lượng phải là số dương." } };
//         }
//     }

//     if (data.link_trailer) {
//         const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)(\/.+)?$/;
//         if (!youtubeRegex.test(data.link_trailer)) {
//             return { error: true, status: 400, response: { success: false, message: "Link Youtube không hợp lệ." } };
//         }
//     }

//     return { error: false };
// };

// // --- CÁC HÀM XỬ LÝ (EXPORTS) ---

// // LẤY DANH SÁCH PHIM
// exports.getMovie = (req, res) => {
//     const { search = "", page = 1, limit = 10, the_loai = "", tinh_trang = "", do_tuoi_gioi_han = "", nuoc_san_xuat = "" } = req.query;
//     const validPage = Math.max(1, Number(page));
//     const validLimit = Math.max(1, Number(limit));

//     Movie.count(search, the_loai, tinh_trang, do_tuoi_gioi_han, nuoc_san_xuat, (err, countResult) => {
//         if (err) return res.status(500).json({ success: false, message: "Lỗi đếm số lượng phim." });
//         const total = countResult[0].total;

//         Movie.getAll(search, validPage, validLimit, the_loai, tinh_trang, do_tuoi_gioi_han, nuoc_san_xuat, (err, data) => {
//             if (err) return res.status(500).json({ success: false, message: "Lỗi lấy danh sách phim." });
//             const formattedData = data.map(movie => formatMovieDate(movie));
//             res.json({ data: formattedData, total, page: validPage, limit: validLimit, totalPages: Math.ceil(total / validLimit) });
//         });
//     });
// };

// // CHI TIẾT PHIM
// exports.getByIdMovie = (req, res) => {
//     const { ma_phim } = req.params;
//     Movie.getById(ma_phim, (err, result) => {
//         if (err) return res.status(500).json({ success: false, message: "Lỗi server." });
//         if (!result || result.length === 0) return res.status(404).json({ success: false, message: "Không tìm thấy phim." });
//         res.json(formatMovieDate(result[0]));
//     });
// };

// // THÊM PHIM
// exports.createMovie = (req, res) => {
//     const data = req.body;
//     if (req.file) data.anh_poster = `/uploads/${req.file.filename}`;

//     const validation = validateMovieData(data, false); // isUpdate = false
//     if (validation.error) return res.status(validation.status).json(validation.response);

//     Movie.create(data, (err, result) => {
//         if (err) return res.status(500).json({ success: false, message: "Lỗi thêm phim." });
//         res.status(201).json({ success: true, message: "Thêm thành công", ma_phim
//           : result.insertId });
//     });
// };

// // CẬP NHẬT PHIM
// exports.updateMovie = (req, res) => {
//     const { ma_phim } = req.params;
//     const data = req.body;
//     if (req.file) data.anh_poster = "/uploads/" + req.file.filename;

//     const validation = validateMovieData(data, true); // isUpdate = true -> Sẽ không bắt 10 trường
//     if (validation.error) return res.status(validation.status).json(validation.response);

//     Movie.update(ma_phim, data, (err, result) => {
//         if (err) return res.status(500).json({ success: false, message: "Lỗi cập nhật." });
//         if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Phim không tồn tại." });
//         res.json({ success: true, message: "Cập nhật thành công" });
//     });
// };

// // XÓA PHIM
// exports.deleteMovie = (req, res) => {
//     const { ma_phim } = req.params; // Lấy ID từ URL (vd: /api/movies/10)
    
//     if (!ma_phim) {
//         return res.status(400).json({ success: false, message: "Thiếu mã phim để xóa" });
//     }

//     Movie.delete(ma_phim, (err, result) => {
//         if (err) {
//             console.error("Lỗi xóa phim:", err);
//             return res.status(500).json({ success: false, message: "Lỗi server khi xóa phim" });
//         }
        
//         // Kiểm tra xem có dòng nào bị xóa không
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ success: false, message: "Không tìm thấy phim để xóa" });
//         }

//         res.json({ success: true, message: "Xóa phim thành công" });
//     });
// };
// // exports.deleteMovie = (req, res) => {
// //     const { ma_phim } = req.params;
// //     Movie.delete(ma_phim, (err, result) => {
// //         if (err) return res.status(500).json({ success: false, message: "Lỗi khi xóa phim." });
// //         res.json({ success: true, message: "Xóa thành công" });
// //     });
// // };