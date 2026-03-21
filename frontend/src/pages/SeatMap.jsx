import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit3, Save, X, Settings2, Columns, Plus } from 'lucide-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// Nếu Switch bị lỗi, em hãy thay dòng dưới bằng Checkbox thuần để test trước
import { Switch } from "@/components/ui/switch";

const SeatMap = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    const fetchSeats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/rooms/${id}/seats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const formattedData = response.data.map(seat => ({
                ...seat,
                has_aisle: seat.has_aisle === 1 || seat.has_aisle === true,
                has_aisle_horizontal: seat.has_aisle_horizontal === 1 || seat.has_aisle_horizontal === true
            }));

            const sortedData = formattedData.sort((a, b) => {
                if (a.hang !== b.hang) return a.hang.localeCompare(b.hang);
                return a.cot - b.cot;
            });

            setSeats(sortedData);
            setLoading(false);
        } catch (error) {
            toast.error("Lỗi tải dữ liệu");
            setLoading(false);
        }
    };

    useEffect(() => { fetchSeats(); }, [id]);

    const seatRows = (() => {
        const rows = {};
        seats.forEach(seat => {
            if (!rows[seat.hang]) rows[seat.hang] = [];
            rows[seat.hang].push(seat);
        });
        return rows;
    })();

    const handleAddNewSeat = (rowLabel) => {
        const seatsInRow = seatRows[rowLabel] || [];
        // Tìm số cột lớn nhất hiện tại của hàng đó để cộng thêm 1
        const maxCol = seatsInRow.length > 0
            ? Math.max(...seatsInRow.map(s => parseInt(s.cot)))
            : 0;

        const nextCol = maxCol + 1;
        const newSeatName = `${rowLabel}${nextCol}`;

        const newSeat = {
            ma_phong: id,
            hang: rowLabel,
            cot: nextCol,
            so_ghe: newSeatName,
            loai_ghe: 'STANDARD',
            trang_thai: 'Hoạt động',
            has_aisle: false,             // Mặc định không có lối đi dọc
            has_aisle_horizontal: false   // Mặc định không có lối đi ngang
        };

        setSeats([...seats, newSeat]);
        toast.success(`Đã thêm ghế ${newSeatName}`);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/rooms/${id}/seats`, { seats }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Đã lưu thiết kế!");
            setIsEditMode(false);
            fetchSeats();
        } catch (error) {
            toast.error("Lỗi khi lưu sơ đồ");
        }
    };

    const updateSeatDetail = (hang, cot, field, value) => {
        setSeats(prev => prev.map(seat =>
            (seat.hang === hang && seat.cot === cot) ? { ...seat, [field]: value } : seat
        ));
    };

    const toggleColumnAisle = (columnNum, value) => {
        setSeats(prev => prev.map(seat =>
            seat.cot === columnNum ? { ...seat, has_aisle: value } : seat
        ));
        toast.info("Đã thay đổi lối đi dọc");
    };

    const toggleRowAisleHorizontal = (rowLabel, value) => {
        setSeats(prev => prev.map(seat =>
            seat.hang === rowLabel ? { ...seat, has_aisle_horizontal: value } : seat
        ));
        toast.info(`Đã thay đổi lối đi ngang hàng ${rowLabel}`);
    };

    const getSeatStyles = (seat) => {
        switch (seat.loai_ghe) {
            case 'VIP': return 'bg-amber-100 border-amber-400 text-amber-700';
            case 'SWEETBOX': return 'bg-pink-100 border-pink-400 text-pink-700';
            default: return 'bg-white border-slate-200 text-slate-600';
        }
    };

    if (loading) return <div className="p-6 text-center">Đang tải...</div>;

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-sans">
            <div className="relative flex items-center justify-center mb-8">
                <button onClick={() => navigate(-1)} className="absolute left-0 p-1"><ArrowLeft size={24} /></button>
                <h1 className="text-2xl font-bold">Thiết kế sơ đồ - {seats[0]?.ten_phong}</h1>
            </div>

            <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <Settings2 size={16} /> Tổng ghế: <span className="text-blue-600">{seats.length}</span>
                </div>
                <div className="flex gap-2">
                    {!isEditMode ? (
                        <Button onClick={() => setIsEditMode(true)} variant="outline"><Edit3 size={16} className="mr-2" /> Sửa</Button>
                    ) : (
                        <Button onClick={handleSave} className="bg-emerald-600"><Save size={16} className="mr-2" /> Lưu</Button>
                    )}
                </div>
            </div>

            <div className="bg-white p-12 rounded-3xl border shadow-sm overflow-auto text-center">
                <div className="w-1/2 h-1 bg-slate-200 mx-auto mb-16"></div>
                <div className="flex flex-col gap-4 max-w-fit mx-auto">
                    {Object.keys(seatRows).sort().map(rowLabel => {
                        const isRowHasHorizontalAisle = seatRows[rowLabel].some(s => s.has_aisle_horizontal);

                        return (
                            <div
                                key={rowLabel}
                                className="flex items-center gap-6 relative"
                                style={{ marginBottom: isRowHasHorizontalAisle ? '40px' : '4px' }}
                            >
                                {/* Chỉ báo lối đi ngang mờ khi Edit */}
                                {isRowHasHorizontalAisle && isEditMode && (
                                    <div className="absolute -bottom-6 left-12 right-0 h-1 bg-purple-100 border-b border-purple-200 border-dashed"></div>
                                )}

                                <div className="w-6 font-bold text-slate-300 uppercase">{rowLabel}</div>
                                <div className="flex items-center">
                                    {seatRows[rowLabel].sort((a, b) => a.cot - b.cot).map((seat) => (
                                        <div
                                            key={`${seat.hang}-${seat.cot}`}
                                            style={{ marginRight: seat.has_aisle ? '40px' : '8px' }}
                                            className="relative"
                                        >
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <div className={`w-10 h-10 rounded-md border flex items-center justify-center text-[11px] font-bold transition-all ${getSeatStyles(seat)} ${isEditMode ? 'cursor-pointer hover:ring-2 ring-blue-400' : ''}`}>
                                                        {seat.so_ghe}
                                                    </div>
                                                </PopoverTrigger>
                                                {isEditMode && (
                                                    <PopoverContent className="w-64 p-4 shadow-xl border-slate-200 z-50">
                                                        <div className="grid gap-4">
                                                            <div className="font-bold border-b pb-2 text-sm">Cài đặt {seat.so_ghe}</div>

                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-medium">Lối đi bên phải</span>
                                                                <Switch
                                                                    checked={seat.has_aisle}
                                                                    onCheckedChange={(val) => updateSeatDetail(seat.hang, seat.cot, 'has_aisle', val)}
                                                                />
                                                            </div>

                                                            <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                                                                <div className="grid">
                                                                    <span className="text-[11px] font-bold text-purple-700">Lối đi phía dưới</span>
                                                                    <span className="text-[9px] text-purple-500 italic">Dãn hàng tiếp theo</span>
                                                                </div>
                                                                <Switch
                                                                    checked={seat.has_aisle_horizontal}
                                                                    onCheckedChange={(val) => updateSeatDetail(seat.hang, seat.cot, 'has_aisle_horizontal', val)}
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-1.5">
                                                                <Button variant="outline" className="h-7 text-[10px]" onClick={() => toggleColumnAisle(seat.cot, !seat.has_aisle)}>Cả cột {seat.cot}</Button>
                                                                <Button variant="outline" className="h-7 text-[10px] border-purple-200" onClick={() => toggleRowAisleHorizontal(seat.hang, !seat.has_aisle_horizontal)}>Cả hàng {seat.hang}</Button>
                                                            </div>

                                                            <div className="grid gap-1">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loại ghế</span>
                                                                <div className="flex gap-1">
                                                                    {['STANDARD', 'VIP', 'SWEETBOX'].map(type => (
                                                                        <Button key={type} size="sm" variant={seat.loai_ghe === type ? "default" : "outline"} className="h-7 text-[9px] flex-1" onClick={() => updateSeatDetail(seat.hang, seat.cot, 'loai_ghe', type)}>{type}</Button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </PopoverContent>
                                                )}
                                            </Popover>
                                        </div>
                                    ))}
                                    {isEditMode && (
                                        <button
                                            onClick={() => handleAddNewSeat(rowLabel)}
                                            className="w-10 h-10 ml-2 rounded-md border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-500 transition-all"
                                            title={`Thêm ghế vào hàng ${rowLabel}`}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SeatMap;