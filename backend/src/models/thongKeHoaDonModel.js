const db = require("../config/db");

const ThongKeHoaDonDAO = {
  getOverview: (callback) => {
    const sql = `
      SELECT 
        (SELECT COALESCE(SUM(tong_tien), 0) FROM hoa_don hd WHERE DATE(hd.ngay_lap) = CURDATE()) AS doanhThuHomNay,
        (SELECT COUNT(hd.ma_hd) FROM hoa_don hd WHERE DATE(hd.ngay_lap) = CURDATE()) AS veBanHomNay,
        (SELECT COUNT(hd.ma_hd) FROM hoa_don hd) AS tongVeBan,
        (SELECT COALESCE(SUM(tong_tien), 0) FROM hoa_don) AS tongDoanhThu
    `;
    db.query(sql, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0] || { doanhThuHomNay: 0, veBanHomNay: 0, tongVeBan: 0, tongDoanhThu: 0 });
    });
  },

  getRevenueByTime: (startDate, endDate, callback) => {
    let dateCondition = "1=1";
    let params = [];

    if (startDate && endDate) {
      dateCondition = "DATE(hd.ngay_lap) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else if (startDate) {
      dateCondition = "DATE(hd.ngay_lap) >= ?";
      params.push(startDate);
    } else if (endDate) {
      dateCondition = "DATE(hd.ngay_lap) <= ?";
      params.push(endDate);
    }

    // Subquery gom nhóm trực tiếp trên hoa_don vì 1 hóa đơn được tính là 1 vé
    const chartSql = `
      SELECT t.timeLabel, SUM(t.tong_tien) as doanhThu, SUM(t.ticketCount) as soLuongVe
      FROM (
        SELECT hd.ma_hd, 
               DATE_FORMAT(hd.ngay_lap, '%Y-%m-%d') as timeLabel, 
               hd.tong_tien, 
               1 as ticketCount
        FROM hoa_don hd
        WHERE ${dateCondition}
      ) t
      GROUP BY t.timeLabel
      ORDER BY t.timeLabel ASC
    `;

    db.query(chartSql, params, (err, chartData) => {
      if (err) return callback(err);
      callback(null, chartData);
    });
  }
};

module.exports = ThongKeHoaDonDAO;
