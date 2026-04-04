const db = require("./src/config/db");

const ThongKeHoaDonDAO = require("./src/models/thongKeHoaDonModel");

ThongKeHoaDonDAO.getRevenueByTime("2026-03-20", "2026-04-05", (err, data) => {
  if (err) console.error("Filter 2026-03-20 to 2026-04-05 ERROR:", err);
  else console.log("Filter Result:", data);

  ThongKeHoaDonDAO.getOverview((err, overview) => {
    console.log("Overview Data:", overview);
    process.exit();
  });
});
