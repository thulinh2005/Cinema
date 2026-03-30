const ticketModel = require("../models/ticketModel");

// ================= GET ALL TICKETS & STATS =================
exports.getTickets = (req, res) => {
    const { ma_phim, ma_phong, ma_suat_chieu } = req.query;
    
    const filters = {
        ma_phim: ma_phim || null,
        ma_phong: ma_phong || null,
        ma_suat_chieu: ma_suat_chieu || null
    };

    // Get Tickets
    ticketModel.getAll(filters, (err, tickets) => {
        if (err) {
            console.error("❌ Error fetching tickets:", err.message);
            return res.status(500).json({ message: "Lỗi lấy danh sách vé" });
        }

        // Get Stats
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

// ================= UPDATE TICKET =================
exports.updateTicket = (req, res) => {
    const { id } = req.params;
    const { gia_ve, trang_thai } = req.body;

    // Validate fields
    if (gia_ve === undefined || gia_ve === null || gia_ve === "") {
        return res.status(400).json({ message: "Giá vé không được bỏ trống" });
    }

    if (!trang_thai || trang_thai.trim() === "") {
        return res.status(400).json({ message: "Trạng thái không được bỏ trống" });
    }

    ticketModel.update(id, { gia_ve, trang_thai }, (err) => {
        if (err) {
            console.error("❌ Error updating ticket:", err.message);
            return res.status(500).json({ message: "Lỗi cập nhật vé" });
        }
        res.json({ message: "Cập nhật vé thành công" });
    });
};

// ================= DELETE TICKET =================
exports.deleteTicket = (req, res) => {
    const { id } = req.params;

    ticketModel.delete(id, (err) => {
        if (err) {
            console.error("❌ Error deleting ticket:", err.message);
            return res.status(500).json({ message: "Lỗi xóa vé" });
        }
        res.json({ message: "Xóa vé thành công" });
    });
};
