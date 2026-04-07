import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit3, Save, X, Settings2, Columns, Plus, Trash2, AlertCircle, Lock, Layout } from 'lucide-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
        const maxCol = seatsInRow.length > 0 ? Math.max(...seatsInRow.map(s => parseInt(s.cot))) : 0;
        const nextCol = maxCol + 1;
        const newSeatName = `${rowLabel}${nextCol}`;

        const newSeat = {
            ma_phong: id, hang: rowLabel, cot: nextCol, so_ghe: newSeatName,
            loai_ghe: 'STANDARD', trang_thai: 'Hoạt động', has_aisle: false, has_aisle_horizontal: false
        };

        setSeats([...seats, newSeat]);
        toast.success(`Đã thêm ghế ${newSeatName}`);
    };

    const handleRemoveSeat = (hang, cot) => {
        setSeats(prev => prev.filter(s => !(s.hang === hang && s.cot === cot)));
        toast.warning(`Đã tạm xóa ghế tại ${hang}${cot}`);
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

    const applyTypeToRow = (rowLabel, type) => {
        setSeats(prev => prev.map(seat =>
            seat.hang === rowLabel ? { ...seat, loai_ghe: type } : seat
        ));
        toast.info(`Đã chuyển hàng ${rowLabel} sang loại ${type}`);
    };

    const toggleColumnAisle = (columnNum, value) => {
        setSeats(prev => prev.map(seat =>
            seat.cot === columnNum ? { ...seat, has_aisle: value } : seat
        ));
    };

    const toggleRowAisleHorizontal = (rowLabel, value) => {
        setSeats(prev => prev.map(seat =>
            seat.hang === rowLabel ? { ...seat, has_aisle_horizontal: value } : seat
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

    if (loading) return <div className="p-6 text-center italic text-slate-400">Đang tải sơ đồ...</div>;

    return (
        <div className="p-5 bg-white-50 min-h-screen font-sans">
            <div className="relative flex items-center justify-center mb-4">
                <button onClick={() => navigate(-1)} className="absolute left-0 text-slate-400 hover:text-blue-600 p-1 transition-colors"><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-bold text-slate-800">Sơ đồ ghế - {seats[0]?.ten_phong || id}</h1>
            </div>

            <div className="max-w-5xl mx-auto mb-4 flex items-center justify-between bg-white p-3 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <Settings2 size={16} /> Tổng số ghế: <span className="text-blue-600">{seats.length}</span>
                </div>
                <div className="flex gap-2">
                    {!isEditMode ? (
                        <Button onClick={() => setIsEditMode(true)} variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                            <Edit3 size={16} className="mr-2" /> Chỉnh sửa sơ đồ
                        </Button>
                    ) : (
                        <>
                            <Button onClick={() => { setIsEditMode(false); fetchSeats(); }} variant="ghost" className="text-slate-500">
                                <X size={16} className="mr-2" /> Hủy
                            </Button>
                            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
                                <Save size={16} className="mr-2" /> Lưu sơ đồ
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm overflow-auto text-center mb-10">
                <div className="text-center mb-16 space-y-3">
                    <div className="w-1/2 h-1.5 bg-slate-200 mx-auto rounded-full relative">
                        <div className="absolute inset-0 bg-blue-400/10 blur-md rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">
                        Màn hình
                    </p>

                </div>

                <div className="flex flex-col gap-4 max-w-fit mx-auto">
                    {Object.keys(seatRows).sort().map(rowLabel => {
                        const isRowHasHorizontalAisle = seatRows[rowLabel].some(s => s.has_aisle_horizontal);
                        return (
                            <div key={rowLabel} className="flex items-center gap-6 relative" style={{ marginBottom: isRowHasHorizontalAisle ? '40px' : '4px' }}>
                                {isRowHasHorizontalAisle && isEditMode && (
                                    <div className="absolute -bottom-6 left-12 right-0 h-1 bg-purple-100 border-b border-purple-200 border-dashed"></div>
                                )}
                                <div className="w-6 font-black text-slate-300 text-lg uppercase">{rowLabel}</div>
                                <div className="flex items-center">
                                    {seatRows[rowLabel].sort((a, b) => a.cot - b.cot).map((seat) => (
                                        <div key={`${seat.hang}-${seat.cot}`} style={{ marginRight: seat.has_aisle ? '40px' : '8px' }}>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <div className={`relative w-10 h-10 rounded-md border flex items-center justify-center text-[11px] font-bold transition-all shadow-sm ${getSeatStyles(seat)} ${isEditMode ? 'cursor-pointer hover:ring-2 ring-blue-400 hover:scale-105 z-10' : ''}`}>
                                                        {seat.so_ghe}
                                                        {seat.trang_thai === 'Bảo trì' && <AlertCircle size={10} className="absolute -top-1.5 -right-1.5 text-slate-500 bg-white rounded-full" />}
                                                        {seat.trang_thai === 'Khóa' && <Lock size={10} className="absolute -top-1.5 -right-1.5 text-red-500 bg-white rounded-full" />}
                                                    </div>
                                                </PopoverTrigger>
                                                {isEditMode && (
                                                    <PopoverContent className="w-64 p-4 shadow-xl border-slate-200 z-50">
                                                        <div className="grid gap-4">
                                                            <div className="font-bold border-b pb-2 flex justify-between items-center text-sm">
                                                                <span>Cài đặt {seat.so_ghe}</span>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleRemoveSeat(seat.hang, seat.cot)}><Trash2 size={14} /></Button>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-medium">Lối đi dọc (phải)</span>
                                                                <Switch checked={seat.has_aisle} onCheckedChange={(val) => { updateSeatDetail(seat.hang, seat.cot, 'has_aisle', val); if (val) toast.info("Bật lối đi dọc"); }} />
                                                            </div>
                                                            <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                                                                <div className="grid"><span className="text-[11px] font-bold text-purple-700">Lối đi ngang (dưới)</span><span className="text-[9px] text-purple-500 italic">Dãn hàng tiếp theo</span></div>
                                                                <Switch checked={seat.has_aisle_horizontal} onCheckedChange={(val) => updateSeatDetail(seat.hang, seat.cot, 'has_aisle_horizontal', val)} />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-1.5">
                                                                <Button variant="outline" className="h-7 text-[9px]" onClick={() => toggleColumnAisle(seat.cot, !seat.has_aisle)}>Cả cột {seat.cot}</Button>
                                                                <Button variant="outline" className="h-7 text-[9px] border-purple-200" onClick={() => toggleRowAisleHorizontal(seat.hang, !seat.has_aisle_horizontal)}>Cả hàng {seat.hang}</Button>
                                                            </div>
                                                            <div className="grid gap-1.5">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Loại cả hàng {seat.hang}</span>
                                                                <div className="flex gap-1">
                                                                    {['STANDARD', 'VIP', 'SWEETBOX'].map(type => (
                                                                        <Button key={type} size="sm" variant="secondary" className="h-6 text-[8px] flex-1 bg-slate-100" onClick={() => applyTypeToRow(seat.hang, type)}>{type}</Button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="grid gap-1">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Trạng thái ghế</span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {['Hoạt động', 'Bảo trì', 'Khóa'].map(status => (
                                                                        <Button key={status} size="sm" variant={seat.trang_thai === status ? "default" : "outline"} className="h-7 text-[9px] flex-1" onClick={() => updateSeatDetail(seat.hang, seat.cot, 'trang_thai', status)}>{status}</Button>
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
                                        <button onClick={() => handleAddNewSeat(rowLabel)} className="w-10 h-10 ml-2 rounded-md border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-500 transition-all"><Plus size={18} /></button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
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