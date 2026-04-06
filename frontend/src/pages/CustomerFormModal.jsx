import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  Users,
  X,
} from "lucide-react";

const CustomerFormModal = ({ customer, isOpen, onClose, mode, reload }) => {
  const [form, setForm] = useState({
    ten_kh: "",
    email: "",
    so_dien_thoai: "",
    mat_khau: "",
    ngay_sinh: "",
    gioi_tinh: "Nam",
    dia_chi: "",
    hang_thanh_vien: "Standard",
    trang_thai: "Hoạt động",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && customer) {
        setForm({
          ten_kh: customer.ten_kh || "",
          email: customer.email || "",
          so_dien_thoai: customer.so_dien_thoai || "",
          mat_khau: "",
          ngay_sinh: formatDateForInput(customer.ngay_sinh),
          gioi_tinh: customer.gioi_tinh || "Nam",
          dia_chi: customer.dia_chi || "",
          hang_thanh_vien: customer.hang_thanh_vien || "Standard",
          trang_thai: customer.trang_thai || "Hoạt động",
        });
      } else {
        setForm({
          ten_kh: "",
          email: "",
          so_dien_thoai: "",
          mat_khau: "",
          ngay_sinh: "",
          gioi_tinh: "Nam",
          dia_chi: "",
          hang_thanh_vien: "Standard",
          trang_thai: "Hoạt động",
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, customer]);

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    
    // Attempt to safely parse date keeping the correct day
    const dateObj = new Date(dateValue);
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    
    return dateValue.split("T")[0];
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const err = {};

    if (!form.ten_kh.trim()) err.ten_kh = "Vui lòng nhập tên khách hàng";
    if (!form.email.trim()) err.email = "Vui lòng nhập email";
    if (!form.so_dien_thoai.trim()) err.so_dien_thoai = "Vui lòng nhập số điện thoại";
    if (mode === "add" && !form.mat_khau.trim()) err.mat_khau = "Vui lòng nhập mật khẩu";
    if (!form.ngay_sinh) {
      err.ngay_sinh = "Vui lòng chọn ngày sinh";
    } else {
      const today = new Date().toISOString().split("T")[0];
      if (form.ngay_sinh > today) {
        err.ngay_sinh = "Ngày sinh không được lớn hơn ngày hiện tại";
        toast.error("Ngày sinh không được lớn hơn ngày hiện tại");
      }
    }
    if (!form.dia_chi.trim()) err.dia_chi = "Vui lòng nhập địa chỉ";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
  if (!validate()) return;

  try {
    if (mode === "add") {
      await axios.post("http://localhost:5000/api/customers", form);
      toast.success("Thêm khách hàng thành công");
    } else {
      await axios.put(
        `http://localhost:5000/api/customers/${customer.ma_kh}`,
        form
      );
      toast.success("Cập nhật thông tin khách hàng thành công");
    }

    reload();
    onClose();
  } catch (err) {
    console.log(err);
    toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
  }
};
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="relative w-full max-w-[560px] rounded-2xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-500 transition hover:text-slate-700"
        >
          <X size={22} />
        </button>

        <div className="px-7 pb-7 pt-6">
          <h2 className="mb-8 text-xl font-bold text-slate-900">
            {mode === "add" ? "Thêm khách hàng" : "Chỉnh sửa thông tin"}
          </h2>

          <div className="space-y-5">
            <InputField
              icon={<User size={18} className="text-slate-500" />}
              label="Tên khách hàng"
              required
              error={errors.ten_kh}
            >
              <input
                type="text"
                value={form.ten_kh}
                onChange={(e) => handleChange("ten_kh", e.target.value)}
                className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 ${
                  errors.ten_kh
                    ? "border-red-300 focus:border-red-400"
                    : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </InputField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                icon={<Mail size={18} className="text-slate-500" />}
                label="Email"
                required
                error={errors.email}
              >
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 ${
                    errors.email
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
                />
              </InputField>

              <InputField
                icon={<Phone size={18} className="text-slate-500" />}
                label="Số điện thoại"
                required
                error={errors.so_dien_thoai}
              >
                <input
                  type="text"
                  value={form.so_dien_thoai}
                  onChange={(e) => handleChange("so_dien_thoai", e.target.value)}
                  className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 ${
                    errors.so_dien_thoai
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
                />
              </InputField>
            </div>

            <InputField
              icon={<Lock size={18} className="text-slate-500" />}
              label="Mật khẩu"
              helper="để trống nếu không thay đổi"
              required={mode === "add"}
              error={errors.mat_khau}
            >
              <input
                type="password"
                placeholder="Nhập mật khẩu mới (không bắt buộc)"
                value={form.mat_khau}
                onChange={(e) => handleChange("mat_khau", e.target.value)}
                className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 ${
                  errors.mat_khau
                    ? "border-red-300 focus:border-red-400"
                    : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </InputField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.8fr_1fr]">
              <InputField
                icon={<Calendar size={18} className="text-slate-500" />}
                label="Ngày sinh"
                required
                error={errors.ngay_sinh}
              >
                <input
                  type="date"
                  value={form.ngay_sinh}
                  onChange={(e) => handleChange("ngay_sinh", e.target.value)}
                  className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition ${
                    errors.ngay_sinh
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
                />
              </InputField>

              <InputField
                icon={<Users size={18} className="text-slate-500" />}
                label="Giới tính"
              >
                <select
                  value={form.gioi_tinh}
                  onChange={(e) => handleChange("gioi_tinh", e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </InputField>
            </div>

            <InputField
              icon={<MapPin size={18} className="text-slate-500" />}
              label="Địa chỉ"
              required
              error={errors.dia_chi}
            >
              <input
                type="text"
                value={form.dia_chi}
                onChange={(e) => handleChange("dia_chi", e.target.value)}
                className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 ${
                  errors.dia_chi
                    ? "border-red-300 focus:border-red-400"
                    : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </InputField>
          </div>

          <div className="mt-9 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Hủy
            </button>

            <button
              onClick={handleSubmit}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {mode === "add" ? "Thêm khách hàng" : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({
  icon,
  label,
  required = false,
  helper = "",
  error,
  children,
}) => {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800">
        {icon}
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
        {helper && <span className="text-sm font-normal text-slate-500">({helper})</span>}
      </label>

      {children}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default CustomerFormModal;