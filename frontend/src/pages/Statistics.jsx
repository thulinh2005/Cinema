import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { DollarSign, Ticket, Calendar, TrendingUp } from "lucide-react";
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";

const Statistics = () => {
  const [overview, setOverview] = useState({ doanhThuHomNay: 0, veBanHomNay: 0, tongVeBan: 0, tongDoanhThu: 0 });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Lấy TỔNG QUAN
    axios.get("http://localhost:5000/api/thong-ke/tong-quan")
      .then(res => setOverview(res.data))
      .catch(err => {
        console.error("Lỗi lấy tổng quan:", err);
        toast.error("Không thể tải dữ liệu tổng quan");
      });

    // Lấy dữ liệu biểu đồ
    fetchChartData("", "");
  }, []);

  const fetchChartData = (start, end) => {
    axios.get("http://localhost:5000/api/thong-ke/doanh-thu-thoi-gian", {
      params: { startDate: start, endDate: end }
    })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.chartData || []);
        setChartData(data);
      })
      .catch(err => {
        console.error("Lỗi lấy biểu đồ:", err);
        toast.error("Không thể tải dữ liệu biểu đồ");
      });
  };

  const handleFilter = () => {
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        toast.error("Từ ngày phải nhỏ hơn hoặc bằng Đến ngày!");
        return;
      }
    }
    fetchChartData(startDate, endDate);
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    fetchChartData("", "");
  };

  const formatCurrency = (value) => 
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const doanhThu = payload.find(p => p.dataKey === "doanhThu")?.value || 0;
      const veBan = payload.find(p => p.dataKey === "soLuongVe")?.value || 0;
      
      return (
        <div className="bg-white p-4 border border-slate-200 shadow-lg rounded-xl min-w-[180px]">
          <p className="font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-500 text-sm flex items-center gap-1.5"><DollarSign size={14} className="text-blue-500"/> Doanh thu:</span>
              <span className="text-blue-600 font-bold">{formatCurrency(doanhThu)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-500 text-sm flex items-center gap-1.5"><Ticket size={14} className="text-emerald-500"/> Số lượng vé:</span>
              <span className="text-emerald-600 font-bold">{veBan} vé</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Thống kê</h1>
          <p className="mt-2 text-[17px] text-slate-600">Tổng quan tình hình kinh doanh</p>
        </div>

        {/* ROW 1: TỔNG QUAN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="h-14 w-14 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Doanh thu hôm nay</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(overview.doanhThuHomNay)}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="h-14 w-14 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Ticket size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Vé bán hôm nay</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{overview.veBanHomNay} vé</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="h-14 w-14 shrink-0 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Tổng doanh thu</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(overview.tongDoanhThu)}</h3>
            </div>
          </div>
        </div>

        {/* ROW 2: BIỂU ĐỒ KẾT HỢP DOANH THU VÀ VÉ */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={24} />
              Biểu đồ Doanh thu & Quản lý vé bán
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
              {/* Date Filter */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 flex-1 sm:flex-none focus-within:border-blue-500 transition-colors">
                <span className="text-sm font-medium text-slate-600 whitespace-nowrap pl-2">Từ:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 w-full bg-transparent text-sm outline-none text-slate-700 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 flex-1 sm:flex-none focus-within:border-blue-500 transition-colors">
                <span className="text-sm font-medium text-slate-600 whitespace-nowrap pl-2">Đến:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11 w-full bg-transparent text-sm outline-none text-slate-700 cursor-pointer"
                />
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleFilter}
                  className="flex-1 sm:flex-none px-6 h-11 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition"
                >
                  Lọc
                </button>
                {(startDate || endDate) && (
                  <button 
                    onClick={handleClearFilter}
                    className="flex-1 sm:flex-none px-6 h-11 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition"
                  >
                    Xóa lọc
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            {chartData.length > 0 ? (
              <div className="flex-1 min-h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    
                    <XAxis 
                      dataKey="timeLabel" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} 
                      dy={15} 
                    />
                    
                    {/* Trục Y cho Doanh thu (Bên trái) */}
                    <YAxis 
                      yAxisId="left" 
                      tickFormatter={(val) => (val >= 1000000 ? (val / 1000000).toFixed(1) + 'Tr' : (val / 1000).toFixed(0) + 'k')} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#3b82f6', fontSize: 13, fontWeight: 600}} 
                      dx={-15} 
                    />
                    
                    {/* Trục Y cho Số vé (Bên phải) */}
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#10b981', fontSize: 13, fontWeight: 600}} 
                      dx={15} 
                    />
                    
                    <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                    <Legend wrapperStyle={{paddingTop: '30px'}} verticalAlign="bottom" height={36}/>
                    
                    {/* Cột hiển thị số vé */}
                    <Bar yAxisId="right" dataKey="soLuongVe" name="Số lượng vé bán" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                    
                    {/* Đường nét hiển thị doanh thu */}
                    <Area yAxisId="left" type="monotone" dataKey="doanhThu" name="Doanh thu VNĐ" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
                <TrendingUp size={48} className="mb-4 text-slate-200" />
                <p className="text-lg">Không có dữ liệu trong khoảng thời gian này.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Statistics;
