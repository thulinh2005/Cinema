import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Ticket as TicketIcon, CalendarDays } from 'lucide-react';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const InvoiceStatistics = () => {
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [totalTickets, setTotalTickets] = useState(0);
    const [revenueByDay, setRevenueByDay] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            let url = `http://localhost:5000/api/thong-ke/dashboard?filter=${filter}`;

            // Xử lý cấp ngày cụ thể nếu lọt vào custom
            if (filter === 'custom' && startDate && endDate) {
                if (startDate > endDate) {
                    toast.error("Khoảng thời gian không hợp lệ. Ngày bắt đầu phải trước ngày kết thúc!");
                    setLoading(false);
                    return;
                }
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }

            const res = await axios.get(url);
            const data = res.data;

            setTotalRevenue(data?.tongDoanhThu || 0);
            setTodayRevenue(data?.doanhThuHomNay || 0);
            setTotalTickets(data?.tongVe || 0);
            setRevenueByDay(data?.bieuDo || []);

        } catch (error) {
            console.error("Lỗi lấy thống kê:", error);
            toast.error("Không thể tải thông tin thống kê!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [filter, startDate, endDate]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border text-sm border-slate-200 p-3 rounded-xl shadow-lg">
                    <p className="font-semibold text-slate-700 capitalize">
                        {label && label !== "Unknown" ? new Date(label).toLocaleDateString('vi-VN') : "Không xác định"}
                    </p>
                    <p className="text-blue-600 font-bold mt-1">
                        Doanh thu: {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    const getDynamicLabel = () => {
        switch (filter) {
            case '7days': return "Doanh thu (7 ngày)";
            case 'month': return "Doanh thu (Tháng)";
            case 'year': return "Doanh thu (Năm)";
            case 'custom': return "Doanh thu (Tùy chọn)";
            default: return "Tổng doanh thu";
        }
    };

    const getTicketDynamicLabel = () => {
        switch (filter) {
            case '7days': return "Số vé (7 ngày)";
            case 'month': return "Số vé (Tháng)";
            case 'year': return "Số vé (Năm)";
            case 'custom': return "Số vé (Tùy chọn)";
            default: return "Tổng vé đã bán";
        }
    }

    return (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thống kê tổng quan</h1>
                </div>

                {/* Trình đơn lọc thời gian */}
                <div className="flex flex-col sm:flex-row items-center gap-3">

                    {/* Bảng nhập 2 khoảng ngày - Dựa vào thẻ type "date" của quản lý suất chiếu */}
                    {filter === 'custom' && (
                        <div className="flex items-center space-x-2 bg-white rounded-xl p-1.5 shadow-sm border border-slate-200">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 cursor-pointer"
                            />
                            <span className="text-slate-400 font-medium">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 cursor-pointer"
                            />
                        </div>
                    )}

                    <div className="flex items-center space-x-2 bg-white rounded-xl p-1.5 shadow-sm border border-slate-200">
                        <div className="pl-3 pr-2 flex items-center text-slate-400">
                            <CalendarDays size={18} />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-transparent text-sm font-semibold text-slate-700 py-2 pr-6 outline-none cursor-pointer hover:bg-slate-50 transition rounded-lg"
                        >
                            <option value="all">Toàn thời gian</option>
                            <option value="7days">7 ngày gần nhất</option>
                            <option value="month">Tháng này</option>
                            <option value="year">Năm nay</option>
                            <option value="custom">Tùy chọn khoảng ngày...</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Kpis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
                            {getDynamicLabel()}
                        </p>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {formatCurrency(totalRevenue)}
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex justify-center items-center">
                        <TrendingUp className="text-blue-600 w-6 h-6" />
                    </div>
                </div>

                {/* Today Revenue */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Doanh thu hôm nay</p>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {formatCurrency(todayRevenue)}
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex justify-center items-center">
                        <TrendingUp className="text-green-600 w-6 h-6" />
                    </div>
                </div>

                {/* Total Tickets */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
                            {getTicketDynamicLabel()}
                        </p>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {Intl.NumberFormat('vi-VN').format(totalTickets)} <span className="text-lg font-medium text-slate-500">vé</span>
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex justify-center items-center">
                        <TicketIcon className="text-purple-600 w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Biểu đồ doanh thu theo thời gian</h2>
                {loading ? (
                    <div className="h-80 flex items-center justify-center text-slate-400">Đang tải biểu đồ...</div>
                ) : revenueByDay.length > 0 ? (
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByDay} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="ngay"
                                    tickFormatter={(val) => {
                                        try {
                                            if (!val || val === "Unknown") return "";
                                            return new Date(val).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                                        } catch (e) {
                                            return val;
                                        }
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickFormatter={(val) => val.toLocaleString('vi-VN')}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dx={-10}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                                <Bar
                                    dataKey="doanh_thu"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-80 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                        Không có giao dịch nào xuất hiện trong khoảng thời gian này
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceStatistics;
