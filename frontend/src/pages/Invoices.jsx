import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Film
} from "lucide-react";

import InvoiceDetailModal from "./InvoiceDetailModal";
import InvoiceDeleteModal from "./InvoiceDeleteModal";
import { Plus } from "lucide-react";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  


  const fetchInvoices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/invoices", {
        params: {
          page,
          limit,
          search: searchTerm,
        },
      });

      setInvoices(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalInvoices(res.data.total || 0);
    } catch (err) {
      console.log("Lỗi lấy danh sách hóa đơn:", err);
      toast.error("Không thể tải danh sách hóa đơn");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, searchTerm]);

  // View Details
  const handleViewDetail = async (invoice) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/invoices/${invoice.ma_hd}`);
      setSelectedInvoice(res.data);
      setOpenDetail(true);
    } catch (err) {
      toast.error("Không thể tải chi tiết hóa đơn");
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/invoices/${selectedInvoice.ma_hd}`);
      toast.success("Xóa hóa đơn thành công");
      setOpenDelete(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Xóa thất bại");
    }
  };

  const formatCurrency = (val) => Number(val).toLocaleString("vi-VN") + " ₫";

  const formatDateTime = (dt) => {
    if (!dt) return "—";
    const d = new Date(dt);
    return d.toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
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

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Quản lý hóa đơn
            </h1>
            <p className="mt-2 text-[17px] text-slate-600">
              Quản lý, tìm kiếm và in hóa đơn khách hàng
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-col flex-1">
              <span className="text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Tìm kiếm</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Mã HD, tên khách/nhân viên..."
                  value={searchTerm}
                  onChange={(e) => {
                    setPage(1);
                    setSearchTerm(e.target.value);
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="hidden h-11 w-11 mt-5 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 md:flex">
              <Filter size={18} />
            </div>




          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-800">
                  <th className="px-5 py-4 font-semibold">Mã HD</th>
                  <th className="px-5 py-4 font-semibold">Khách hàng</th>
                  <th className="px-5 py-4 font-semibold">Nhân viên</th>
                  <th className="px-5 py-4 font-semibold">Ngày lập</th>
                  <th className="px-5 py-4 font-semibold text-right">Tổng tiền</th>
                  <th className="px-5 py-4 text-center font-semibold">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                      Không có hóa đơn phù hợp
                    </td>
                  </tr>
                ) : (
                  invoices.map((hd) => (
                    <tr key={hd.ma_hd} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-semibold text-blue-600">#{hd.ma_hd}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{hd.ten_kh || "Khách lẻ"}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{hd.ten_nv || "—"}</td>
                      <td className="px-5 py-4 text-slate-600">{formatDateTime(hd.ngay_lap)}</td>
                      <td className="px-5 py-4 text-right font-medium text-slate-800">
                        {formatCurrency(hd.tong_tien)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleViewDetail(hd)}
                            className="text-blue-500 transition hover:scale-110 hover:text-blue-700"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInvoice(hd);
                              setOpenDelete(true);
                            }}
                            className="text-red-500 transition hover:scale-110 hover:text-red-600"
                            title="Xóa hóa đơn"
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

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Hiển thị {invoices.length} / {totalInvoices} hóa đơn
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Trước
              </button>

              {renderPagination()}

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
      />

      <InvoiceDeleteModal
        invoice={selectedInvoice}
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />

    </div>
  );
};

export default Invoices;
