import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Pencil, Trash2 } from 'lucide-react';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    // Hàm lấy dữ liệu từ Backend
    const fetchRooms = async () => {
        try {
            const token = localStorage.getItem('token');
            // Gửi kèm tham số search lên API
            const response = await axios.get(`http://localhost:5000/api/rooms?search=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(response.data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu phòng:", error);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [searchTerm]); // Mỗi khi gõ chữ vào ô search, useEffect sẽ chạy lại

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Quản lý phòng chiếu</h1>

                {/* Nút thêm phòng mới */}
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus size={18} /> Thêm phòng
                </button>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Tìm tên phòng..."
                    className="pl-10 pr-4 py-2 w-full max-w-md border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Bảng danh sách */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Mã phòng</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tên phòng</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Loại</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {rooms.map((room) => (
                            <tr key={room.ma_phong} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{room.ma_phong}</td>
                                <td className="px-6 py-4 text-sm text-slate-900 font-semibold">{room.ten_phong}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${room.loai_phong === 'IMAX' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {room.loai_phong}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-center">
                                    <div className="flex justify-center gap-3">
                                        {/* Nút xem sơ đồ ghế */}
                                        <button
                                            onClick={() => navigate(`/admin/rooms/${room.ma_phong}/seats`)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Xem sơ đồ ghế"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                                            <Pencil size={18} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Rooms;