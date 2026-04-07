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
  Plus,
} from "lucide-react";

import CustomerDetailModal from "../pages/CustomerDetailModal";
import CustomerFormModal from "../pages/CustomerFormModal";
import DeleteConfirmModal from "../pages/DeleteConfirmModal";
import AddCustomerModal from "../pages/AddCustomerModal";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [openDetail, setOpenDetail] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  const [mode, setMode] = useState("edit");

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/customers", {
        params: {
          page,
          limit,
          search: searchTerm,
          hang_thanh_vien: rankFilter,
          trang_thai: statusFilter,
        },
      });

      setCustomers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCustomers(res.data.total || 0);
    } catch (err) {
      console.log("Lỗi lấy danh sách khách hàng:", err);
      toast.error("Không thể tải danh sách khách hàng");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, searchTerm, rankFilter, statusFilter]);

  const getRankBadge = (rank) => {
    const normalizedRank = (rank || "").trim().toUpperCase();

    switch (normalizedRank) {
      case "SVIP":
        return (
          <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
            SVIP
          </span>
        );
      case "VIP":
        return (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            VIP
          </span>
        );
      case "STANDARD":
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            Standard
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = (status || "").trim();

    if (normalizedStatus === "Hoạt động") {
      return (
        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          Hoạt động
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
        Đã hủy
      </span>
    );
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/customers/${selectedCustomer.ma_kh}`
      );
      toast.success("Hủy tài khoản thành công");
      setOpenDelete(false);
      fetchCustomers();
    } catch (err) {
      console.log("Lỗi hủy tài khoản:", err);
      toast.error(err?.response?.data?.message || "Hủy tài khoản thất bại");
    }
  };

  const renderPagination = () => {
    const arr = [];
    for (let i = 1; i <= totalPages; i++) {
      arr.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`h-9 min-w-[36px] rounded-lg border px-3 text-sm font-medium transition ${page === i
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Quản lý khách hàng
            </h1>
          </div>

          <button
            onClick={() => setOpenAddModal(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Thêm khách hàng
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
                placeholder="Tìm kiếm theo tên khách hàng..."
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
              value={rankFilter}
              onChange={(e) => {
                setPage(1);
                setRankFilter(e.target.value);
              }}
              className="h-12 min-w-[200px] rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">Tất cả hạng</option>
              <option value="Standard">Standard</option>
              <option value="VIP">VIP</option>
              <option value="SVIP">SVIP</option>
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
              <option value="Hoạt động">Hoạt động</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/50">
                <tr className="text-left">
                  <th className="px-4 py-4 font-bold text-slate-700">Tên khách hàng</th>
                  <th className="px-4 py-4 font-bold text-slate-700">Email</th>
                  <th className="px-4 py-4 font-bold text-slate-700">Số điện thoại</th>
                  <th className="px-4 py-4 font-bold text-slate-700">Hạng thành viên</th>
                  <th className="px-4 py-4 font-bold text-slate-700">Điểm tích lũy</th>
                  <th className="px-4 py-4 font-bold text-slate-700">Trạng thái</th>
                  <th className="px-4 py-4 text-center font-bold text-slate-700">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Không có khách hàng phù hợp
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.ma_kh} className="border-t border-slate-200">
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {c.ten_kh}
                      </td>

                      <td className="px-4 py-4 text-slate-600">{c.email}</td>

                      <td className="px-4 py-4 text-slate-800">
                        {c.so_dien_thoai}
                      </td>

                      <td className="px-4 py-4">
                        {getRankBadge(c.hang_thanh_vien)}
                      </td>

                      <td className="px-4 py-4 text-slate-800 font-medium">
                        {c.diem_tich_luy?.toLocaleString("vi-VN") || 0}
                      </td>

                      <td className="px-4 py-4">
                        {getStatusBadge(c.trang_thai)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedCustomer(c);
                              setOpenDetail(true);
                            }}
                            className="text-blue-600 transition hover:scale-110"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCustomer(c);
                              setMode("edit");
                              setOpenForm(true);
                            }}
                            className="text-amber-500 transition hover:scale-110"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCustomer(c);
                              setOpenDelete(true);
                            }}
                            className="text-red-500 transition hover:scale-110"
                            title="Hủy tài khoản"
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
              Hiển thị {customers.length} / {totalCustomers} khách hàng
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

      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
      />

      <CustomerFormModal
        customer={selectedCustomer}
        isOpen={openForm}
        onClose={() => setOpenForm(false)}
        mode={mode}
        reload={fetchCustomers}
      />

      <DeleteConfirmModal
        customer={selectedCustomer}
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />

      <AddCustomerModal
        isOpen={openAddModal}
        onClose={() => setOpenAddModal(false)}
        reload={fetchCustomers}
      />
    </div>
  );
};

export default Customers;