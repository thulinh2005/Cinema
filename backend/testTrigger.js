const mysql = require('mysql2');
const db = mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '', database: 'rapchieuphim' });

db.query(`INSERT INTO hoa_don (tong_tien, ma_kh, ma_nv) VALUES (300000, 7, 1)`, (err, result) => {
    if(err) {
        console.error(err);
        db.end();
    } else {
        console.log("Đã insert hóa đơn. ID:", result.insertId);
        db.query(`SELECT diem_tich_luy, hang_thanh_vien FROM khach_hang WHERE ma_kh = 7`, (err, rows) => {
            console.log("Khách hàng 7 sau khi insert từ Raw SQL:", rows[0]);
            db.end();
        });
    }
});
