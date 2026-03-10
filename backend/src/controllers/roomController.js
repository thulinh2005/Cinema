const db = require("../config/db");

// 1. Lấy danh sách phòng chiếu + Tìm kiếm
exports.getAllRooms = (req, res) => {
    const { search } = req.query; // Lấy từ khóa tìm kiếm từ URL nếu có
    let sql = "SELECT * FROM phong_chieu";
    let params = [];

    if (search) {
        sql += " WHERE ten_phong LIKE ?";
        params.push(`%${search}%`);
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi lấy danh sách phòng", error: err });
        res.json(results);
    });
};

// 2. Thêm phòng chiếu + Tự động tạo ghế
exports.createRoom = (req, res) => {
    const { ten_phong, so_ghe, loai_phong, trang_thai } = req.body;

    const sqlRoom = "INSERT INTO phong_chieu (ten_phong, so_ghe, loai_phong, trang_thai) VALUES (?, ?, ?, ?)";

    db.query(sqlRoom, [ten_phong, so_ghe, loai_phong, trang_thai], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi tạo phòng", error: err });

        const ma_phong = result.insertId;

        // Logic tạo ghế tự động: 10 ghế mỗi hàng
        const seatsPerRow = 10;
        const totalRows = Math.ceil(so_ghe / seatsPerRow);
        const seatData = [];
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (let i = 0; i < totalRows; i++) {
            for (let j = 1; j <= seatsPerRow; j++) {
                const currentCount = i * seatsPerRow + j;
                if (currentCount <= so_ghe) {
                    const seatLabel = `${alphabet[i]}${j}`;
                    // Mặc định hàng A là VIP cho sang, còn lại STANDARD
                    const seatType = (alphabet[i] === 'A') ? 'VIP' : 'STANDARD';
                    seatData.push([ma_phong, seatLabel, seatType, 'Hoạt động']);
                }
            }
        }

        const sqlSeats = "INSERT INTO ghe (ma_phong, so_ghe, loai_ghe, trang_thai) VALUES ?";
        db.query(sqlSeats, [seatData], (errSeats) => {
            if (errSeats) return res.status(500).json({ message: "Lỗi tạo ghế tự động", error: errSeats });
            res.json({ message: `Đã tạo phòng ${ten_phong} và ${seatData.length} ghế thành công!` });
        });
    });
};

// 3. Cập nhật phòng chiếu
exports.updateRoom = (req, res) => {
    const { id } = req.params;
    const { ten_phong, loai_phong, trang_thai } = req.body;

    const sql = "UPDATE phong_chieu SET ten_phong = ?, loai_phong = ?, trang_thai = ? WHERE ma_phong = ?";
    db.query(sql, [ten_phong, loai_phong, trang_thai, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi cập nhật phòng" });
        res.json({ message: "Cập nhật thành công" });
    });
};

// 4. Xóa phòng chiếu (Sẽ tự động xóa ghế nhờ ON DELETE CASCADE trong DB của em)
exports.deleteRoom = (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM phong_chieu WHERE ma_phong = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi xóa phòng" });
        res.json({ message: "Xóa phòng thành công" });
    });
};

// 5. Lấy danh sách ghế của 1 phòng (Dùng cho trang Sơ đồ ghế)
exports.getSeatsByRoom = (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM ghe WHERE ma_phong = ? ORDER BY so_ghe ASC";
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi lấy danh sách ghế" });
        res.json(results);
    });
};