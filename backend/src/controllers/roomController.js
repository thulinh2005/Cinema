// const Room = require("../models/roomModel");
// const db = require("../config/db");

// exports.getAllRooms = (req, res) => {
//     const { search } = req.query;
//     Room.getAll(search, (err, results) => {
//         if (err) return res.status(500).json({ message: "Error fetching rooms", error: err });
//         res.json(results);
//     });
// };

// //Lấy danh sách loại phòng từ ENUM của Database
// exports.getRoomTypes = (req, res) => {
//     const sql = "SHOW COLUMNS FROM phong_chieu LIKE 'loai_phong'";
//     db.query(sql, (err, results) => {
//         if (err) return res.status(500).json({ message: "Lỗi lấy loại phòng", error: err });

//         // Bóc tách chuỗi enum('2D','3D'...) thành mảng ["2D", "3D", ...]
//         const enumStr = results[0].Type;
//         const matches = enumStr.match(/'([^']*)'/g);
//         const types = matches.map(m => m.replace(/'/g, ''));
//         res.json(types);
//     });
// };
// exports.createRoom = (req, res) => {
//     const { ten_phong, so_ghe, loai_phong, trang_thai } = req.body;

//     // VALIDATION phía Server
//     if (!ten_phong || ten_phong.trim() === "") {
//         return res.status(400).json({ message: "Tên phòng là bắt buộc nhập!" });
//     }
//     if (!so_ghe || parseInt(so_ghe) <= 0) {
//         return res.status(400).json({ message: "Số lượng ghế phải lớn hơn 0!" });
//     }
//     if (!loai_phong) {
//         return res.status(400).json({ message: "Vui lòng chọn loại phòng!" });
//     }

//     Room.create({ ten_phong, so_ghe, loai_phong, trang_thai }, (err, result) => {
//         if (err) return res.status(500).json({ message: "Lỗi khi tạo phòng", error: err });

//         const ma_phong = result.insertId;
//         const seatsPerRow = 10;
//         const totalRows = Math.ceil(so_ghe / seatsPerRow);
//         const seatData = [];
//         const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

//         for (let i = 0; i < totalRows; i++) {
//             for (let j = 1; j <= seatsPerRow; j++) {
//                 const currentCount = i * seatsPerRow + j;
//                 if (currentCount <= so_ghe) {
//                     const seatLabel = `${alphabet[i]}${j}`;
//                     const seatType = (alphabet[i] === 'A') ? 'VIP' : 'STANDARD';
//                     seatData.push([ma_phong, seatLabel, seatType, 'Hoạt động']);
//                 }
//             }
//         }

//         Room.createSeatsBulk(seatData, (errSeats) => {
//             if (errSeats) return res.status(500).json({ message: "Error creating seats", error: errSeats });
//             res.json({ message: `Created room ${ten_phong} with ${seatData.length} seats!` });
//         });
//     });
// };

// exports.updateRoom = (req, res) => {
//     Room.update(req.params.id, req.body, (err) => {
//         if (err) return res.status(500).json({ message: "Update failed" });
//         res.json({ message: "Update success" });
//     });
// };

// exports.deleteRoom = (req, res) => {
//     Room.delete(req.params.id, (err) => {
//         if (err) return res.status(500).json({ message: "Delete failed" });
//         res.json({ message: "Delete success" });
//     });
// };

// exports.getSeatsByRoom = (req, res) => {
//     Room.getSeats(req.params.id, (err, results) => {
//         if (err) return res.status(500).json({ message: "Error fetching seats" });
//         res.json(results);
//     });
// };
const Room = require("../models/roomModel");
const db = require("../config/db");

// Lấy danh sách ENUM trực tiếp từ Database
exports.getRoomTypes = (req, res) => {
    const sql = "SHOW COLUMNS FROM phong_chieu LIKE 'loai_phong'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi lấy loại phòng", error: err });

        // Bóc tách enum('2D','3D'...)
        const enumStr = results[0].Type;
        const matches = enumStr.match(/'([^']*)'/g);
        const types = matches.map(m => m.replace(/'/g, ''));

        res.json(types);
    });
};

exports.createRoom = (req, res) => {
    const { ten_phong, so_ghe, loai_phong, trang_thai } = req.body;

    // VALIDATION phía Server
    if (!ten_phong || ten_phong.trim() === "") {
        return res.status(400).json({ message: "Tên phòng không được để trống!" });
    }
    if (parseInt(so_ghe) <= 0) {
        return res.status(400).json({ message: "Số lượng ghế phải lớn hơn 0!" });
    }
    if (!loai_phong) {
        return res.status(400).json({ message: "Vui lòng chọn loại phòng!" });
    }

    Room.create({ ten_phong, so_ghe, loai_phong, trang_thai }, (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi tạo phòng", error: err });

        const ma_phong = result.insertId;
        const seatsPerRow = 10;
        const totalRows = Math.ceil(so_ghe / seatsPerRow);
        const seatData = [];
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (let i = 0; i < totalRows; i++) {
            for (let j = 1; j <= seatsPerRow; j++) {
                const currentCount = i * seatsPerRow + j;
                if (currentCount <= so_ghe) {
                    const seatLabel = `${alphabet[i]}${j}`;
                    const seatType = (alphabet[i] === 'A') ? 'VIP' : 'STANDARD';
                    seatData.push([ma_phong, seatLabel, seatType, 'Hoạt động']);
                }
            }
        }

        Room.createSeatsBulk(seatData, (errSeats) => {
            if (errSeats) return res.status(500).json({ message: "Lỗi tạo ghế", error: errSeats });
            res.json({ message: `Đã tạo phòng ${ten_phong} thành công!` });
        });
    });
};

// Giữ các hàm getAllRooms, updateRoom, deleteRoom, getSeatsByRoom cũ của em...
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