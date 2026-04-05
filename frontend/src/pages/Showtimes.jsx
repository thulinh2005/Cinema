import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Plus,
  X,
} from "lucide-react";

const LocalDeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-xl p-6 shadow-lg text-center relative">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 text-sm mb-4">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal chi tiết suất chiếu
const ShowtimeDetailModal = ({ showtime, open, onOpenChange }) => {
  if (!open || !showtime) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-4 pr-10">
          Chi tiết suất chiếu
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-600">Phim</p>
              <p className="mt-1 text-base text-slate-900">
                {showtime.ten_phim}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Phòng chiếu</p>
              <p className="mt-1 text-base text-slate-900">
                {showtime.ten_phong}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Ngày chiếu</p>
              <p className="mt-1 text-base text-slate-900">
                {showtime.ngay_chieu}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Giờ bắt đầu</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {showtime.gio_chieu}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Giờ kết thúc</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {showtime.gio_ket_thuc}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Trạng thái</p>
              <p className="mt-1 text-base text-slate-900">
                {showtime.trang_thai}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Ghế trống</p>
              <p className="mt-1 text-base text-slate-900">
                <span className={showtime.tong_ghe - showtime.ghe_da_dat === 0 ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                  {showtime.tong_ghe - showtime.ghe_da_dat}
                </span>
                <span className="text-slate-500 text-sm ml-1">/ {showtime.tong_ghe}</span>
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Thông tin thêm:</span> Suất chiếu
              ID: {showtime.ma_suat_chieu}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg bg-slate-200 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal thêm/sửa suất chiếu
const ShowtimeFormModal = ({ showtime, mode, open, onOpenChange, onSuccess }) => {
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    ma_phim: "",
    ma_phong: "",
    ngay_chieu: "",
    gio_chieu: "",
    gio_ket_thuc: "",
    trang_thai: "Chưa chiếu",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMoviesAndRooms();
    }
  }, [open]);

  const fetchMoviesAndRooms = async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get("http://localhost:5000/api/showtimes/dropdown-data", config);

      setMovies(res.data.movies || []);
      setRooms(res.data.rooms || []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu chi tiết:", error.response || error);
      toast.error(error.response?.data?.message || "Không thể tải danh sách phim và phòng");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (mode === "edit" && showtime) {
      setFormData({
        ma_phim: showtime.ma_phim || "",
        ma_phong: showtime.ma_phong || "",
        ngay_chieu: showtime.ngay_chieu || "",
        gio_chieu: showtime.gio_chieu || "",
        gio_ket_thuc: showtime.gio_ket_thuc || "",
        trang_thai: showtime.trang_thai || "Chưa chiếu",
      });
    } else {
      setFormData({
        ma_phim: "",
        ma_phong: "",
        ngay_chieu: "",
        gio_chieu: "",
        gio_ket_thuc: "",
        trang_thai: "Chưa chiếu",
      });
    }
  }, [mode, showtime, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    if (!formData.ma_phim) {
      toast.error("Vui lòng chọn phim");
      return false;
    }
    if (!formData.ma_phong) {
      toast.error("Vui lòng chọn phòng chiếu");
      return false;
    }
    if (!formData.ngay_chieu) {
      toast.error("Vui lòng chọn ngày chiếu");
      return false;
    }

    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const todayStr = localNow.toISOString().split('T')[0];

    if (formData.ngay_chieu < todayStr) {
      toast.error("Không thể chọn ngày chiếu trong quá khứ");
      return false;
    }

    if (!formData.gio_chieu) {
      toast.error("Vui lòng nhập giờ bắt đầu");
      return false;
    }
    if (!formData.gio_ket_thuc) {
      toast.error("Vui lòng nhập giờ kết thúc");
      return false;
    }

    // Kiểm tra giờ kết thúc > giờ bắt đầu
    if (formData.gio_ket_thuc <= formData.gio_chieu) {
      toast.error("Giờ kết thúc phải lớn hơn giờ bắt đầu");
      return false;
    }

    const selectedMovie = movies.find(m => m.ma_phim.toString() === formData.ma_phim.toString());
    if (selectedMovie && selectedMovie.thoi_luong) {
      const start = new Date(`1970-01-01T${formData.gio_chieu}:00Z`);
      const end = new Date(`1970-01-01T${formData.gio_ket_thuc}:00Z`);
      let diffMins = (end - start) / 60000;
      if (diffMins < 0) diffMins += 24 * 60;

      if (diffMins < selectedMovie.thoi_luong) {
        toast.error(`Thời lượng suất chiếu (${diffMins} phút) không được nhỏ hơn thời lượng phim (${selectedMovie.thoi_luong} phút)`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (mode === "edit") {
        await axios.put(
          `http://localhost:5000/api/showtimes/${showtime.ma_suat_chieu}`,
          formData,
          config
        );
        toast.success("Cập nhật suất chiếu thành công");
      } else {
        await axios.post("http://localhost:5000/api/showtimes", formData, config);
        toast.success("Thêm suất chiếu thành công");
      }
      onSuccess();
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error(
        error?.response?.data?.message || "Lỗi khi lưu suất chiếu"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[calc(100vh-2rem)] overflow-y-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-6 pr-10">
          {mode === "edit" ? "Chỉnh sửa suất chiếu" : "Thêm suất chiếu mới"}
        </h2>

        {loadingData ? (
          <div className="py-8 text-center text-slate-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Chọn phim *
                </label>
                <select
                  name="ma_phim"
                  value={formData.ma_phim}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="">-- Chọn phim --</option>
                  {movies.map((m) => (
                    <option key={m.ma_phim} value={m.ma_phim}>
                      {m.ten_phim}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Chọn phòng chiếu *
                </label>
                <select
                  name="ma_phong"
                  value={formData.ma_phong}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((r) => (
                    <option key={r.ma_phong} value={r.ma_phong}>
                      {r.ten_phong}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ngày chiếu *
                </label>
                <input
                  type="date"
                  name="ngay_chieu"
                  value={formData.ngay_chieu}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Giờ bắt đầu *
                </label>
                <input
                  type="time"
                  name="gio_chieu"
                  value={formData.gio_chieu}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Giờ kết thúc *
                </label>
                <input
                  type="time"
                  name="gio_ket_thuc"
                  value={formData.gio_ket_thuc}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Trạng thái
                </label>
                <select
                  name="trang_thai"
                  value={formData.trang_thai}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Chưa chiếu">Chưa chiếu</option>
                  <option value="Đang chiếu">Đang chiếu</option>
                  <option value="Đã chiếu">Đã chiếu</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg border border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Đang lưu..."
                  : mode === "edit"
                    ? "Cập nhật"
                    : "Thêm"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const Showtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRoom, setFilterRoom] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShowtimes, setTotalShowtimes] = useState(0);

  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [mode, setMode] = useState("add");

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get("http://localhost:5000/api/rooms?limit=100", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(res.data || []);
    } catch (err) {
      console.log("Lỗi lấy danh sách phòng:", err);
    }
  };

  const fetchShowtimes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get("http://localhost:5000/api/showtimes", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit,
          ngay_chieu: filterDate,
          trang_thai: filterStatus,
          ma_phong: filterRoom,
        },
      });

      setShowtimes(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalShowtimes(res.data.total || 0);
    } catch (err) {
      console.log("Lỗi lấy danh sách suất chiếu:", err);
      toast.error("Không thể tải danh sách suất chiếu");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchShowtimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterDate, filterStatus, filterRoom]);

  const getStatusBadge = (status) => {
    const normalizedStatus = (status || "").trim();

    if (normalizedStatus === "Đang chiếu") {
      return (
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Đang chiếu
        </span>
      );
    }

    if (normalizedStatus === "Chưa chiếu") {
      return (
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
          Chưa chiếu
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
        Đã chiếu
      </span>
    );
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/showtimes/${selectedShowtime.ma_suat_chieu}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Xóa suất chiếu thành công");
      setOpenDelete(false);
      fetchShowtimes();
    } catch (err) {
      console.log("Lỗi xóa suất chiếu:", err);
      toast.error(err?.response?.data?.message || "Xóa suất chiếu thất bại");
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
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Quản lý suất chiếu
            </h1>
            <p className="mt-2 text-[17px] text-slate-600">
              Quản lý thông tin suất chiếu
            </p>
          </div>

          <button
            onClick={() => {
              setMode("add");
              setSelectedShowtime(null);
              setOpenAddModal(true);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Thêm suất chiếu
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="hidden h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 lg:flex">
              <Filter size={18} />
            </div>

            <div className="flex-1">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => {
                  setPage(1);
                  setFilterDate(e.target.value);
                }}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Chọn ngày chiếu"
              />
            </div>

            <select
              value={filterRoom}
              onChange={(e) => {
                setPage(1);
                setFilterRoom(e.target.value);
              }}
              className="h-12 min-w-[180px] rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">Tất cả phòng</option>
              {rooms.map((room) => (
                <option key={room.ma_phong} value={room.ma_phong}>
                  {room.ten_phong}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => {
                setPage(1);
                setFilterStatus(e.target.value);
              }}
              className="h-12 min-w-[180px] rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Chưa chiếu">Chưa chiếu</option>
              <option value="Đang chiếu">Đang chiếu</option>
              <option value="Đã chiếu">Đã chiếu</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-800">
                  <th className="px-4 py-4 font-semibold">Phim</th>
                  <th className="px-4 py-4 font-semibold">Phòng</th>
                  <th className="px-4 py-4 font-semibold">Ngày chiếu</th>
                  <th className="px-4 py-4 font-semibold">Giờ bắt đầu</th>
                  <th className="px-4 py-4 font-semibold">Giờ kết thúc</th>
                  <th className="px-4 py-4 font-semibold">Ghế trống</th>
                  <th className="px-4 py-4 font-semibold">Trạng thái</th>
                  <th className="px-4 py-4 text-center font-semibold">
                    Hoạt động
                  </th>
                </tr>
              </thead>

              <tbody>
                {showtimes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Không có suất chiếu phù hợp
                    </td>
                  </tr>
                ) : (
                  showtimes.map((showtime) => (
                    <tr
                      key={showtime.ma_suat_chieu}
                      className="border-t border-slate-200"
                    >
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {showtime.ten_phim}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {showtime.ten_phong}
                      </td>

                      <td className="px-4 py-4 text-slate-800">
                        {showtime.ngay_chieu}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {showtime.gio_chieu}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {showtime.gio_ket_thuc}
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-800">
                        <span className={showtime.tong_ghe - showtime.ghe_da_dat === 0 ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                          {showtime.tong_ghe - showtime.ghe_da_dat}
                        </span>
                        <span className="text-slate-500 text-xs ml-1">/ {showtime.tong_ghe}</span>
                      </td>

                      <td className="px-4 py-4">
                        {getStatusBadge(showtime.trang_thai)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedShowtime(showtime);
                              setOpenDetail(true);
                            }}
                            className="text-blue-600 transition hover:scale-110"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedShowtime(showtime);
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
                              setSelectedShowtime(showtime);
                              setOpenDelete(true);
                            }}
                            className="text-red-500 transition hover:scale-110"
                            title="Xóa suất chiếu"
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
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {renderPagination()}
          </div>
        )}

        <div className="mt-4 text-center text-sm text-slate-600">
          Hiển thị {showtimes.length} / {totalShowtimes} suất chiếu
        </div>
      </div>

      <ShowtimeDetailModal
        showtime={selectedShowtime}
        open={openDetail}
        onOpenChange={setOpenDetail}
      />

      <ShowtimeFormModal
        showtime={selectedShowtime}
        mode={mode}
        open={openAddModal || openForm}
        onOpenChange={() => {
          setOpenAddModal(false);
          setOpenForm(false);
        }}
        onSuccess={() => {
          setOpenAddModal(false);
          setOpenForm(false);
          fetchShowtimes();
        }}
      />

      <LocalDeleteConfirmModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
        title="Xóa suất chiếu"
        message="Bạn có chắc chắn muốn xóa suất chiếu này? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default Showtimes;
