import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfirmDelete from "@/components/ConfirmDelete";

const Employee = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const [newEmployee, setNewEmployee] = useState({
        ho_ten: "",
        ngay_sinh: "",
        dia_chi: "",
        so_dien_thoai: "",
        email: "",
        anh_dai_dien: "",
        ma_tk: "",
        trang_thai: "Còn làm"
    });

    // ==================== FETCH EMPLOYEES ====================
    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/employees?search=${searchTerm}`);
            setEmployees(response.data);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error("Không thể tải danh sách nhân viên");
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // ==================== ADD EMPLOYEE ====================
    const handleAddEmployee = async () => {
        // 1️⃣ Validation - Tất cả field bắt buộc
        if (!newEmployee.ho_ten.trim()) {
            return toast.error("Họ tên không được bỏ trống!");
        }

        if (!newEmployee.ngay_sinh.trim()) {
            return toast.error("Ngày sinh không được bỏ trống!");
        }

        // Kiểm tra tuổi (phải từ 16 tuổi trở lên)
        const birthDate = new Date(newEmployee.ngay_sinh);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (age < 16 || (age === 16 && monthDiff < 0)) {
            return toast.error("Nhân viên phải từ 16 tuổi trở lên (sinh từ năm 2010)!");
        }

        if (!newEmployee.dia_chi.trim()) {
            return toast.error("Địa chỉ không được bỏ trống!");
        }

        if (!newEmployee.so_dien_thoai.trim()) {
            return toast.error("Số điện thoại không được bỏ trống!");
        }

        if (!/^[0-9]{10}$/.test(newEmployee.so_dien_thoai)) {
            return toast.error("Số điện thoại phải đủ 10 số!");
        }

        if (!newEmployee.email.trim()) {
            return toast.error("Email không được bỏ trống!");
        }

        try {
            await axios.post('http://localhost:5000/api/employees', {
                ho_ten: newEmployee.ho_ten,
                ngay_sinh: newEmployee.ngay_sinh,
                dia_chi: newEmployee.dia_chi,
                so_dien_thoai: newEmployee.so_dien_thoai,
                email: newEmployee.email,
                anh_dai_dien: newEmployee.anh_dai_dien || null,
                ma_tk: newEmployee.ma_tk || null,
                trang_thai: newEmployee.trang_thai
            });
            toast.success("Thêm nhân viên thành công!");
            setIsAddModalOpen(false);
            setNewEmployee({
                ho_ten: "",
                ngay_sinh: "",
                dia_chi: "",
                so_dien_thoai: "",
                email: "",
                anh_dai_dien: "",
                ma_tk: "",
                trang_thai: "Còn làm"
            });
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi thêm nhân viên");
        }
    };

    // ==================== DELETE EMPLOYEE ====================
    const handleDeleteEmployee = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/employees/${employeeToDelete}`);
            toast.success("Xóa nhân viên thành công!");
            setIsDeleteDialogOpen(false);
            setEmployeeToDelete(null);
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa nhân viên");
        }
    };

    // ==================== EDIT EMPLOYEE ====================
    const handleEditClick = (employee) => {
        setEditingEmployee({ ...employee });
        setIsEditModalOpen(true);
    };

    const handleUpdateEmployee = async () => {
        // 1️⃣ Validation - Tất cả field bắt buộc
        if (!editingEmployee.ho_ten.trim()) {
            return toast.error("Họ tên không được bỏ trống!");
        }

        if (!editingEmployee.ngay_sinh) {
            return toast.error("Ngày sinh không được bỏ trống!");
        }

        // Kiểm tra tuổi (phải từ 16 tuổi trở lên)
        const birthDate = new Date(editingEmployee.ngay_sinh);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (age < 16 || (age === 16 && monthDiff < 0)) {
            return toast.error("Nhân viên phải từ 16 tuổi trở lên (sinh từ năm 2010)!");
        }

        if (!editingEmployee.dia_chi.trim()) {
            return toast.error("Địa chỉ không được bỏ trống!");
        }

        if (!editingEmployee.so_dien_thoai.trim()) {
            return toast.error("Số điện thoại không được bỏ trống!");
        }

        if (!/^[0-9]{10}$/.test(editingEmployee.so_dien_thoai)) {
            return toast.error("Số điện thoại phải đủ 10 số!");
        }

        if (!editingEmployee.email || !editingEmployee.email.trim()) {
            return toast.error("Email không được bỏ trống!");
        }

        try {
            await axios.put(`http://localhost:5000/api/employees/${editingEmployee.ma_nv}`, {
                ho_ten: editingEmployee.ho_ten,
                ngay_sinh: editingEmployee.ngay_sinh,
                dia_chi: editingEmployee.dia_chi,
                so_dien_thoai: editingEmployee.so_dien_thoai,
                email: editingEmployee.email,
                anh_dai_dien: editingEmployee.anh_dai_dien || null,
                ma_tk: editingEmployee.ma_tk || null,
                trang_thai: editingEmployee.trang_thai
            });
            toast.success("Cập nhật nhân viên thành công!");
            setIsEditModalOpen(false);
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật nhân viên");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách nhân viên</h1>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm gap-2">
                            <Plus className="h-4 w-4" /> Thêm nhân viên
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Thêm nhân viên mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="ho_ten">Họ tên <span className="text-red-500">*</span></Label>
                                <Input
                                    id="ho_ten"
                                    placeholder="Nhập họ tên"
                                    value={newEmployee.ho_ten}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, ho_ten: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ngay_sinh">Ngày sinh <span className="text-red-500">*</span></Label>
                                <Input
                                    id="ngay_sinh"
                                    type="date"
                                    value={newEmployee.ngay_sinh}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, ngay_sinh: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dia_chi">Địa chỉ <span className="text-red-500">*</span></Label>
                                <Input
                                    id="dia_chi"
                                    placeholder="Nhập địa chỉ"
                                    value={newEmployee.dia_chi}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, dia_chi: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="so_dien_thoai">Số điện thoại <span className="text-red-500">*</span></Label>
                                <Input
                                    id="so_dien_thoai"
                                    placeholder="10 số"
                                    maxLength="10"
                                    value={newEmployee.so_dien_thoai}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, so_dien_thoai: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@gmail.com"
                                    value={newEmployee.email}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Trạng thái</Label>
                                <Select value={newEmployee.trang_thai} onValueChange={(val) => setNewEmployee({ ...newEmployee, trang_thai: val })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Còn làm">Còn làm</SelectItem>
                                        <SelectItem value="Nghỉ làm">Nghỉ làm</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
                            <Button onClick={handleAddEmployee} className="bg-blue-600">Lưu nhân viên</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* EDIT MODAL */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Chỉnh sửa nhân viên: {editingEmployee?.ho_ten}</DialogTitle>
                    </DialogHeader>
                    {editingEmployee && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Họ tên <span className="text-red-500">*</span></Label>
                                <Input
                                    value={editingEmployee.ho_ten}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, ho_ten: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Ngày sinh <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={editingEmployee.ngay_sinh || ""}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, ngay_sinh: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Địa chỉ <span className="text-red-500">*</span></Label>
                                <Input
                                    value={editingEmployee.dia_chi || ""}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, dia_chi: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Số điện thoại <span className="text-red-500">*</span></Label>
                                <Input
                                    maxLength="10"
                                    value={editingEmployee.so_dien_thoai}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, so_dien_thoai: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Email <span className="text-red-500">*</span></Label>
                                <Input
                                    type="email"
                                    value={editingEmployee.email || ""}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Trạng thái</Label>
                                <Select value={editingEmployee.trang_thai} onValueChange={(val) => setEditingEmployee({ ...editingEmployee, trang_thai: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Còn làm">Còn làm</SelectItem>
                                        <SelectItem value="Nghỉ làm">Nghỉ làm</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleUpdateEmployee} className="bg-amber-600 hover:bg-amber-700">Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* SEARCH BAR */}
            <div className="flex items-center max-w-sm relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                    placeholder="Tìm số điện thoại hoặc mã nhân viên..."
                    className="pl-9 border-slate-200 focus:border-blue-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* TABLE */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table className="table-fixed w-full">
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[60px] text-center font-bold text-slate-700">STT</TableHead>
                            <TableHead className="w-[10%] font-bold text-slate-700">Mã NV</TableHead>
                            <TableHead className="w-[15%] font-bold text-slate-700">Họ tên</TableHead>
                            <TableHead className="w-[12%] font-bold text-slate-700">SĐT</TableHead>
                            <TableHead className="w-[15%] font-bold text-slate-700">Email</TableHead>
                            <TableHead className="w-[12%] font-bold text-center text-slate-700">Trạng thái</TableHead>
                            <TableHead className="w-[20%] text-right font-bold text-slate-700 pr-6">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.length > 0 ? (
                            employees.map((emp, index) => (
                                <TableRow key={emp.ma_nv} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                                    <TableCell className="text-center font-medium text-slate-500">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-500 truncate">
                                        #{emp.ma_nv}
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-800 truncate">
                                        {emp.ho_ten}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {emp.so_dien_thoai}
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-sm truncate">
                                        {emp.email || "-"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="secondary"
                                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold border-none whitespace-nowrap ${emp.trang_thai === 'Còn làm'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {emp.trang_thai}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-amber-50"
                                                title="Sửa"
                                                onClick={() => handleEditClick(emp)}
                                            >
                                                <Pencil className="h-4 w-4 text-amber-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-red-50"
                                                title="Xóa"
                                                onClick={() => {
                                                    setEmployeeToDelete(emp.ma_nv);
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
                                    Không tìm thấy nhân viên nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <ConfirmDelete
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDeleteEmployee}
                title="Xóa nhân viên"
                description="Bạn chắc chắn muốn xóa nhân viên này?"
            />
        </div>
    );
};

export default Employee;
