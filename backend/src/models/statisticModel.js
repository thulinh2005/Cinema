const db = require('../config/db');

const queryPromise = (sql, args = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const statisticModel = {
    getDashboardData: async ({ filter, startDate, endDate }) => {
        let dateFilter = "";
        let ticketDateFilter = "";

        if (filter === "custom" && startDate && endDate) {
            dateFilter = `WHERE DATE(hd.ngay_lap) >= ${db.escape(startDate)} AND DATE(hd.ngay_lap) <= ${db.escape(endDate)}`;
            ticketDateFilter = `AND DATE(hd.ngay_lap) >= ${db.escape(startDate)} AND DATE(hd.ngay_lap) <= ${db.escape(endDate)}`;
        } else if (filter === "7days") {
            dateFilter = "WHERE hd.ngay_lap >= NOW() - INTERVAL 7 DAY";
            ticketDateFilter = "AND hd.ngay_lap >= NOW() - INTERVAL 7 DAY";
        } else if (filter === "month") {
            dateFilter = "WHERE MONTH(hd.ngay_lap) = MONTH(CURRENT_DATE) AND YEAR(hd.ngay_lap) = YEAR(CURRENT_DATE)";
            ticketDateFilter = "AND MONTH(hd.ngay_lap) = MONTH(CURRENT_DATE) AND YEAR(hd.ngay_lap) = YEAR(CURRENT_DATE)";
        } else if (filter === "year") {
            dateFilter = "WHERE YEAR(hd.ngay_lap) = YEAR(CURRENT_DATE)";
            ticketDateFilter = "AND YEAR(hd.ngay_lap) = YEAR(CURRENT_DATE)";
        }

        const totalRevSql = `
            SELECT SUM(
                IFNULL(sp.total_sp, 0) + IFNULL(v.total_ve, 0)
            ) AS tong_doanh_thu
            FROM hoa_don hd
            LEFT JOIN (
                SELECT ma_hd, SUM(so_luong * don_gia) AS total_sp
                FROM chi_tiet_hoa_don_sp
                GROUP BY ma_hd
            ) sp ON hd.ma_hd = sp.ma_hd
            LEFT JOIN (
                SELECT ma_hd, SUM(gia_ve) AS total_ve
                FROM ve
                WHERE trang_thai = 'DA_THANH_TOAN'
                GROUP BY ma_hd
            ) v ON hd.ma_hd = v.ma_hd
            ${dateFilter};
        `;

        const todayRevSql = `
            SELECT SUM(
                IFNULL(sp.total_sp, 0) + IFNULL(v.total_ve, 0)
            ) AS doanh_thu_hom_nay
            FROM hoa_don hd
            LEFT JOIN (
                SELECT ma_hd, SUM(so_luong * don_gia) AS total_sp
                FROM chi_tiet_hoa_don_sp
                GROUP BY ma_hd
            ) sp ON hd.ma_hd = sp.ma_hd
            LEFT JOIN (
                SELECT ma_hd, SUM(gia_ve) AS total_ve
                FROM ve
                WHERE trang_thai = 'DA_THANH_TOAN'
                GROUP BY ma_hd
            ) v ON hd.ma_hd = v.ma_hd
            WHERE DATE(hd.ngay_lap) = CURRENT_DATE;
        `;

        const totalTicketsSql = `
            SELECT COUNT(v.ma_ve) AS tong_ve
            FROM ve v
            LEFT JOIN hoa_don hd ON v.ma_hd = hd.ma_hd
            WHERE v.trang_thai = 'DA_THANH_TOAN' ${ticketDateFilter};
        `;

        const chartSql = `
            SELECT 
                DATE(hd.ngay_lap) AS ngay,
                SUM(
                    IFNULL(sp.total_sp, 0) + IFNULL(v.total_ve, 0)
                ) AS doanh_thu
            FROM hoa_don hd
            LEFT JOIN (
                SELECT ma_hd, SUM(so_luong * don_gia) AS total_sp
                FROM chi_tiet_hoa_don_sp
                GROUP BY ma_hd
            ) sp ON hd.ma_hd = sp.ma_hd
            LEFT JOIN (
                SELECT ma_hd, SUM(gia_ve) AS total_ve
                FROM ve
                WHERE trang_thai = 'DA_THANH_TOAN'
                GROUP BY ma_hd
            ) v ON hd.ma_hd = v.ma_hd
            ${dateFilter}
            GROUP BY DATE(hd.ngay_lap)
            ORDER BY ngay ASC;
        `;

        try {
            const [totalRevRes] = await queryPromise(totalRevSql);
            const [todayRevRes] = await queryPromise(todayRevSql);
            const [totalTicketsRes] = await queryPromise(totalTicketsSql);
            const chartRes = await queryPromise(chartSql);

            console.log("=== DB QUERY RESULTS ===");
            console.log(`Filter Info: ${JSON.stringify({ filter, startDate, endDate })}`);
            console.log("Tổng doanh thu:", totalRevRes);
            console.log("Doanh thu hôm nay:", todayRevRes);
            console.log("Tổng vé:", totalTicketsRes);
            console.log("Biểu đồ:", chartRes);
            console.log("========================");

            const tongDoanhThu = totalRevRes && totalRevRes.tong_doanh_thu ? Number(totalRevRes.tong_doanh_thu) : 0;
            const doanhThuHomNay = todayRevRes && todayRevRes.doanh_thu_hom_nay ? Number(todayRevRes.doanh_thu_hom_nay) : 0;
            const tongVe = totalTicketsRes && totalTicketsRes.tong_ve ? Number(totalTicketsRes.tong_ve) : 0;

            const bieuDo = Array.isArray(chartRes)
                ? chartRes.map(item => ({
                    ngay: item.ngay || "Unknown",
                    doanh_thu: item.doanh_thu ? Number(item.doanh_thu) : 0
                }))
                : [];

            return {
                tongDoanhThu,
                doanhThuHomNay,
                tongVe,
                bieuDo
            };
        } catch (error) {
            console.error("Lỗi khi chạy query thống kê:", error);
            throw error;
        }
    }
};

module.exports = statisticModel;
