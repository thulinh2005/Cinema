const Room = require("../models/roomModel");

exports.getAllRooms = (req, res) => {
    const { search } = req.query;
    Room.getAll(search, (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching rooms", error: err });
        res.json(results);
    });
};

exports.createRoom = (req, res) => {
    const { ten_phong, so_ghe, loai_phong, trang_thai } = req.body;

    Room.create({ ten_phong, so_ghe, loai_phong, trang_thai }, (err, result) => {
        if (err) return res.status(500).json({ message: "Error creating room", error: err });

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
            if (errSeats) return res.status(500).json({ message: "Error creating seats", error: errSeats });
            res.json({ message: `Created room ${ten_phong} with ${seatData.length} seats!` });
        });
    });
};

exports.updateRoom = (req, res) => {
    Room.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).json({ message: "Update failed" });
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