import React, { useRef } from "react";
import { X, Printer, User, UserCog, CalendarDays, CreditCard, Ticket, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const InvoiceDetailModal = ({ invoice, isOpen, onClose }) => {
  const printRef = useRef();

  if (!isOpen || !invoice) return null;

  const formatCurrency = (val) =>
    Number(val).toLocaleString("vi-VN") + " ₫";

  const formatDateTime = (dt) => {
    if (!dt) return "—";
    const d = new Date(dt);
    return d.toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatDate = (dt) => {
    if (!dt) return "—";
    const d = new Date(dt);
    return d.toLocaleDateString("vi-VN");
  };

  const handlePrint = () => {
    toast.success("Đã ghi nhận yêu cầu in hóa đơn cho máy in khác.");
    // Thêm logic thực tế gửi sang máy in ở đây
  };

  const tickets = invoice.tickets || [];
  const products = invoice.products || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Chi tiết hóa đơn #{invoice.ma_hd}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {formatDateTime(invoice.ngay_lap)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Printer size={16} />
              In hóa đơn
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5" ref={printRef}>
          {/* Print-only header */}
          <div className="hidden print:block header">
            <h1>🎬 Cinema — Hóa Đơn #{invoice.ma_hd}</h1>
            <p>{formatDateTime(invoice.ngay_lap)}</p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <User size={15} className="text-blue-600" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Khách hàng</span>
              </div>
              <p className="font-semibold text-slate-800 text-sm">{invoice.ten_kh || "Khách lẻ"}</p>
              {invoice.so_dien_thoai && (
                <p className="text-xs text-slate-500 mt-0.5">{invoice.so_dien_thoai}</p>
              )}
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <UserCog size={15} className="text-purple-600" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nhân viên</span>
              </div>
              <p className="font-semibold text-slate-800 text-sm">{invoice.ten_nv || "—"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays size={15} className="text-green-600" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ngày lập</span>
              </div>
              <p className="font-semibold text-slate-800 text-sm">{formatDateTime(invoice.ngay_lap)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={15} className="text-blue-600" />
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Tổng tiền</span>
              </div>
              <p className="font-bold text-blue-700 text-base">{formatCurrency(invoice.tong_tien)}</p>
            </div>
          </div>

          {/* Vé section */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Ticket size={16} className="text-slate-600" />
              <h3 className="font-semibold text-slate-800">Danh sách vé ({tickets.length})</h3>
            </div>
            {tickets.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-xl">Không có vé</p>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/50">
                    <tr className="text-slate-700">
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Phim</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Phòng</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Ngày chiếu</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Giờ</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Ghế</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Loại</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-700">Giá vé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t.ma_ve} className="border-t border-slate-200">
                        <td className="px-4 py-3 font-medium text-slate-800">{t.ten_phim}</td>
                        <td className="px-4 py-3 text-slate-600">{t.ten_phong}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(t.ngay_chieu)}</td>
                        <td className="px-4 py-3 text-slate-600">{t.gio_chieu?.slice(0, 5)}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800">{t.so_ghe}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            t.loai_ghe === "VIP"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : t.loai_ghe === "SWEETBOX"
                              ? "bg-pink-50 text-pink-700 border border-pink-200"
                              : "bg-sky-50 text-sky-700 border border-sky-200"
                          }`}>
                            {t.loai_ghe}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          {formatCurrency(t.gia_ve)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sản phẩm section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart size={16} className="text-slate-600" />
              <h3 className="font-semibold text-slate-800">Sản phẩm ({products.length})</h3>
            </div>
            {products.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-xl">Không có sản phẩm</p>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/50">
                    <tr className="text-slate-700">
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Sản phẩm</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Loại</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-700">Số lượng</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-700">Đơn giá</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-700">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.ma_ct} className="border-t border-slate-200">
                        <td className="px-4 py-3 font-medium text-slate-800">{p.ten_sp}</td>
                        <td className="px-4 py-3 text-slate-600">{p.loai_sp}</td>
                        <td className="px-4 py-3 text-center text-slate-700">{p.so_luong}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(p.don_gia)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          {formatCurrency(p.don_gia * p.so_luong)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Total footer */}
          <div className="mt-5 flex justify-end">
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-3 flex items-center gap-4">
              <span className="text-sm font-medium text-blue-700">Tổng cộng:</span>
              <span className="text-xl font-bold text-blue-700">{formatCurrency(invoice.tong_tien)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
