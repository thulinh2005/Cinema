const Showtime = require("../models/showtimeModel");
const Movie = require("../models/movieModel");
const Room = require("../models/roomModel");

// LẤY DANH SÁCH DROPDOWN CHO FORM
exports.getDropdownData = (req, res) => {
    Movie.getAllNames((err1, movies) => {
        if (err1) return res.status(500).json({ message: "Lỗi lấy danh sách phim", error: err1 });
        
        Room.getAll(null, (err2, rooms) => {
            if (err2) return res.status(500).json({ message: "Lỗi lấy danh sách phòng", error: err2 });
            
            res.json({ movies, rooms });
        });
    });
};

// LẤY DANH SÁCH SUẤT CHIẾU
exports.getShowtime = (req, res) => {
  const {
    page = 1,
    limit = 10,
    ngay_chieu = "",
    trang_thai = "",
    ma_phong = "",
  } = req.query;

  // Gọi hàm cập nhật trạng thái tự động dựa vào thời gian thực trước khi lấy danh sách
  Showtime.updateStatusAuto((errStatus) => {
    if (errStatus) console.error("Lỗi cập nhật trạng thái tự động:", errStatus);

    Showtime.count(ngay_chieu, trang_thai, ma_phong, (err, countResult) => {
    if (err) return res.status(500).json({ message: "Lỗi server", err });

    const total = countResult[0].total;

    Showtime.getAll(
      page,
      limit,
      ngay_chieu,
      trang_thai,
      ma_phong,
      (err, data) => {
        if (err) return res.status(500).json({ message: "Lỗi server", err });

        res.json({
          data,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        });
      }
    );
  });
  });
};

// CHI TIẾT SUẤT CHIẾU
exports.getByIdShowtime = (req, res) => {
  const { id } = req.params;

  Showtime.getById(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", err });

    if (!result || result.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy suất chiếu",
      });
    }

    res.json(result[0]);
  });
};

// THÊM SUẤT CHIẾU
exports.createShowtime = (req, res) => {
  try {
    const data = req.body;

    if (!data.ma_phim || !data.ma_phong || !data.ngay_chieu || !data.gio_chieu || !data.gio_ket_thuc) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
      });
    }

    Showtime.create(data, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Lỗi server", err });
      }

      res.status(201).json({
        message: "Thêm suất chiếu thành công",
        id: result.insertId,
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", err });
  }
};

// CẬP NHẬT SUẤT CHIẾU
exports.updateShowtime = (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    Showtime.update(id, data, (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi server", err });

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Không tìm thấy suất chiếu",
        });
      }

      res.json({ message: "Cập nhật suất chiếu thành công" });
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", err });
  }
};

// XÓA SUẤT CHIẾU
exports.deleteShowtime = (req, res) => {
  const { id } = req.params;

  Showtime.delete(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", err });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy suất chiếu",
      });
    }

    res.json({ message: "Xóa suất chiếu thành công" });
  });
};

// TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI
exports.updateStatusShowtime = (req, res) => {
  try {
    Showtime.updateStatusAuto((err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi server", err });

      res.json({
        message: "Cập nhật trạng thái suất chiếu thành công",
        affectedRows: result.affectedRows,
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", err });
  }
};

// KIỂM TRA GHẾ TRỐNG
exports.getAvailableSeatsShowtime = (req, res) => {
  const { id } = req.params;

  Showtime.getAvailableSeats(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", err });

    if (!result || result.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy suất chiếu",
      });
    }

    res.json({
      ma_suat_chieu: id,
      tong_ghe: result[0].tong_ghe,
      ghe_da_dat: result[0].ghe_da_dat,
      ghe_trong: result[0].ghe_trong,
      tyle_trong: ((result[0].ghe_trong / result[0].tong_ghe) * 100).toFixed(2) + "%",
    });
  });
};
