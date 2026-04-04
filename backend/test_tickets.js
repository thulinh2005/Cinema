const db = require("./src/config/db");

const query = "SELECT DISTINCT trang_thai FROM ve";

db.query(query, (err, results) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Distinct ticket statuses:", results);
  }
  process.exit();
});
