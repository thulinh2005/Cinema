const ThongKeHoaDonDAO = require("../models/thongKeHoaDonModel");

const thongKeHoaDonController = {
  getOverview: (req, res) => {
    ThongKeHoaDonDAO.getOverview((err, results) => {
      if (err) {
        console.error("Lỗi lấy tổng quan doanh thu:", err);
        return res.status(500).json({ message: "Lỗi lấy tổng quan doanh thu", error: err });
      }
      res.json(results);
    });
  },

  getRevenueByTime: (req, res) => {
    const { startDate, endDate } = req.query;

    ThongKeHoaDonDAO.getRevenueByTime(startDate, endDate, (err, results) => {
      if (err) {
        console.error("Lỗi lấy doanh thu theo thời gian:", err);
        return res.status(500).json({ message: "Lỗi lấy doanh thu theo thời gian", error: err });
      }
      res.json(results);
    });
  }
};

module.exports = thongKeHoaDonController;
