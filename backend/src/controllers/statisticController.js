const statisticModel = require('../models/statisticModel');

const statisticController = {
    getDashboardSummary: async (req, res) => {
        try {
            const filter = req.query.filter || 'all';
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;

            const data = await statisticModel.getDashboardData({ filter, startDate, endDate });
            res.json(data);
        } catch (error) {
            console.error("Lỗi getDashboardSummary:", error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    }
};

module.exports = statisticController;
