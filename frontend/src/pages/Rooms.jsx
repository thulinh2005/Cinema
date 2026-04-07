import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfirmDelete from "@/components/ConfirmDelete";

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const navigate = useNavigate();

    const [newRoom, setNewRoom] = useState({
        ten_phong: "",
        so_ghe: "",
        loai_phong: "",
        trang_thai: "Hoạt động"
    });

    const fetchRooms = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/rooms?search=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(response.data);
        } catch (error) {
            toast.error("Không thể tải danh sách phòng");
        }
    };

    const fetchRoomTypes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/rooms/room-types`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoomTypes(response.data);
        } catch (error) {
            toast.error("Không thể lấy loại phòng");
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchRoomTypes();
    }, [searchTerm]);

    const handleAddRoom = async () => {
        if (!newRoom.ten_phong.trim()) return toast.error("Vui lòng nhập tên phòng!");
        if (!newRoom.so_ghe || newRoom.so_ghe <= 0) return toast.error("Số lượng ghế phải lớn hơn 0!");
        if (!newRoom.loai_phong) return toast.error("Vui lòng chọn loại phòng chiếu!");

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/rooms', newRoom, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Thêm phòng thành công!");
            setIsAddModalOpen(false);
            setNewRoom({ ten_phong: "", so_ghe: "", loai_phong: "", trang_thai: "Hoạt động" });
            fetchRooms();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi thêm phòng");
        }
    };

    const handleDeleteRoom = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/rooms/${roomToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Xóa phòng chiếu thành công!");
            setIsDeleteDialogOpen(false);
            setRoomToDelete(null);
            fetchRooms();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa phòng");
        }
    };

    const handleEditClick = (room) => {
        setEditingRoom({ ...room });
        setIsEditModalOpen(true);
    };

    const handleUpdateRoom = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/rooms/${editingRoom.ma_phong}`, editingRoom, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Cập nhật phòng thành công!");
            setIsEditModalOpen(false);
            fetchRooms();
        } catch (error) {
            toast.error("Lỗi khi cập nhật phòng");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Danh sách phòng chiếu
                </h1>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm gap-2">
                            <Plus className="h-4 w-4" /> Thêm phòng
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Thêm phòng chiếu mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Tên phòng <span className="text-red-500">*</span></Label>
                                <Input id="name" placeholder="Nhập tên phòng"
                                    value={newRoom.ten_phong}
                                    onChange={(e) => setNewRoom({ ...newRoom, ten_phong: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="seats">Số lượng ghế <span className="text-red-500">*</span></Label>
                                <Input id="seats" type="number" placeholder="Nhập số ghế"
                                    value={newRoom.so_ghe}
                                    onChange={(e) => setNewRoom({ ...newRoom, so_ghe: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Loại phòng <span className="text-red-500">*</span></Label>
                                <Select onValueChange={(val) => setNewRoom({ ...newRoom, loai_phong: val })} value={newRoom.loai_phong}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại phòng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roomTypes.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
                            <Button onClick={handleAddRoom} className="bg-blue-600">Lưu phòng</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Chỉnh sửa phòng: {editingRoom?.ten_phong}</DialogTitle>
                    </DialogHeader>
                    {editingRoom && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Tên phòng</Label>
                                <Input
                                    value={editingRoom.ten_phong}
                                    onChange={(e) => setEditingRoom({ ...editingRoom, ten_phong: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Số lượng ghế</Label>
                                <Input
                                    type="number"
                                    value={editingRoom.so_ghe}
                                    disabled
                                    className="bg-slate-50 cursor-not-allowed opacity-70"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Loại phòng</Label>
                                <Select
                                    value={editingRoom.loai_phong}
                                    onValueChange={(val) => setEditingRoom({ ...editingRoom, loai_phong: val })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {roomTypes.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Trạng thái</Label>
                                <Select
                                    value={editingRoom.trang_thai}
                                    onValueChange={(val) => setEditingRoom({ ...editingRoom, trang_thai: val })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                                        <SelectItem value="Bảo trì">Bảo trì</SelectItem>
                                        <SelectItem value="Không hoạt động">Không hoạt động</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleUpdateRoom} className="bg-amber-600 hover:bg-amber-700">Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex items-center max-w-sm relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                    placeholder="Tìm tên phòng..."
                    className="pl-9 border-slate-200 focus:border-blue-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table className="table-fixed w-full">
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[60px] text-center font-bold text-slate-700">STT</TableHead>
                            <TableHead className="w-[15%] font-bold text-slate-700">Mã phòng</TableHead>
                            <TableHead className="w-[20%] font-bold text-slate-700">Tên phòng</TableHead>
                            <TableHead className="w-[12%] font-bold text-center text-slate-700">Số ghế</TableHead>
                            <TableHead className="w-[15%] font-bold text-slate-700">Loại phòng</TableHead>
                            <TableHead className="w-[12%] font-bold text-slate-700 text-center">Trạng thái</TableHead>
                            <TableHead className="w-[13%] text-center font-bold text-slate-700">Sơ đồ ghế</TableHead>
                            <TableHead className="w-[20%] text-right font-bold text-slate-700 pr-6">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rooms.length > 0 ? (
                            rooms.map((room, index) => (
                                <TableRow key={room.ma_phong} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                                    <TableCell className="text-center font-medium text-slate-500">{index + 1}</TableCell>
                                    <TableCell className="font-mono text-xs text-slate-500 truncate">#{room.ma_phong}</TableCell>
                                    <TableCell className="font-semibold text-slate-800 truncate">{room.ten_phong}</TableCell>
                                    <TableCell className="text-center font-medium">{room.so_ghe}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[11px] font-bold border-none whitespace-nowrap ${room.loai_phong === 'IMAX' ? 'bg-purple-100 text-purple-700' :
                                            room.loai_phong === '3D' ? 'bg-blue-100 text-blue-700' :
                                                room.loai_phong === '2D' ? 'bg-emerald-100 text-emerald-700' :
                                                    room.loai_phong === 'SCREENX' ? 'bg-amber-100 text-amber-700' :
                                                        room.loai_phong === '4DX' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {room.loai_phong}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[11px] font-bold border-none whitespace-nowrap ${room.trang_thai === 'Hoạt động' ? 'bg-emerald-100 text-emerald-700' :
                                            room.trang_thai === 'Bảo trì' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {room.trang_thai}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/rooms/${room.ma_phong}/seats`)} className="h-8 w-8 hover:bg-blue-50" title="Chi tiết ghế">
                                            <Eye className="h-4 w-4 text-blue-600" />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-50" title="Sửa" onClick={() => handleEditClick(room)}>
                                                <Pencil className="h-4 w-4 text-amber-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" title="Xóa" onClick={() => { setRoomToDelete(room.ma_phong); setIsDeleteDialogOpen(true); }}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-slate-500 italic">
                                    Không tìm thấy phòng chiếu nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <ConfirmDelete
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setRoomToDelete(null);
                }}
                onConfirm={handleDeleteRoom}
                title="Xóa phòng chiếu?"
                description="Bạn có chắc chắn muốn xóa phòng này? Toàn bộ sơ đồ ghế liên quan cũng sẽ bị xóa vĩnh viễn."
            />
        </div>
    );
};

export default Rooms;
