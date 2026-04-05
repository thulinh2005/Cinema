require("dotenv").config({ path: "./backend/.env" });
const db = require("./backend/src/config/db");

db.query("SELECT hd.ma_hd, hd.ma_nv, nv.ho_ten as ten_nv FROM hoa_don hd LEFT JOIN nhan_vien nv ON hd.ma_nv = nv.ma_nv", (err, result) => {
  if (err) console.error(err);
  else console.log(result);
  process.exit();
});
