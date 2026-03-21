const Room = require("../models/roomModel");
const db = require("../config/db");

exports.getRoomTypes = (req, res) => {
    const sql = "SHOW COLUMNS FROM phong_chieu LIKE 'loai_phong'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi lấy loại phòng", error: err });
        const enumStr = results[0].Type;
        const matches = enumStr.match(/'([^']*)'/g);
        const types = matches.map(m => m.replace(/'/g, ''));
        res.json(types);
    });
};

exports.createRoom = (req, res) => {
    const { ten_phong, so_ghe, loai_phong, trang_thai } = req.body;
    if (!ten_phong || !so_ghe || !loai_phong) {
        return res.status(400).json({ message: "Thông tin phòng không đầy đủ!" });
    }

    Room.create({ ten_phong, so_ghe, loai_phong, trang_thai }, (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi tạo phòng", error: err });

        const ma_phong = result.insertId;
        const seatsPerRow = 10;
        const totalSeats = parseInt(so_ghe);
        const seatData = [];
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (let i = 0; i < Math.ceil(totalSeats / seatsPerRow); i++) {
            const rowLabel = alphabet[i];
            for (let j = 1; j <= seatsPerRow; j++) {
                const currentCount = i * seatsPerRow + j;
                if (currentCount <= totalSeats) {
                    const seatNumber = `${rowLabel}${j}`;
                    const seatType = (rowLabel === 'A') ? 'VIP' : 'STANDARD';
                    // QUAN TRỌNG: Thêm số 0 ở cuối cho cột has_aisle
                    seatData.push([ma_phong, rowLabel, j, seatNumber, seatType, 'Hoạt động', 0, 0]);
                }
            }
        }

        Room.createSeatsBulk(seatData, (errSeats) => {
            if (errSeats) return res.status(500).json({ message: "Lỗi tạo sơ đồ ghế", error: errSeats });
            res.json({ message: `Đã tạo phòng thành công!` });
        });
    });
};

exports.getAllRooms = (req, res) => {
    const { search } = req.query;
    Room.getAll(search, (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching rooms", error: err });
        res.json(results);
    });
};

exports.updateRoom = (req, res) => {
    const { ten_phong, loai_phong, trang_thai } = req.body;
    const { id } = req.params;
    const sql = "UPDATE phong_chieu SET ten_phong = ?, loai_phong = ?, trang_thai = ? WHERE ma_phong = ?";
    db.query(sql, [ten_phong, loai_phong, trang_thai, id], (err) => {
        if (err) return res.status(500).json({ message: "Update failed", error: err });
        res.json({ message: "Update success" });
    });
};

exports.deleteRoom = (req, res) => {
    Room.delete(req.params.id, (err) => {
        if (err) return res.status(500).json({ message: "Delete failed" });
        res.json({ message: "Delete success" });
    });
};

exports.getSeatsByRoom = (req, res) => {
    Room.getSeats(req.params.id, (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching seats" });
        res.json(results);
    });
};

exports.updateSeats = (req, res) => {
    const { id } = req.params;
    const { seats } = req.body;

    if (!seats || !Array.isArray(seats)) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    const seatData = seats.map(s => [
        id, s.hang, s.cot, s.so_ghe, s.loai_ghe, s.trang_thai || 'Hoạt động',
        s.has_aisle ? 1 : 0,
        s.has_aisle_horizontal ? 1 : 0
    ]);

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ message: "Lỗi hệ thống" });

        db.query("DELETE FROM ghe WHERE ma_phong = ?", [id], (errDel) => {
            if (errDel) return db.rollback(() => res.status(500).json({ message: "Lỗi dọn dẹp" }));

            const insertSql = "INSERT INTO ghe (ma_phong, hang, cot, so_ghe, loai_ghe, trang_thai, has_aisle, has_aisle_horizontal) VALUES ?";
            db.query(insertSql, [seatData], (errIns) => {
                if (errIns) return db.rollback(() => res.status(500).json({ message: "Lỗi ghi dữ liệu" }));

                Room.updateSeatCount(id, seats.length, (errUpd) => {
                    if (errUpd) return db.rollback(() => res.status(500).json({ message: "Lỗi cập nhật số lượng" }));
                    db.commit((errCom) => {
                        if (errCom) return db.rollback(() => res.status(500).json({ message: "Lỗi xác nhận" }));
                        res.json({ message: "Đã lưu sơ đồ thành công!" });
                    });
                });
            });
        });
    });
};