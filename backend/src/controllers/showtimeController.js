const Showtime = require("../models/showtimeModel");
const Movie = require("../models/movieModel");
const Room = require("../models/roomModel");

exports.getDropdownData = (req, res) => {
  Movie.getAllNames((err1, movies) => {
    if (err1) return res.status(500).json({ message: "Lỗi lấy danh sách phim", error: err1 });

    Room.getAll(null, (err2, rooms) => {
      if (err2) return res.status(500).json({ message: "Lỗi lấy danh sách phòng", error: err2 });

      res.json({ movies, rooms });
    });
  });
};

exports.getShowtime = (req, res) => {
  const {
    page = 1,
    limit = 10,
    ngay_chieu = "",
    trang_thai = "",
    ma_phong = "",
  } = req.query;

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

exports.createShowtime = (req, res) => {
  try {
    const data = req.body;

    if (!data.ma_phim || !data.ma_phong || !data.ngay_chieu || !data.gio_chieu || !data.gio_ket_thuc) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
      });
    }

    Movie.getById(data.ma_phim, (err, movies) => {
      if (err) return res.status(500).json({ message: "Lỗi server khi kiểm tra phim", err });
      if (!movies || movies.length === 0) return res.status(404).json({ message: "Không tìm thấy phim" });

      const movie = movies[0];
      const now = new Date();
      const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      const todayStr = localNow.toISOString().split('T')[0];

      if (data.ngay_chieu < todayStr) {
        return res.status(400).json({ message: "Không thể thêm suất chiếu trong quá khứ" });
      }

      const start = new Date(`1970-01-01T${data.gio_chieu}:00Z`);
      const end = new Date(`1970-01-01T${data.gio_ket_thuc}:00Z`);
      let diffMins = (end - start) / 60000;
      if (diffMins < 0) diffMins += 24 * 60;

      if (diffMins < movie.thoi_luong) {
        return res.status(400).json({
          message: `Thời lượng suất chiếu (${diffMins} phút) không được nhỏ hơn thời lượng phim (${movie.thoi_luong} phút)`
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
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", err });
  }
};

exports.updateShowtime = (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!data.ma_phim || !data.ma_phong || !data.ngay_chieu || !data.gio_chieu || !data.gio_ket_thuc) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
      });
    }

    Movie.getById(data.ma_phim, (err, movies) => {
      if (err) return res.status(500).json({ message: "Lỗi server khi kiểm tra phim", err });
      if (!movies || movies.length === 0) return res.status(404).json({ message: "Không tìm thấy phim" });

      const movie = movies[0];
      const now = new Date();
      const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      const todayStr = localNow.toISOString().split('T')[0];

      if (data.ngay_chieu < todayStr) {
        return res.status(400).json({ message: "Không thể cập nhật suất chiếu sang ngày trong quá khứ" });
      }

      const start = new Date(`1970-01-01T${data.gio_chieu}:00Z`);
      const end = new Date(`1970-01-01T${data.gio_ket_thuc}:00Z`);
      let diffMins = (end - start) / 60000;
      if (diffMins < 0) diffMins += 24 * 60;

      if (diffMins < movie.thoi_luong) {
        return res.status(400).json({
          message: `Thời lượng suất chiếu (${diffMins} phút) không được nhỏ hơn thời lượng phim (${movie.thoi_luong} phút)`
        });
      }

      Showtime.update(id, data, (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi server", err });

        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Không tìm thấy suất chiếu",
          });
        }

        res.json({ message: "Cập nhật suất chiếu thành công" });
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", err });
  }
};

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
