import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
    Search,
    Pencil,
    Trash2,
    Filter,
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    UploadCloud,
    AlertTriangle
} from "lucide-react";

// --- START: Modal Form Thêm/Sửa ---
const ProductFormModal = ({ product, isOpen, onClose, isEdit, reload }) => {
    const [tenSp, setTenSp] = useState("");
    const [loaiSp, setLoaiSp] = useState("Đồ ăn");
    const [giaBan, setGiaBan] = useState("");
    const [trangThai, setTrangThai] = useState("Còn bán");
    const [anhSanPham, setAnhSanPham] = useState(null);
    const [previewImage, setPreviewImage] = useState("");

    const [availableSingles, setAvailableSingles] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (loaiSp === "Combo") {
            const fetchSingles = async () => {
                try {
                    const res = await axios.get("http://localhost:5000/api/products/single");
                    setAvailableSingles(res.data.data || []);
                } catch (err) {
                    console.error("Lỗi lấy sản phẩm đơn:", err);
                }
            };
            fetchSingles();
        }
    }, [loaiSp]);

    useEffect(() => {
        if (isOpen) {
            if (isEdit && product) {
                setTenSp(product.ten_sp);
                setLoaiSp(product.loai_sp);
                setGiaBan(product.gia_ban);
                setTrangThai(product.trang_thai);
                setAnhSanPham(null); 
                setPreviewImage(product.anh_san_pham ? `http://localhost:5000${product.anh_san_pham}` : "");

                if (product.loai_sp === "Combo") {
                    const fetchDetail = async () => {
                        try {
                            const res = await axios.get(`http://localhost:5000/api/products/${product.ma_sp}`);
                            const detail = res.data.data;
                            if (detail && detail.combo_items) {
                                setSelectedItems(detail.combo_items.map(item => ({ ma_sp: item.ma_sp, so_luong: item.so_luong || 1 })));
                            }
                        } catch (err) {
                            console.error("Lỗi lấy chi tiết combo:", err);
                        }
                    };
                    fetchDetail();
                } else {
                    setSelectedItems([]);
                }
            } else {
                setTenSp("");
                setLoaiSp("Đồ ăn");
                setGiaBan("");
                setTrangThai("Còn bán");
                setAnhSanPham(null);
                setPreviewImage("");
                setSelectedItems([]);
            }
        }
    }, [isOpen, isEdit, product]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAnhSanPham(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const toggleComboItem = (itemId) => {
        const isSelected = selectedItems.some(item => item.ma_sp === itemId);
        if (isSelected) {
            setSelectedItems(selectedItems.filter(item => item.ma_sp !== itemId));
        } else {
            setSelectedItems([...selectedItems, { ma_sp: itemId, so_luong: 1 }]);
        }
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) newQuantity = 1;
        setSelectedItems(selectedItems.map(item => 
            item.ma_sp === itemId ? { ...item, so_luong: newQuantity } : item
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!tenSp.trim()) {
            return toast.error("Vui lòng nhập tên sản phẩm");
        }
        if (!giaBan || isNaN(giaBan) || Number(giaBan) <= 0) {
            return toast.error("Vui lòng nhập giá bán hợp lệ (> 0)");
        }
        if (loaiSp === "Combo" && selectedItems.length < 2) {
            return toast.error("Combo phải bao gồm ít nhất 2 sản phẩm");
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("ten_sp", tenSp);
            formData.append("loai_sp", loaiSp);
            formData.append("gia_ban", giaBan);
            formData.append("trang_thai", trangThai);
            if (anhSanPham) {
                formData.append("anh_san_pham", anhSanPham);
            }
            if (loaiSp === "Combo") {
                formData.append("combo_items", JSON.stringify(selectedItems));
            }

            if (!isEdit) {
                await axios.post("http://localhost:5000/api/products", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Thêm sản phẩm thành công");
            } else {
                await axios.put(`http://localhost:5000/api/products/${product.ma_sp}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Cập nhật sản phẩm thành công");
            }
            reload();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {!isEdit ? "Thêm Sản Phẩm Mới" : "Chỉnh Sửa Sản Phẩm"}
                        </h2>
                        <p className="text-sm text-slate-500">
                            Điền đầy đủ thông tin bên dưới để {!isEdit ? "thêm" : "cập nhật"} sản phẩm
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 mb-6">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Tên sản phẩm *</label>
                            <input
                                type="text"
                                value={tenSp}
                                onChange={(e) => setTenSp(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="Nhập tên sản phẩm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Loại sản phẩm</label>
                            <select
                                value={loaiSp}
                                onChange={(e) => setLoaiSp(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="Đồ ăn">Đồ ăn</option>
                                <option value="Nước uống">Nước uống</option>
                                <option value="Combo">Combo</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Giá bán (VNĐ) *</label>
                            <input
                                type="number" min="1000"
                                value={giaBan}
                                onChange={(e) => setGiaBan(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="Nhập giá bán"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Trạng thái</label>
                            <select
                                value={trangThai}
                                onChange={(e) => setTrangThai(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="Còn bán">Còn bán</option>
                                <option value="Ngừng bán">Ngừng bán</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Hình ảnh</label>
                        <div className="flex items-center gap-4">
                            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:bg-slate-100">
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <>
                                        <UploadCloud className="text-slate-400" size={24} />
                                        <span className="mt-1 text-[10px] text-slate-500">Tải ảnh lên</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                            <div className="text-sm text-slate-500">
                                <p>Hỗ trợ định dạng JPG, PNG.</p>
                                <p>Tỷ lệ khuyên dùng 1:1.</p>
                            </div>
                        </div>
                    </div>

                    {loaiSp === "Combo" && (
                        <div className="space-y-2 border-t border-slate-200 pt-4 mt-4">
                            <label className="text-sm font-semibold text-slate-700">
                                Danh sách sản phẩm thành phần (Chọn &gt;= 2) *
                            </label>
                            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 p-2">
                                {availableSingles.length === 0 ? (
                                    <p className="p-2 text-sm text-slate-500">Không có đồ ăn / nước uống nào khả dụng.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {availableSingles.map(item => {
                                            const selectedItem = selectedItems.find(i => i.ma_sp === item.ma_sp);
                                            const isSelected = !!selectedItem;
                                            return (
                                                <div
                                                    key={item.ma_sp}
                                                    className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition ${
                                                        isSelected
                                                            ? "border-blue-500 bg-blue-50"
                                                            : "border-slate-200 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <div 
                                                        className="flex items-center gap-3 cursor-pointer flex-1"
                                                        onClick={() => toggleComboItem(item.ma_sp)}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            readOnly
                                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer pointer-events-none"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-slate-900">{item.ten_sp}</span>
                                                            <span className="text-xs text-slate-500">
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.gia_ban)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {isSelected && (
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateQuantity(item.ma_sp, selectedItem.so_luong - 1);
                                                                }}
                                                                className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="text-sm font-semibold w-5 text-center text-blue-700">
                                                                {selectedItem.so_luong}
                                                            </span>
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateQuantity(item.ma_sp, selectedItem.so_luong + 1);
                                                                }}
                                                                className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                        <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                            Hủy bỏ
                        </button>
                        <button type="submit" disabled={loading} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:bg-blue-400">
                            {loading ? "Đang xử lý..." : (isEdit ? "Lưu thay đổi" : "Thêm sản phẩm")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// --- END: Modal Form Thêm/Sửa ---

// --- START: Modal Xóa ---
const ProductDeleteModal = ({ product, isOpen, onClose, onConfirm }) => {
    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[400px] rounded-xl p-6 shadow-lg text-center relative">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">Xác nhận xóa</h2>
                <p className="text-gray-600 text-sm mb-4">
                    Bạn có chắc muốn xóa sản phẩm{" "}
                    <span className="font-semibold text-black">
                        {product.ten_sp}
                    </span>
                    ? 
                    <br />
                    Hành động này không thể hoàn tác, và nếu đây là Combo, các thành phần bên trong cũng sẽ bị gỡ khối liên kết.
                </p>
                <div className="flex gap-3 justify-center">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
                        Hủy
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Xóa sản phẩm
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- END: Modal Xóa ---


// --- COMPONENT CHÍNH ---
const Products = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [page, setPage] = useState(1);
    const [limit] = useState(8);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [openForm, setOpenForm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const [isEdit, setIsEdit] = useState(false);

    const fetchProducts = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/products", {
                params: {
                    page,
                    limit,
                    search: searchTerm,
                    type: typeFilter,
                    status: statusFilter,
                },
            });

            setProducts(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalProducts(res.data.total || 0);
        } catch (err) {
            console.log("Lỗi lấy danh sách sản phẩm:", err);
            toast.error("Không thể tải danh sách sản phẩm");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, searchTerm, typeFilter, statusFilter]);

    const getTypeBadge = (type) => {
        const t = (type || "").trim();
        switch (t) {
            case "Combo":
                return <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">Combo</span>;
            case "Đồ ăn":
                return <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Đồ ăn</span>;
            case "Nước uống":
                return <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">Nước uống</span>;
            default:
                return <span>{t}</span>;
        }
    };

    const getStatusBadge = (status) => {
        const s = (status || "").trim();
        if (s === "Còn bán") {
            return <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">Còn bán</span>;
        }
        return <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">Ngừng bán</span>;
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/products/${selectedProduct.ma_sp}`);
            toast.success("Xóa sản phẩm thành công");
            setOpenDelete(false);
            fetchProducts();
        } catch (err) {
            console.log("Lỗi xóa sản phẩm:", err);
            toast.error(err?.response?.data?.message || "Xóa sản phẩm thất bại");
        }
    };

    const renderPagination = () => {
        const arr = [];
        for (let i = 1; i <= totalPages; i++) {
            arr.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`h-9 min-w-[36px] rounded-lg border px-3 text-sm font-medium transition ${
                        page === i
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                >
                    {i}
                </button>
            );
        }
        return arr;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-2 sm:p-4">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                            Quản lý sản phẩm (Food & Drink)
                        </h1>
                        <p className="mt-2 text-[17px] text-slate-600">
                            Quản lý danh sách, phân loại, giá bán và hình ảnh sản phẩm.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedProduct(null);
                            setIsEdit(false);
                            setOpenForm(true);
                        }}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Thêm sản phẩm
                    </button>
                </div>

                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative flex-1">
                            <Search
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setPage(1);
                                    setSearchTerm(e.target.value);
                                }}
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                            />
                        </div>

                        <div className="hidden h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 lg:flex">
                            <Filter size={18} />
                        </div>

                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setPage(1);
                                setTypeFilter(e.target.value);
                            }}
                            className="h-12 min-w-[200px] rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500"
                        >
                            <option value="">Tất cả loại</option>
                            <option value="Combo">Combo</option>
                            <option value="Đồ ăn">Đồ ăn</option>
                            <option value="Nước uống">Nước uống</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setPage(1);
                                setStatusFilter(e.target.value);
                            }}
                            className="h-12 min-w-[220px] rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="Còn bán">Còn bán</option>
                            <option value="Ngừng bán">Ngừng bán</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr className="text-left text-slate-800">
                                    <th className="px-4 py-4 font-semibold">Tên sản phẩm</th>
                                    <th className="px-4 py-4 font-semibold">Hình ảnh</th>
                                    <th className="px-4 py-4 font-semibold">Loại</th>
                                    <th className="px-4 py-4 font-semibold">Giá bán</th>
                                    <th className="px-4 py-4 font-semibold">Trạng thái</th>
                                    <th className="px-4 py-4 text-center font-semibold">Hoạt động</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                                            Không có sản phẩm
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((p) => (
                                        <tr key={p.ma_sp} className="border-t border-slate-200">
                                            <td className="px-4 py-4 font-medium text-slate-900">
                                                {p.ten_sp}
                                            </td>
                                            <td className="px-4 py-4">
                                                {p.anh_san_pham ? (
                                                    <img src={`http://localhost:5000${p.anh_san_pham}`} alt={p.ten_sp} className="w-16 h-16 object-cover rounded-xl shadow-sm border border-slate-200" />
                                                ) : (
                                                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs border border-slate-200">
                                                        No
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">{getTypeBadge(p.loai_sp)}</td>
                                            <td className="px-4 py-4 text-slate-800 font-semibold">{formatCurrency(p.gia_ban)}</td>
                                            <td className="px-4 py-4">{getStatusBadge(p.trang_thai)}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProduct(p);
                                                            setIsEdit(true);
                                                            setOpenForm(true);
                                                        }}
                                                        className="text-amber-500 transition hover:scale-110"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedProduct(p);
                                                            setOpenDelete(true);
                                                        }}
                                                        className="text-red-500 transition hover:scale-110"
                                                        title="Xóa sản phẩm"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-600">
                            Hiển thị {products.length} / {totalProducts} sản phẩm
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                                Trước
                            </button>

                            {renderPagination()}

                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 disabled:opacity-50"
                            >
                                Sau
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ProductFormModal
                product={selectedProduct}
                isOpen={openForm}
                onClose={() => setOpenForm(false)}
                isEdit={isEdit}
                reload={fetchProducts}
            />

            <ProductDeleteModal
                product={selectedProduct}
                isOpen={openDelete}
                onClose={() => setOpenDelete(false)}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default Products;
