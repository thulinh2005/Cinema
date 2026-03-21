import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit3, Save, X, Settings2, AlertCircle, Lock, Plus } from 'lucide-react';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const SeatMap = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [cols, setCols] = useState(10);

    const fetchSeats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/rooms/${id}/seats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSeats(response.data);
            setLoading(false);
        } catch (error) {
            toast.error("Không thể tải sơ đồ ghế");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeats();
    }, [id]);

    const groupSeatsByRow = () => {
        const rows = {};
        seats.forEach(seat => {
            const rowLabel = seat.so_ghe.charAt(0);
            if (!rows[rowLabel]) rows[rowLabel] = [];
            rows[rowLabel].push(seat);
        });
        return rows;
    };

    const seatRows = groupSeatsByRow();

    const handleAddNewSeat = (rowLabel) => {
        if (seats.length === 0) return toast.error("Hết ghế để điều động!");

        // 1. Xác định tên ghế mới (ví dụ: A12)
        const currentInRow = seats.filter(s => s.so_ghe.startsWith(rowLabel));
        const newName = `${rowLabel}${currentInRow.length + 1}`;

        if (seats.find(s => s.so_ghe === newName)) return toast.error("Ghế đã tồn tại!");

        setSeats(prev => {
            const updatedArray = [...prev];
            const seatToMove = updatedArray.pop(); // Lấy ghế cuối cùng ra khỏi mảng

            const transformedSeat = {
                ...seatToMove,
                so_ghe: newName,
                loai_ghe: 'STANDARD',
                trang_thai: 'Hoạt động'
            };

            // Trả về mảng mới. Hàm groupSeatsByRow sẽ tự xếp nó vào đúng hàng
            return [...updatedArray, transformedSeat];
        });
        toast.info(`Đã chuyển ghế cuối cùng thành ${newName}`);
    };
    // 2. Hàm Lưu: Đồng bộ mượt mà
    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');

            // Gửi toàn bộ mảng seats (đã có ma_ghe thật bên trong)
            await axios.put(`http://localhost:5000/api/rooms/${id}/seats`,
                { seats: seats },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Đã đồng bộ sơ đồ thực tế!");
            setIsEditMode(false);

            // Refresh lại data từ server để đảm bảo thứ tự hiển thị chuẩn
            const response = await axios.get(`http://localhost:5000/api/rooms/${id}/seats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSeats(response.data);
        } catch (error) {
            toast.error("Lỗi khi lưu sơ đồ");
        }
    };
    const handleRemoveSeat = (ma_ghe) => {
        const seatToRemove = seats.find(s => s.ma_ghe === ma_ghe);
        if (!seatToRemove) return;

        // Xác định tên ghế cuối cùng hiện tại trong DB (ví dụ J10) để tính tên ghế trả về
        // Đơn giản nhất là ta chỉ cần đổi tên nó thành một ký hiệu "GHẾ TRỐNG" hoặc hàng cuối cùng tiếp theo
        const lastRowLabel = 'J'; // Giả sử hàng J là cuối

        setSeats(prev => {
            const otherSeats = prev.filter(s => s.ma_ghe !== ma_ghe);
            const restoredSeat = {
                ...seatToRemove,
                so_ghe: `${lastRowLabel}${Date.now() % 100}`, // Đổi tên tạm để đẩy xuống cuối
                loai_ghe: 'STANDARD',
                trang_thai: 'Hoạt động'
            };
            return [...otherSeats, restoredSeat];
        });
        toast.warning("Đã đưa ghế về vị trí cuối phòng");
    };

    const updateSeatDetail = (ma_ghe, field, value) => {
        setSeats(prev => prev.map(seat =>
            seat.ma_ghe === ma_ghe ? { ...seat, [field]: value } : seat
        ));
    };

    const getSeatStyles = (seat) => {
        if (seat.trang_thai === 'Bảo trì') return 'bg-slate-200 border-slate-400 text-slate-500 opacity-60';
        if (seat.trang_thai === 'Khóa') return 'bg-red-50 border-red-200 text-red-400';
        switch (seat.loai_ghe) {
            case 'VIP': return 'bg-amber-100 border-amber-400 text-amber-700 shadow-amber-50';
            case 'SWEETBOX': return 'bg-pink-100 border-pink-400 text-pink-700 shadow-pink-50';
            default: return 'bg-white border-slate-200 text-slate-600';
        }
    };

    if (loading) return <div className="p-6 text-center italic text-slate-400">Đang tải sơ đồ ghế...</div>;

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="relative flex items-center justify-center mb-8">
                <button onClick={() => navigate(-1)} className="absolute left-0 text-slate-400 hover:text-blue-600 p-1 transition-colors"><ArrowLeft size={24} /></button>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sơ đồ ghế - {seats[0]?.ten_phong || id}</h1>
            </div>

            <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <Label className="flex items-center gap-2 text-slate-600"><Settings2 size={16} /> Ghế tối đa/Hàng:</Label>
                    <Input type="number" value={cols} onChange={(e) => setCols(parseInt(e.target.value) || 1)} className="w-20 h-9 font-bold" disabled={!isEditMode} />
                </div>
                <div className="flex gap-2">
                    {!isEditMode ? (
                        <Button onClick={() => setIsEditMode(true)} variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50"><Edit3 size={16} className="mr-2" /> Chỉnh sửa sơ đồ</Button>
                    ) : (
                        <>
                            <Button onClick={() => { setIsEditMode(false); fetchSeats(); }} variant="ghost" className="text-slate-500"><X size={16} className="mr-2" /> Hủy</Button>
                            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 shadow-md"><Save size={16} className="mr-2" /> Lưu thay đổi</Button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm overflow-auto">
                <div className="text-center mb-16">
                    <div className="w-1/2 h-1.5 bg-slate-200 mx-auto rounded-full shadow-inner relative">
                        <div className="absolute inset-0 bg-blue-400/10 blur-md rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-[0.3em] font-bold">Màn hình</p>
                </div>

                <div className="flex flex-col gap-6 max-w-fit mx-auto">
                    {Object.keys(seatRows).sort().map(rowLabel => (
                        <div key={rowLabel} className="flex items-center gap-6">
                            <div className="w-6 font-black text-slate-300 text-lg uppercase">{rowLabel}</div>
                            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                                {seatRows[rowLabel].map((seat) => (
                                    <Popover key={seat.ma_ghe}>
                                        <PopoverTrigger asChild>
                                            <div className={`relative w-10 h-10 rounded-md flex items-center justify-center border text-[11px] font-bold transition-all shadow-sm ${getSeatStyles(seat)} ${isEditMode ? 'cursor-pointer hover:scale-110 hover:ring-2 ring-blue-400 z-10' : 'cursor-default'}`}>
                                                {seat.so_ghe}
                                                {seat.trang_thai === 'Bảo trì' && <AlertCircle size={10} className="absolute -top-1.5 -right-1.5 text-slate-500 bg-white rounded-full shadow-sm" />}
                                                {seat.trang_thai === 'Khóa' && <Lock size={10} className="absolute -top-1.5 -right-1.5 text-red-500 bg-white rounded-full shadow-sm" />}
                                            </div>
                                        </PopoverTrigger>
                                        {isEditMode && (
                                            <PopoverContent className="w-52 p-3 shadow-xl border-slate-200">
                                                <div className="grid gap-3 text-sm">
                                                    <div className="font-bold text-slate-900 border-b pb-2 flex justify-between">
                                                        <span>Ghế {seat.so_ghe}</span>
                                                    </div>
                                                    <div className="grid gap-1.5">
                                                        <p className="text-[10px] uppercase text-slate-400 font-black">Loại ghế</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {['STANDARD', 'VIP', 'SWEETBOX'].map(type => (
                                                                <Button key={type} size="sm" variant={seat.loai_ghe === type ? "default" : "outline"} className="h-7 text-[10px] px-2 flex-1" onClick={() => updateSeatDetail(seat.ma_ghe, 'loai_ghe', type)}>{type}</Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="grid gap-1.5 mt-1">
                                                        <p className="text-[10px] uppercase text-slate-400 font-black">Trạng thái</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {['Hoạt động', 'Bảo trì', 'Khóa'].map(status => (
                                                                <Button key={status} size="sm" variant={seat.trang_thai === status ? "secondary" : "outline"} className="h-7 text-[10px] px-2 flex-1" onClick={() => updateSeatDetail(seat.ma_ghe, 'trang_thai', status)}>{status}</Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="w-full mt-4 h-8 text-[10px]"
                                                    onClick={() => handleRemoveSeat(seat.ma_ghe)}
                                                >
                                                    Xóa ghế khỏi hàng
                                                </Button>
                                            </PopoverContent>
                                        )}
                                    </Popover>
                                ))}
                                {isEditMode && seatRows[rowLabel].length < cols && (
                                    <button
                                        onClick={() => handleAddNewSeat(rowLabel)}
                                        className="w-10 h-10 rounded-md border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-blue-300 hover:text-blue-400 transition-all"
                                    ><Plus size={16} /></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-20 flex flex-wrap justify-center gap-8 border-t border-slate-100 pt-10">
                    <LegendBox color="bg-white" border="border-slate-200" label="Standard" />
                    <LegendBox color="bg-amber-100" border="border-amber-400" label="VIP" />
                    <LegendBox color="bg-pink-100" border="border-pink-400" label="Sweetbox" />
                    <LegendBox color="bg-slate-200" border="border-slate-400" label="Bảo trì" icon={<AlertCircle size={12} />} />
                    <LegendBox color="bg-red-50" border="border-red-200" label="Khóa" icon={<Lock size={12} />} />
                </div>
            </div>
        </div>
    );
};

const LegendBox = ({ color, border, label, icon }) => (
    <div className="flex items-center gap-2.5">
        <div className={`w-4 h-4 ${color} ${border} border rounded-sm relative flex items-center justify-center shadow-sm text-slate-500`}>{icon}</div>
        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
    </div>
);

export default SeatMap;