import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
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

const initialForm = {
  ten_kh: "",
  email: "",
  so_dien_thoai: "",
  mat_khau: "",
  ngay_sinh: "",
  gioi_tinh: "Nam",
  dia_chi: "",
};

const AddCustomerModal = ({ isOpen, onClose, reload }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm);
      setErrors({});
      setLoading(false);
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.ten_kh.trim()) {
      newErrors.ten_kh = "Vui lòng nhập tên khách hàng";
    }

    if (!form.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (!form.so_dien_thoai.trim()) {
      newErrors.so_dien_thoai = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{9,11}$/.test(form.so_dien_thoai)) {
      newErrors.so_dien_thoai = "Số điện thoại không hợp lệ";
    }

    if (!form.mat_khau.trim()) {
      newErrors.mat_khau = "Vui lòng nhập mật khẩu";
    } else if (form.mat_khau.length < 6) {
      newErrors.mat_khau = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!form.ngay_sinh) {
      newErrors.ngay_sinh = "Vui lòng chọn ngày sinh";
    }

    if (!form.dia_chi.trim()) {
      newErrors.dia_chi = "Vui lòng nhập địa chỉ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/customers", form);

      toast.success("Thêm khách hàng thành công");
      reload?.();
      onClose?.();
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Thêm khách hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="relative w-full max-w-[560px] rounded-2xl bg-white shadow-2xl">
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute right-5 top-5 text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={22} />
        </button>

        <div className="px-7 pb-7 pt-6">
          <h2 className="mb-8 text-[20px] font-bold text-slate-900">
            Thêm khách hàng
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
                placeholder="Nhập tên khách hàng"
                value={form.ten_kh}
                onChange={(e) => handleChange("ten_kh", e.target.value)}
                className={inputClass(errors.ten_kh)}
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
                  placeholder="Nhập email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={inputClass(errors.email)}
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
                  placeholder="Nhập số điện thoại"
                  value={form.so_dien_thoai}
                  onChange={(e) => handleChange("so_dien_thoai", e.target.value)}
                  className={inputClass(errors.so_dien_thoai)}
                />
              </InputField>
            </div>

            <InputField
              icon={<Lock size={18} className="text-slate-500" />}
              label="Mật khẩu"
              required
              error={errors.mat_khau}
            >
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={form.mat_khau}
                onChange={(e) => handleChange("mat_khau", e.target.value)}
                className={inputClass(errors.mat_khau)}
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
                  className={inputClass(errors.ngay_sinh)}
                />
              </InputField>

              <InputField
                icon={<Users size={18} className="text-slate-500" />}
                label="Giới tính"
              >
                <select
                  value={form.gioi_tinh}
                  onChange={(e) => handleChange("gioi_tinh", e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-[15px] text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                placeholder="Nhập địa chỉ"
                value={form.dia_chi}
                onChange={(e) => handleChange("dia_chi", e.target.value)}
                className={inputClass(errors.dia_chi)}
              />
            </InputField>
          </div>

          <div className="mt-9 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-[15px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang lưu..." : "Thêm khách hàng"}
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
  error,
  children,
}) => {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-[15px] font-medium text-slate-800">
        {icon}
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>

      {children}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

const inputClass = (hasError) =>
  `h-12 w-full rounded-xl border bg-white px-4 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 ${
    hasError
      ? "border-red-300 focus:border-red-400"
      : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  }`;

export default AddCustomerModal;