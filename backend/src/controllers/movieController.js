const Movie = require("../models/movieModel");
const fs = require('fs');
const path = require('path');

const formatMovieDate = (movie) => {
    if (!movie) return null;
    let formattedDate = movie.ngay_khoi_chieu;
    if (formattedDate instanceof Date) {
        const localDate = new Date(formattedDate.getTime() - formattedDate.getTimezoneOffset() * 60000);
        formattedDate = localDate.toISOString().split('T')[0];
    }
    return {
        ...movie,
        ngay_khoi_chieu: formattedDate
    };
};

const validateMovieData = (data, isUpdate = false) => {
    const fields = ["ten_phim", "the_loai", "mo_ta", "anh_poster", "link_trailer", "do_tuoi_gioi_han", "nuoc_san_xuat", "tinh_trang", "thoi_luong", "ngay_khoi_chieu"];

    fields.forEach(field => {
        if (data[field]) data[field] = String(data[field]).trim();
    });

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

exports.getMovie = (req, res) => {
    const { search = "", searchField = "ten_phim", page = 1, limit = 10, the_loai = "", tinh_trang = "", do_tuoi_gioi_han = "", nuoc_san_xuat = "" } = req.query;
    const validPage = Math.max(1, Number(page));
    const validLimit = Math.max(1, Number(limit));

    Movie.count(search, searchField, the_loai, tinh_trang, do_tuoi_gioi_han, nuoc_san_xuat, (err, countResult) => {
        if (err) return res.status(500).json({ success: false, message: "Lỗi đếm số lượng phim." });
        const total = countResult[0].total;

        Movie.getAll(search, searchField, validPage, validLimit, the_loai, tinh_trang, do_tuoi_gioi_han, nuoc_san_xuat, (err, data) => {
            if (err) return res.status(500).json({ success: false, message: "Lỗi lấy danh sách phim." });
            const formattedData = data.map(movie => formatMovieDate(movie));
            res.json({ data: formattedData, total, page: validPage, limit: validLimit, totalPages: Math.ceil(total / validLimit) });
        });
    });
};

exports.getByIdMovie = (req, res) => {
    const { ma_phim } = req.params;
    Movie.getById(ma_phim, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Lỗi server." });
        if (!result || result.length === 0) return res.status(404).json({ success: false, message: "Không tìm thấy phim." });
        res.json(formatMovieDate(result[0]));
    });
};

exports.createMovie = (req, res) => {
    const data = req.body;
    if (req.file) data.anh_poster = `/uploads/${req.file.filename}`;

    const validation = validateMovieData(data, false); // isUpdate = false
    if (validation.error) return res.status(validation.status).json(validation.response);

    if (data.ngay_khoi_chieu && data.tinh_trang !== "Ngừng chiếu") {
        const now = new Date();
        const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        const todayStr = localNow.toISOString().split('T')[0];

        if (data.ngay_khoi_chieu <= todayStr) {
            data.tinh_trang = "Đang chiếu";
        } else {
            data.tinh_trang = "Sắp chiếu";
        }
    }

    Movie.create(data, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Lỗi thêm phim." });
        res.status(201).json({ success: true, message: "Thêm thành công", ma_phim: result.insertId });
    });
};

exports.updateMovie = (req, res) => {
    const { ma_phim } = req.params;
    const data = req.body;
    if (req.file) data.anh_poster = "/uploads/" + req.file.filename;

    const validation = validateMovieData(data, true); // isUpdate = true -> Sẽ không bắt 10 trường
    if (validation.error) return res.status(validation.status).json(validation.response);

    if (data.ngay_khoi_chieu && data.tinh_trang !== "Ngừng chiếu") {
        const now = new Date();
        const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        const todayStr = localNow.toISOString().split('T')[0];

        if (data.ngay_khoi_chieu <= todayStr) {
            data.tinh_trang = "Đang chiếu";
        } else {
            data.tinh_trang = "Sắp chiếu";
        }
    }

    Movie.update(ma_phim, data, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Lỗi cập nhật." });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Phim không tồn tại." });
        res.json({ success: true, message: "Cập nhật thành công" });
    });
};

exports.deleteMovie = (req, res) => {
    const { ma_phim } = req.params;

    if (!ma_phim) {
        return res.status(400).json({ success: false, message: "Thiếu mã phim để xóa" });
    }

    Movie.getById(ma_phim, (err, movieResult) => {
        if (err) {
            console.error("Lỗi lấy thông tin phim:", err);
            return res.status(500).json({ success: false, message: "Lỗi server." });
        }

        if (!movieResult || movieResult.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phim để xóa" });
        }

        const movie = movieResult[0];

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

            Movie.delete(ma_phim, (err, result) => {
                if (err) {
                    console.error("Lỗi xóa phim:", err);
                    return res.status(500).json({ success: false, message: "Lỗi server khi xóa phim" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: "Không tìm thấy phim để xóa" });
                }

                if (movie.anh_poster && typeof movie.anh_poster === 'string' && movie.anh_poster.startsWith('/uploads/')) {
                    const filePath = path.join(__dirname, '../../', movie.anh_poster);
                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log("Đã xóa file ảnh vật lý: ", filePath);
                        } else {
                            console.log("File ảnh không tồn tại để xóa: ", filePath);
                        }
                    } catch (fsErr) {
                        console.error("Không thể xóa file ảnh:", fsErr);
                    }
                }

                res.json({ success: true, message: "Xóa phim thành công" });
            });
        });
    });
};
