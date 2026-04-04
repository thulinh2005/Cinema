const db = require("./src/config/db");

const query = "SELECT hd.ma_hd, hd.ngay_lap, hd.tong_tien, v.ma_ve, v.trang_thai FROM hoa_don hd LEFT JOIN ve v ON hd.ma_hd = v.ma_hd LIMIT 10";

db.query(query, (err, results) => {
  if (err) {
    console.error(err);
  } else {
    console.log(results);
  }
  process.exit();
});
