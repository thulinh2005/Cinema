import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Search, Pencil, Trash2, Filter, Info, Ticket as TicketIcon } from 'lucide-react';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfirmDelete from "@/components/ConfirmDelete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ tong_da_ban: 0, tong_chua_ban: 0 });
    
    // Original list without filters (to extract unique filter options)
    const [allRawTickets, setAllRawTickets] = useState([]);

    const [filters, setFilters] = useState({
        ma_phim: "all",
        ma_phong: "all",
        ma_suat_chieu: "all"
    });

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState(null);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState(null);

    // ==================== FETCH TICKETS ====================
    const fetchTickets = async (currentFilters = filters) => {
        try {
            // Build query params
            const params = new URLSearchParams();
            if (currentFilters.ma_phim && currentFilters.ma_phim !== "all") params.append("ma_phim", currentFilters.ma_phim);
            if (currentFilters.ma_phong && currentFilters.ma_phong !== "all") params.append("ma_phong", currentFilters.ma_phong);
            if (currentFilters.ma_suat_chieu && currentFilters.ma_suat_chieu !== "all") params.append("ma_suat_chieu", currentFilters.ma_suat_chieu);

            const response = await axios.get(`http://localhost:5000/api/tickets?${params.toString()}`);
            setTickets(response.data.tickets);
            setStats(response.data.stats);

            // Fetch all options once on initial load
            if (Object.values(currentFilters).every(v => v === "all") && allRawTickets.length === 0) {
                setAllRawTickets(response.data.tickets);
            }
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error("Không thể tải danh sách vé");
        }
    };

    useEffect(() => {
        fetchTickets(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // ==================== FILTER OPTIONS ====================
    // Extract unique movies, rooms, showtimes from raw data
    const filterOptions = useMemo(() => {
        const uniqueMovies = Array.from(new Set(allRawTickets.map(t => t.ma_phim)))
            .map(id => allRawTickets.find(t => t.ma_phim === id))
            .filter(Boolean);
            
        const uniqueRooms = Array.from(new Set(allRawTickets.map(t => t.ma_phong)))
            .map(id => allRawTickets.find(t => t.ma_phong === id))
            .filter(Boolean);

        const uniqueShowtimes = Array.from(new Set(allRawTickets.map(t => t.ma_suat_chieu)))
            .map(id => allRawTickets.find(t => t.ma_suat_chieu === id))
            .filter(Boolean);

        return { movies: uniqueMovies, rooms: uniqueRooms, showtimes: uniqueShowtimes };
    }, [allRawTickets]);

    // ==================== EDIT TICKET ====================
    const handleEditClick = (ticket) => {
        setEditingTicket({ ...ticket });
        setIsEditModalOpen(true);
    };

    const handleUpdateTicket = async () => {
        // 1️⃣ Validation - Tất cả field bắt buộc
        if (editingTicket.gia_ve === "" || editingTicket.gia_ve === null) {
            return toast.error("Giá vé không được bỏ trống!");
        }
        
        if (isNaN(editingTicket.gia_ve) || Number(editingTicket.gia_ve) < 0) {
            return toast.error("Giá vé không hợp lệ!");
        }

        if (!editingTicket.trang_thai) {
            return toast.error("Trạng thái không được bỏ trống!");
        }

        try {
            await axios.put(`http://localhost:5000/api/tickets/${editingTicket.ma_ve}`, {
                gia_ve: editingTicket.gia_ve,
                trang_thai: editingTicket.trang_thai
            });
            toast.success("Cập nhật vé thành công!");
            setIsEditModalOpen(false);
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật vé");
        }
    };

    // ==================== DELETE TICKET ====================
    const handleDeleteTicket = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/tickets/${ticketToDelete}`);
            toast.success("Xóa vé thành công!");
            setIsDeleteDialogOpen(false);
            setTicketToDelete(null);
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa vé");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Vé</h1>
            </div>

            {/* FILTER & STATS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Filters */}
                <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-100">
                    <CardHeader className="bg-slate-50/50 pb-4">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-500" />
                            Bộ Lọc Vé
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Phim</Label>
                                <Select 
                                    value={filters.ma_phim} 
                                    onValueChange={(val) => setFilters({ ...filters, ma_phim: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Tất cả phim" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả phim</SelectItem>
                                        {filterOptions.movies.map(m => (
                                            <SelectItem key={m.ma_phim} value={m.ma_phim.toString()}>{m.ten_phim}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Phòng Chiếu</Label>
                                <Select 
                                    value={filters.ma_phong} 
                                    onValueChange={(val) => setFilters({ ...filters, ma_phong: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Tất cả phòng" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả phòng</SelectItem>
                                        {filterOptions.rooms.map(r => (
                                            <SelectItem key={r.ma_phong} value={r.ma_phong.toString()}>{r.ten_phong}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Suất Chiếu</Label>
                                <Select 
                                    value={filters.ma_suat_chieu} 
                                    onValueChange={(val) => setFilters({ ...filters, ma_suat_chieu: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Tất cả suất chiếu" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả suất chiếu</SelectItem>
                                        {filterOptions.showtimes.map(s => (
                                            <SelectItem key={s.ma_suat_chieu} value={s.ma_suat_chieu.toString()}>
                                                {s.gio_chieu} - {new Date(s.ngay_chieu).toLocaleDateString('vi-VN')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Overview */}
                <Card className="shadow-sm border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                            <Info className="h-4 w-4" />
                            Thống Kê Vé
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-blue-100">
                            <span className="text-sm font-medium text-slate-600">Đã bán</span>
                            <span className="text-lg font-bold text-emerald-600">{stats.tong_da_ban} vé</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-blue-100">
                            <span className="text-sm font-medium text-slate-600">Chưa bán (Chưa Thanh Toán)</span>
                            <span className="text-lg font-bold text-amber-600">{stats.tong_chua_ban} vé</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* EDIT MODAL */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Sửa thông tin vé #{editingTicket?.ma_ve}</DialogTitle>
                    </DialogHeader>
                    {editingTicket && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label className="text-slate-500 text-xs">Phim</Label>
                                <div className="font-semibold">{editingTicket.ten_phim}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-slate-500 text-xs">Suất chiếu</Label>
                                    <div className="font-medium text-sm">{editingTicket.gio_chieu} ({new Date(editingTicket.ngay_chieu).toLocaleDateString('vi-VN')})</div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-slate-500 text-xs">Ghế</Label>
                                    <div className="font-medium text-sm text-blue-600 font-bold">{editingTicket.so_ghe}</div>
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 my-2" />
                            <div className="grid gap-2">
                                <Label>Giá vé (VNĐ) <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    value={editingTicket.gia_ve}
                                    onChange={(e) => setEditingTicket({ ...editingTicket, gia_ve: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Trạng thái <span className="text-red-500">*</span></Label>
                                <Select value={editingTicket.trang_thai} onValueChange={(val) => setEditingTicket({ ...editingTicket, trang_thai: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CHO_THANH_TOAN">Chờ thanh toán</SelectItem>
                                        <SelectItem value="DA_THANH_TOAN">Đã thanh toán</SelectItem>
                                        <SelectItem value="DA_HUY">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleUpdateTicket} className="bg-amber-600 hover:bg-amber-700">Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* TABLE SECTION */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table className="table-fixed w-full">
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[8%] font-bold text-slate-700">Mã Vé</TableHead>
                            <TableHead className="w-[20%] font-bold text-slate-700">Phim</TableHead>
                            <TableHead className="w-[15%] font-bold text-slate-700">Suất Chiếu</TableHead>
                            <TableHead className="w-[10%] font-bold text-center text-slate-700">Ghế</TableHead>
                            <TableHead className="w-[15%] font-bold text-slate-700">Giá Vé</TableHead>
                            <TableHead className="w-[15%] font-bold text-center text-slate-700">Trạng thái</TableHead>
                            <TableHead className="w-[17%] text-right font-bold text-slate-700 pr-6">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <TableRow key={ticket.ma_ve} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                                    <TableCell className="font-mono text-xs text-slate-500 truncate">
                                        #{ticket.ma_ve}
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-800 truncate">
                                        {ticket.ten_phim}
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-sm">
                                        <div>{ticket.gio_chieu}</div>
                                        <div className="text-xs text-slate-400">{new Date(ticket.ngay_chieu).toLocaleDateString('vi-VN')}</div>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-blue-600">
                                        {ticket.so_ghe}
                                    </TableCell>
                                    <TableCell className="text-slate-600 font-medium">
                                        {Number(ticket.gia_ve).toLocaleString('vi-VN')} đ
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="secondary"
                                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold border-none whitespace-nowrap ${ticket.trang_thai === 'DA_THANH_TOAN'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : ticket.trang_thai === 'DA_HUY'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}
                                        >
                                            {ticket.trang_thai === 'DA_THANH_TOAN' ? 'Đã Thanh Toán'
                                            : ticket.trang_thai === 'DA_HUY' ? 'Đã Hủy'
                                            : 'Chờ Thanh Toán'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-amber-50"
                                                title="Sửa"
                                                onClick={() => handleEditClick(ticket)}
                                            >
                                                <Pencil className="h-4 w-4 text-amber-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-red-50"
                                                title="Xóa"
                                                onClick={() => {
                                                    setTicketToDelete(ticket.ma_ve);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                    Không tìm thấy vé nào phù hợp với bộ lọc.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <ConfirmDelete
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDeleteTicket}
                title="Xóa vé"
                description="Bạn chắc chắn muốn xóa vé này? Hành động này không thể hoàn tác."
            />
        </div>
    );
};

export default Tickets;
