const ticketModel = require("../models/ticketModel");

exports.getTickets = (req, res) => {
    const { ma_phim, ma_phong, ma_suat_chieu } = req.query;

    const filters = {
        ma_phim: ma_phim || null,
        ma_phong: ma_phong || null,
        ma_suat_chieu: ma_suat_chieu || null
    };

    ticketModel.getAll(filters, (err, tickets) => {
        if (err) {
            console.error("❌ Error fetching tickets:", err.message);
            return res.status(500).json({ message: "Lỗi lấy danh sách vé" });
        }

        ticketModel.getStats(filters, (errStats, statsResults) => {
            if (errStats) {
                console.error("❌ Error fetching ticket stats:", errStats.message);
                return res.status(500).json({ message: "Lỗi lấy thống kê vé" });
            }

            const stats = statsResults[0] || { tong_da_ban: 0, tong_chua_ban: 0 };

            res.json({
                tickets,
                stats
            });
        });
    });
};
