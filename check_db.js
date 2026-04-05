const db = require("./backend/src/config/db");

db.query("DESCRIBE hoa_don", (err, result) => {
  if (err) console.error(err);
  else console.log(result);
  
  db.query("SELECT * FROM hoa_don LIMIT 5", (err, result2) => {
      if (err) console.error(err);
      else console.log(result2);
      process.exit();
  });
});
