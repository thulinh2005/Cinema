const Movie = require("../models/movieModel");

// Helper function format ngay_khoi_chieu
const formatMovieDate = (movie) => ({
  ...movie,
  ngay_khoi_chieu: movie.ngay_khoi_chieu instanceof Date 
    ? movie.ngay_khoi_chieu.toISOString().split('T')[0]
    : movie.ngay_khoi_chieu
});

// VALIDATION HELPER (built-in)
const validateMovieData = (data) => {
  // Normalize
  data.ten_phim = String(data.ten_phim || "").trim().toLowerCase();
  data.the_loai = String(data.the_loai || "").trim();
  data.mo_ta = String(data.mo_ta || "").trim();
  data.anh_poster = String(data.anh_poster || "").trim();
  data.link_trailer = String(data.link_trailer || "").trim();
  data.do_tuoi_gioi_han = String(data.do_tuoi_gioi_han || "").trim();
  data.nuoc_san_xuat = String(data.nuoc_san_xuat || "").trim();
  data.tinh_trang = String(data.tinh_trang || "").trim();
  data.thoi_luong = String(data.thoi_luong || "").trim();
  data.ngay_khoi_chieu = String(data.ngay_khoi_chieu || "").trim();

  // Check empty fields
  if (
    !data.ten_phim || !data.the_loai || !data.thoi_luong ||
    !data.ngay_khoi_chieu || !data.mo_ta || !data.anh_poster ||
    !data.link_trailer || !data.do_tuoi_gioi_han ||
    !data.nuoc_san_xuat || !data.tinh_trang
  ) {
    return {
      error: true,
      status: 400,
      response: {
        success: false,
        message: "Dữ liệu không hợp lệ.",
        detail: "Vui lòng cung cấp đầy đủ và chính xác tất cả 10 trường thông tin bắt buộc:",
        required: [
          { field: "ten_phim", description: "Tên phim (không được để trống)" },
          { field: "the_loai", description: "Thể loại (không được để trống)" },
          { field: "thoi_luong", description: "Thời lượng (phút, phải > 0)" },
          { field: "ngay_khoi_chieu", description: "Ngày khởi chiếu (định dạng YYYY-MM-DD)" },
          { field: "mo_ta", description: "Mô tả phim (không được để trống)" },
          { field: "anh_poster", description: "URL poster (định dạng ảnh: jpg, png, gif, webp)" },
          { field: "link_trailer", description: "Link YouTube trailer (YouTube link hợp lệ)" },
          { field: "do_tuoi_gioi_han", description: "Độ tuổi giới hạn (không được để trống)" },
          { field: "nuoc_san_xuat", description: "Nước sản xuất (không được để trống)" },
          { field: "tinh_trang", description: "Tình trạng (không được để trống)" }
        ]
      }
    };
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.ngay_khoi_chieu)) {
    return {
      error: true,
      status: 400,
      response: {
        success: false,
        message: "Ngày khởi chiếu không hợp lệ.",
        detail: `Giá trị nhận được: "${data.ngay_khoi_chieu}". Vui lòng sử dụng định dạng YYYY-MM-DD (ví dụ: 2026-03-25).`
      }
    };
  }

  // Validate duration
  const thoi_luong = Number(data.thoi_luong);
  if (isNaN(thoi_luong) || thoi_luong <= 0) {
    return {
      error: true,
      status: 400,
      response: {
        success: false,
        message: "Thời lượng phim không hợp lệ.",
        detail: `Giá trị nhận được: "${data.thoi_luong}". Thời lượng phải là số dương (tính bằng phút, ví dụ: 120).`
      }
    };
  }

  // Validate poster URL or server path
  const uploadPathRegex = /^\/uploads\/.+\.(jpg|jpeg|png|gif|webp)$/i;
  const urlRegex = /^(https?:\/\/)?.+\.(jpg|jpeg|png|gif|webp)$/i;
  if (!uploadPathRegex.test(data.anh_poster) && !urlRegex.test(data.anh_poster)) {
    return {
      error: true,
      status: 400,
      response: {
        success: false,
        message: "Ảnh poster không hợp lệ.",
        detail: `Giá trị nhận được: "${data.anh_poster}". Vui lòng upload ảnh từ máy hoặc cung cấp URL ảnh hợp lệ (jpg, jpeg, png, gif hoặc webp).`
      }
    };
  }

  // Validate YouTube link
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)(\/.+)?$/;
  if (!youtubeRegex.test(data.link_trailer.trim())) {
    return {
      error: true,
      status: 400,
      response: {
        success: false,
        message: "Link trailer YouTube không hợp lệ.",
        detail: `Giá trị nhận được: "${data.link_trailer}". Vui lòng cung cấp link YouTube hợp lệ (ví dụ: https://www.youtube.com/watch?v=... hoặc https://youtu.be/...).`
      }
    };
  }

  return { error: false };
};

// LẤY DANH SÁCH PHIM
exports.getMovie = (req, res) => {
  const {
    search = "",
    page = 1,
    limit = 10,
    the_loai = "",
    tinh_trang = "",
    do_tuoi_gioi_han = "",
    nuoc_san_xuat = "",
  } = req.query;

  const validPage = Math.max(1, Number(page));
  const validLimit = Math.max(1, Number(limit));

  Movie.count(search, the_loai, tinh_trang, do_tuoi_gioi_han, nuoc_san_xuat, (err, countResult) => {
    if (err) return res.status(500).json({ 
      success: false,
      message: "Không thể lấy danh sách phim.",
      detail: "Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề tiếp tục xảy ra.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });

    const total = countResult[0].total;

    Movie.getAll(
      search,
      validPage,
      validLimit,
      the_loai,
      tinh_trang,
      do_tuoi_gioi_han,
      nuoc_san_xuat,
      (err, data) => {
        if (err) return res.status(500).json({ 
          success: false,
          message: "Không thể lấy danh sách phim.",
          detail: "Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề tiếp tục xảy ra.",
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });

        // Format ngay_khoi_chieu thành YYYY-MM-DD
        const formattedData = data.map(movie => ({
          ...movie,
          ngay_khoi_chieu: movie.ngay_khoi_chieu instanceof Date 
            ? movie.ngay_khoi_chieu.toISOString().split('T')[0]
            : movie.ngay_khoi_chieu
        }));

        res.json({
          data: formattedData,
          total,
          page: validPage,
          limit: validLimit,
          totalPages: Math.ceil(total / validLimit),
        });
      }
    );
  });
};

// CHI TIẾT PHIM
exports.getByIdMovie = (req, res) => {
  const { id } = req.params;

  Movie.getById(id, (err, result) => {
    if (err) return res.status(500).json({ 
      success: false,
      message: "Không thể lấy thông tin phim.",
      detail: "Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề tiếp tục xảy ra.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Phim không tồn tại.",
        detail: `Không tìm thấy phim với ID "${id}". Vui lòng kiểm tra lại ID và thử lại.`
      });
    }

    res.json(formatMovieDate(result[0]));
  });
};

// THÊM PHIM
exports.createMovie = (req, res) => {
  try {
    const data = req.body;

    // Xử lý upload ảnh
    if (req.file) {
      data.anh_poster = `/uploads/${req.file.filename}`;
    }

    // Validate data
    const validation = validateMovieData(data);
    if (validation.error) {
      return res.status(validation.status).json(validation.response);
    }

    // Kiểm tra trùng tên phim
    Movie.checkDuplicateTitle(data.ten_phim, null, (err, result) => {
      if (err) return res.status(500).json({ 
        success: false,
        message: "Không thể kiểm tra thông tin phim.",
        detail: "Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề tiếp tục xảy ra.",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
      
      if (result[0].count > 0) {
        return res.status(409).json({
          success: false,
          message: "Phim đã tồn tại trong hệ thống.",
          detail: `Phim có tên "${data.ten_phim}" đã được thêm vào trước đó. Vui lòng chọn tên khác hoặc cập nhật phim hiện có.`
        });
      }

      // Nếu pass all validation, thêm phim
      Movie.create(data, (err, result) => {
        if (err) {
          return res.status(500).json({ 
            success: false,
            message: "Không thể thêm phim mới.",
            detail: "Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề tiếp tục xảy ra.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
          });
        }

        // Lấy lại thông tin phim vừa tạo để trả về đầy đủ
        Movie.getById(result.insertId, (getErr, movies) => {
          if (getErr) {
            return res.status(500).json({ 
              success: false,
              message: "Phim đã được thêm nhưng không thể truy xuất thông tin.",
              detail: "Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề tiếp tục xảy ra.",
              error: process.env.NODE_ENV === 'development' ? getErr.message : undefined
            });
          }

          res.status(201).json({
            success: true,
            message: "Phim đã được thêm thành công.",
            data: formatMovieDate(movies[0])
          });
        });
      });
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Đã xảy ra lỗi khi xử lý yêu cầu.",
      detail: "Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề tiếp tục xảy ra.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// CẬP NHẬT PHIM
exports.updateMovie = (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Xử lý upload ảnh
    if (req.file) {
      data.anh_poster = `/uploads/${req.file.filename}`;
    }

    // Validate data
    const validation = validateMovieData(data);
    if (validation.error) {
      return res.status(validation.status).json(validation.response);
    }

    // Kiểm tra trùng tên phim (excluding phim hiện tại)
    Movie.checkDuplicateTitle(data.ten_phim, id, (err, result) => {
      if (err) return res.status(500).json({ 
        success: false,
        message: "Không thể kiểm tra thông tin phim.",
        detail: "Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề tiếp tục xảy ra.",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
      
      if (result[0].count > 0) {
        return res.status(409).json({
          success: false,
          message: "Phim đã tồn tại trong hệ thống.",
          detail: `Phim có tên "${data.ten_phim}" đã được sử dụng bởi phim khác. Vui lòng chọn tên khác.`
        });
      }

      Movie.update(id, data, (err, result) => {
      if (err) return res.status(500).json({ 
        success: false,
        message: "Không thể cập nhật phim.",
        detail: "Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề tiếp tục xảy ra.",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Phim không tồn tại.",
          detail: `Không tìm thấy phim với ID "${id}". Vui lòng kiểm tra lại ID và thử lại.`
        });
      }

      // Lấy lại thông tin phim vừa cập nhật để trả về đầy đủ
      Movie.getById(id, (getErr, movies) => {
        if (getErr) {
          return res.status(500).json({ 
            success: false,
            message: "Phim đã được cập nhật nhưng không thể truy xuất thông tin.",
            detail: "Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề tiếp tục xảy ra.",
            error: process.env.NODE_ENV === 'development' ? getErr.message : undefined
          });
        }

        res.json({
          success: true,
          message: "Phim đã được cập nhật thành công.",
          data: formatMovieDate(movies[0])
        });
      });
      });
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Đã xảy ra lỗi khi xử lý yêu cầu.",
      detail: "Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề tiếp tục xảy ra.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// XÓA PHIM
exports.deleteMovie = (req, res) => {
  const { id } = req.params;

  // Lấy thông tin phim trước khi xóa
  Movie.getById(id, (getErr, movies) => {
    if (getErr) return res.status(500).json({ 
      success: false,
      message: "Không thể lấy thông tin phim.",
      detail: "Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề tiếp tục xảy ra.",
      error: process.env.NODE_ENV === 'development' ? getErr.message : undefined
    });

    if (!movies || movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Phim không tồn tại.",
        detail: `Không tìm thấy phim với ID "${id}". Vui lòng kiểm tra lại ID và thử lại.`
      });
    }

    Movie.delete(id, (err, result) => {
      if (err) return res.status(500).json({ 
        success: false,
        message: "Không thể xóa phim.",
        detail: "Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề tiếp tục xảy ra.",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });

      res.json({
        success: true,
        message: "Phim đã được xóa thành công.",
        data: formatMovieDate(movies[0])
      });
    });
  });
};
