import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Armchair } from 'lucide-react';

const SeatMap = () => {
    const { id } = useParams(); // Lấy ma_phong từ URL (ví dụ: 101)
    const navigate = useNavigate();
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/api/rooms/${id}/seats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSeats(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi lấy sơ đồ ghế:", error);
                setLoading(false);
            }
        };
        fetchSeats();
    }, [id]);

    if (loading) return <div className="p-6 text-center">Đang tải sơ đồ ghế...</div>;

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Thanh điều hướng quay lại */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
            >
                <ArrowLeft size={20} /> Quay lại danh sách phòng
            </button>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-slate-800">Sơ đồ ghế - Phòng {id}</h1>
                    <div className="w-2/3 h-2 bg-slate-300 mx-auto mt-6 rounded-full shadow-inner"></div>
                    <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest">Màn hình</p>
                </div>

                {/* Grid hiển thị ghế */}
                <div className="grid grid-cols-10 gap-3 max-w-4xl mx-auto">
                    {seats.map((seat) => (
                        <div
                            key={seat.ma_ghe}
                            className="flex flex-col items-center gap-1"
                        >
                            <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all cursor-pointer
                                    ${seat.loai_ghe === 'VIP'
                                        ? 'bg-amber-100 border-amber-400 text-amber-700'
                                        : 'bg-slate-100 border-slate-300 text-slate-600'} 
                                    hover:scale-110`}
                                title={`Loại: ${seat.loai_ghe}`}
                            >
                                <Armchair size={18} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{seat.so_ghe}</span>
                        </div>
                    ))}
                </div>

                {/* Chú thích màu sắc */}
                <div className="mt-12 flex justify-center gap-6 border-t pt-6">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded"></div>
                        <span className="text-sm text-slate-600">Ghế thường</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-100 border border-amber-400 rounded"></div>
                        <span className="text-sm text-slate-600">Ghế VIP</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatMap;