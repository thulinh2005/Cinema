import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const ProductManagement = () => {

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");

    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [type, setType] = useState("single");
    const [imageFile, setImageFile] = useState(null);

    const [form, setForm] = useState({
        ten: "",
        gia: "",
        trang_thai: "Online",
        items: []
    });

    // ================= API =================
    const fetchProducts = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/products?search=${search}`);
            setProducts(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Không tải được sản phẩm");
        }
    };

    useEffect(() => { fetchProducts(); }, [search]);

    const formatNumber = (num) => new Intl.NumberFormat('vi-VN').format(num);

    const resetForm = () => {
        setForm({ ten: "", gia: "", trang_thai: "Online", items: [] });
        setImageFile(null);
        setType("single");
        setEditingProduct(null);
    };

    const validate = () => {
        if (!form.ten.trim()) return "Tên không được để trống";
        if (!form.gia || Number(form.gia) < 1000) return "Giá phải >= 1000";
        if (!imageFile && !editingProduct) return "Vui lòng chọn ảnh";

        if (type === "combo") {
            if (form.items.length === 0) return "Combo phải có sản phẩm";
            for (let item of form.items) {
                if (!item.product_id) return "Chưa chọn sản phẩm";
                if (!item.quantity || item.quantity <= 0) return "Số lượng phải > 0";
            }
        }

        return null;
    };

    const buildFormData = () => {
        const data = new FormData();
        data.append("ten", form.ten);
        data.append("gia", form.gia);
        data.append("loai", type);
        data.append("trang_thai", form.trang_thai);
        if (imageFile) data.append("image", imageFile);
        data.append("items", JSON.stringify(form.items));
        return data;
    };

    const handleSubmit = async () => {
        const err = validate();
        if (err) return toast.error(err);

        try {
            await axios.post("http://localhost:5000/api/products", buildFormData());
            toast.success("Thêm thành công");
            setIsOpen(false);
            resetForm();
            fetchProducts();
        } catch {
            toast.error("Lỗi khi thêm");
        }
    };

    const handleUpdate = async () => {
        const err = validate();
        if (err) return toast.error(err);

        try {
            await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, buildFormData());
            toast.success("Cập nhật thành công");
            setIsEditOpen(false);
            resetForm();
            fetchProducts();
        } catch {
            toast.error("Lỗi khi cập nhật");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa sản phẩm?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/products/${id}`);
            toast.success("Đã xóa");
            fetchProducts();
        } catch {
            toast.error("Lỗi khi xóa");
        }
    };

    const handleEdit = (p) => {
        setEditingProduct(p);
        setForm({ ...p, items: p.items || [] });
        setType(p.loai || "single");
        setIsEditOpen(true);
    };

    const addItem = () => setForm({ ...form, items: [...form.items, { product_id: "", quantity: 1 }] });

    const removeItem = (i) => {
        const arr = [...form.items];
        arr.splice(i, 1);
        setForm({ ...form, items: arr });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold">Quản lý sản phẩm</h1>

                <Dialog open={isOpen} onOpenChange={(v)=>{setIsOpen(v); if(!v) resetForm();}}>
                    <DialogTrigger asChild>
                        <Button><Plus className="w-4"/> Thêm</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Thêm sản phẩm</DialogTitle></DialogHeader>
                        <FormUI {...{type,setType,form,setForm,setImageFile,products,addItem,removeItem}} />
                        <DialogFooter><Button onClick={handleSubmit}>Lưu</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Input placeholder="Tìm sản phẩm..." value={search} onChange={e=>setSearch(e.target.value)} />

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Mã</TableHead>
                        <TableHead>Tên</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Ảnh</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map(p => (
                        <TableRow key={p.id}>
                            <TableCell>{p.id}</TableCell>
                            <TableCell>{p.ten}</TableCell>
                            <TableCell>{p.loai}</TableCell>
                            <TableCell>{formatNumber(p.gia)} đ</TableCell>
                            <TableCell><img src={p.hinh} className="w-12 h-12 object-cover"/></TableCell>
                            <TableCell><Badge>{p.trang_thai}</Badge></TableCell>
                            <TableCell>
                                <Button size="icon" onClick={()=>handleEdit(p)}><Pencil/></Button>
                                <Button size="icon" onClick={()=>handleDelete(p.id)}><Trash2/></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isEditOpen} onOpenChange={(v)=>{setIsEditOpen(v); if(!v) resetForm();}}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Sửa sản phẩm</DialogTitle></DialogHeader>
                    <FormUI {...{type,setType,form,setForm,setImageFile,products,addItem,removeItem}} />
                    <DialogFooter><Button onClick={handleUpdate}>Cập nhật</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const FormUI = ({ type, setType, form, setForm, setImageFile, products, addItem, removeItem }) => (
    <div className="space-y-4">
        <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
                <SelectItem value="single">Sản phẩm đơn</SelectItem>
                <SelectItem value="combo">Combo</SelectItem>
            </SelectContent>
        </Select>

        <Input placeholder="Tên" value={form.ten}
            onChange={e=>setForm({...form,ten:e.target.value})}/>

        <Input type="number" min={1000} placeholder="Giá"
            value={form.gia}
            onChange={e=>{
                let val = Number(e.target.value);
                if(val < 0) val = 0;
                setForm({...form,gia:val});
            }}/>

        <Input type="file" onChange={e=>setImageFile(e.target.files[0])}/>

        {type === 'combo' && (
            <div className="space-y-2">
                {form.items.map((it,i)=>(
                    <div key={i} className="flex gap-2">
                        <Select onValueChange={(v)=>{
                            const arr=[...form.items];
                            arr[i].product_id=v;
                            setForm({...form,items:arr});
                        }}>
                            <SelectTrigger><SelectValue placeholder="Chọn SP"/></SelectTrigger>
                            <SelectContent>
                                {products.map(p=>(
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.ten}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input type="number" min={1} value={it.quantity}
                            onChange={e=>{
                                let val = Number(e.target.value);
                                if(val < 1) val = 1;
                                const arr=[...form.items];
                                arr[i].quantity=val;
                                setForm({...form,items:arr});
                            }}/>

                        <Button onClick={()=>removeItem(i)}><Trash2/></Button>
                    </div>
                ))}
                <Button onClick={addItem}>+ Thêm sản phẩm</Button>
            </div>
        )}
    </div>
);

export default ProductManagement;
