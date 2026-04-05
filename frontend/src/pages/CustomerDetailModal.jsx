import React from "react";
import { User, Mail, Phone, Calendar, MapPin, CreditCard, Award, Clock } from "lucide-react";

// 👉 Không dùng shadcn nữa → modal thuần
const CustomerDetailModal = ({ customer, isOpen, onClose }) => {
    if (!isOpen || !customer) return null;

    // ================= HELPER =================
    const getTier = (points) => {
        if (points >= 2000) return "SVIP";
        if (points >= 1000) return "VIP";
        return "Standard";
    };

    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("vi-VN");
    };

    const tier = getTier(customer.diem_tich_luy);

    // ================= UI =================
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[600px] rounded-xl shadow-lg p-6 relative">

                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
                >
                    ✕
                </button>

                {/* HEADER */}
                <div className="flex items-center gap-4 border-b pb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center font-bold text-xl text-blue-600">
                        {customer.ten_kh
                            ?.split(" ")
                            .map((x) => x[0])
                            .slice(-2)
                            .join("")}
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{customer.ten_kh}</h2>

                        <div className="flex gap-2 mt-1">
                            {/* HẠNG */}
                            <span className="px-2 py-1 text-xs rounded font-medium bg-amber-100 text-amber-700">
                                {tier}
                            </span>

                            {/* TRẠNG THÁI */}
                            {customer.trang_thai === "Hoạt động" ? (
                                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                                    Hoạt động
                                </span>
                            ) : (
                                <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                                    Đã hủy
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* INFO */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 mt-6">

                    <Info icon={<CreditCard size={16} />} label="Mã KH" value={customer.ma_kh} />
                    <Info icon={<User size={16} />} label="Giới tính" value={customer.gioi_tinh} />

                    <Info icon={<Mail size={16} />} label="Email" value={customer.email} className="col-span-2" />
                    <Info icon={<Phone size={16} />} label="SĐT" value={customer.so_dien_thoai} />

                    <Info
                        icon={<Calendar size={16} />}
                        label="Ngày sinh"
                        value={formatDate(customer.ngay_sinh)}
                    />

                    <Info
                        icon={<MapPin size={16} />}
                        label="Địa chỉ"
                        value={customer.dia_chi}
                        className="col-span-2"
                    />

                    <Info
                        icon={<Clock size={16} />}
                        label="Ngày đăng ký"
                        value={formatDate(customer.ngay_dang_ky)}
                    />
                </div>

                {/* ĐIỂM */}
                <div className="mt-6 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Award size={18} />
                            <span>Điểm tích lũy</span>
                        </div>
                        <span className="text-xl font-bold text-slate-800">
                            {customer.diem_tich_luy?.toLocaleString("vi-VN")}
                        </span>
                    </div>

                    <div className="text-xs font-medium text-slate-500 mt-2">
                        {tier === "Standard" && (
                            <div>Cần {1000 - customer.diem_tich_luy} điểm để lên VIP</div>
                        )}
                        {tier === "VIP" && (
                            <div>Cần {2000 - customer.diem_tich_luy} điểm để lên SVIP</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// COMPONENT nhỏ
const Info = ({ icon, label, value, className = "" }) => {
    return (
        <div className={`flex items-start gap-3 ${className}`}>
            <div className="text-blue-500 mt-0.5">{icon}</div>
            <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="font-semibold text-slate-800 text-sm">{value || "—"}</p>
            </div>
        </div>
    );
};

export default CustomerDetailModal;