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

// Modal chi tiết phim
const MovieDetailModal = ({ movie, open, onOpenChange }) => {
  if (!open || !movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-slate-100"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Chi tiết phim
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-600">Mã phim</p>
              <p className="mt-1 text-base text-slate-900">{movie.ma_phim}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">Tên phim</p>
              <p className="mt-1 text-base text-slate-900">{movie.ten_phim}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Thể loại</p>
              <p className="mt-1 text-base text-slate-900">{movie.the_loai}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">
                Thời lượng (phút)
              </p>
              <p className="mt-1 text-base text-slate-900">
                {movie.thoi_luong}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Độ tuổi</p>
              <p className="mt-1 text-base text-slate-900">
                {movie.do_tuoi_gioi_han}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">
                Ngày khởi chiếu
              </p>
              <p className="mt-1 text-base text-slate-900">
                {movie.ngay_khoi_chieu}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Trạng thái</p>
              <p className="mt-1 text-base text-slate-900">
                {movie.tinh_trang}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">
                Nước sản xuất
              </p>
              <p className="mt-1 text-base text-slate-900">
                {movie.nuoc_san_xuat}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-600">Mô tả</p>
            <p className="mt-1 text-sm text-slate-700 line-clamp-4">
              {movie.mo_ta}
            </p>
          </div>

          {movie.link_trailer && (
            <div>
              <p className="text-sm font-semibold text-slate-600">Link trailer</p>
              <a
                href={movie.link_trailer}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-sm text-blue-600 hover:underline break-all"
              >
                {movie.link_trailer}
              </a>
            </div>
          )}

          {movie.anh_poster && (
            <div>
              <p className="text-sm font-semibold text-slate-600">Poster</p>
              <p className="mt-1 text-sm text-slate-600">{movie.anh_poster}</p>
            </div>
          )}
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

// Modal thêm/sửa phim
const MovieFormModal = ({ movie, mode, open, onOpenChange, onSuccess }) => {
  const [formData, setFormData] = useState({
    ma_phim: "",
    ten_phim: "",
    the_loai: "",
    thoi_luong: "",
    ngay_khoi_chieu: "",
    mo_ta: "",
    anh_poster: "",
    link_trailer: "",
    do_tuoi_gioi_han: "P",
    nuoc_san_xuat: "",
    tinh_trang: "Sắp chiếu",
  });

  const [loading, setLoading] = useState(false);
  const [posterPreview, setPosterPreview] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (mode === "edit" && movie) {
      console.log("EDIT MOVIE:", movie);

      setFormData({
        ma_phim: movie.ma_phim || "",
        ten_phim: movie.ten_phim || "",
        the_loai: movie.the_loai || "",
        thoi_luong: movie.thoi_luong || "",
        ngay_khoi_chieu: movie.ngay_khoi_chieu || "",
        mo_ta: movie.mo_ta || "",
        anh_poster: movie.anh_poster || "",
        link_trailer: movie.link_trailer || "",
        do_tuoi_gioi_han: movie.do_tuoi_gioi_han || "P",
        nuoc_san_xuat: movie.nuoc_san_xuat || "",
        tinh_trang: movie.tinh_trang || "Sắp chiếu",
      });
    } else {
      setFormData({
        ma_phim: "",
        ten_phim: "",
        the_loai: "",
        thoi_luong: "",
        ngay_khoi_chieu: "",
        mo_ta: "",
        anh_poster: "",
        link_trailer: "",
        do_tuoi_gioi_han: "P",
        nuoc_san_xuat: "",
        tinh_trang: "Sắp chiếu",
      });
      setPosterPreview(null);
    }
    // Set preview nếu có ảnh in edit mode
    if (mode === "edit" && movie && movie.anh_poster) {
      setPosterPreview(`http://localhost:5000${movie.anh_poster}`);
    }
  }, [mode, movie, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPosterPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper: Extract YouTube video ID
  const getYoutubeVideoId = (url) => {
    if (!url.trim()) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*$/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeVideoId = getYoutubeVideoId(formData.link_trailer);

  const validate = () => {
    if (!formData.ten_phim.trim()) {
      toast.error("Tên phim không được để trống");
      return false;
    }
    if (!formData.do_tuoi_gioi_han) {
      toast.error("Vui lòng chọn độ tuổi giới hạn");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      // Tạo FormData để gửi file
      const data = new FormData();
      data.append("ten_phim", formData.ten_phim);
      data.append("the_loai", formData.the_loai);
      data.append("thoi_luong", formData.thoi_luong);
      data.append("ngay_khoi_chieu", formData.ngay_khoi_chieu);
      data.append("mo_ta", formData.mo_ta);
      data.append("link_trailer", formData.link_trailer);
      data.append("do_tuoi_gioi_han", formData.do_tuoi_gioi_han);
      data.append("nuoc_san_xuat", formData.nuoc_san_xuat);
      data.append("tinh_trang", formData.tinh_trang);

      // Thêm file nếu có
      if (fileInputRef.current?.files?.[0]) {
        data.append("anh_poster", fileInputRef.current.files[0]);
      } else if (mode === "edit") {
        // QUAN TRỌNG: giữ lại ảnh cũ khi không upload ảnh mới
        data.append("anh_poster", formData.anh_poster);
      }

      if (mode === "edit") {
        await axios.put(
          `http://localhost:5000/api/movies/${movie.ma_phim}`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Cập nhật phim thành công");
      } else {
        await axios.post("http://localhost:5000/api/movies", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Thêm phim thành công");
      }
      onSuccess();
    } catch (error) {
      console.error("Lỗi:", error);
      const errorMessage = error?.response?.data?.message || "Lỗi khi lưu phim";
      const errorDetail = error?.response?.data?.detail;

      if (errorDetail) {
        toast.error(errorDetail);
      } else {
        toast.error(errorMessage);
      }
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
          className="sticky top-0 right-0 absolute right-4 top-4 rounded-full p-1 hover:bg-slate-100 z-10"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {mode === "edit" ? "Chỉnh sửa phim" : "Thêm phim mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* MÃ PHIM */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mã phim
              </label>
              <input
                type="text"
                value={formData.ma_phim || "Tự động"}
                disabled
                className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tên phim *
              </label>
              <input
                type="text"
                name="ten_phim"
                value={formData.ten_phim}
                onChange={handleChange}
                placeholder="Nhập tên phim"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Thể loại
              </label>
              <input
                type="text"
                name="the_loai"
                value={formData.the_loai}
                onChange={handleChange}
                placeholder="VD: Hành động, Hài hước..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Thời lượng (phút)
              </label>
              <input
                type="number"
                name="thoi_luong"
                value={formData.thoi_luong}
                onChange={handleChange}
                placeholder="VD: 120"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ngày khởi chiếu
              </label>
              <input
                type="date"
                name="ngay_khoi_chieu"
                value={formData.ngay_khoi_chieu}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Độ tuổi giới hạn *
              </label>
              <select
                name="do_tuoi_gioi_han"
                value={formData.do_tuoi_gioi_han}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="P">P - Phổ thông</option>
                <option value="K">K - Trẻ em</option>
                <option value="T13">T13 - 13+</option>
                <option value="T16">T16 - 16+</option>
                <option value="T18">T18 - 18+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nước sản xuất
              </label>
              <input
                type="text"
                name="nuoc_san_xuat"
                value={formData.nuoc_san_xuat}
                onChange={handleChange}
                placeholder="VD: Mỹ, Nhật Bản..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Trạng thái
              </label>
              <select
                name="tinh_trang"
                value={formData.tinh_trang}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="Sắp chiếu">Sắp chiếu</option>
                <option value="Đang chiếu">Đang chiếu</option>
                <option value="Ngừng chiếu">Ngừng chiếu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ảnh Poster
              </label>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {posterPreview && (
                  <div className="rounded-lg border border-slate-300 p-2">
                    <img
                      src={posterPreview}
                      alt="Preview"
                      className="h-32 w-auto object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Link Trailer
            </label>
            <input
              type="text"
              name="link_trailer"
              value={formData.link_trailer}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=... hoac https://youtu.be/..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
            />
            {youtubeVideoId && (
              <div className="mt-3 rounded-lg overflow-hidden border border-slate-300 bg-slate-900" style={{ aspectRatio: "16 / 9" }}>
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="mo_ta"
              value={formData.mo_ta}
              onChange={handleChange}
              placeholder="Nhập mô tả về phim"
              rows="4"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white resize-none"
            />
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
              {loading ? "Đang lưu..." : mode === "edit" ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ageRatingFilter, setAgeRatingFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [mode, setMode] = useState("add");

  const fetchMovies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/movies", {
        params: {
          page,
          limit,
          search: searchTerm,
          tinh_trang: statusFilter,
          do_tuoi_gioi_han: ageRatingFilter,
          nuoc_san_xuat: countryFilter,
        },
      });

      setMovies(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalMovies(res.data.total || 0);
    } catch (err) {
      console.log("Lỗi lấy danh sách phim:", err);
      toast.error("Không thể tải danh sách phim");
    }
  };

  // --- HÀM XÓA ---
  const handleDeleteClick = (movie) => {
    setSelectedMovie(movie);
    setOpenDelete(true);
  };

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, statusFilter, ageRatingFilter, countryFilter]);

  const getStatusBadge = (status) => {
    const normalizedStatus = (status || "").trim();

    if (normalizedStatus === "Đang chiếu") {
      return (
        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          Đang chiếu
        </span>
      );
    }

    if (normalizedStatus === "Sắp chiếu") {
      return (
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Sắp chiếu
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
        Ngừng chiếu
      </span>
    );
  };

  const getRatingBadge = (rating) => {
    const normalizedRating = (rating || "").trim();

    switch (normalizedRating) {
      case "T18":
        return (
          <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
            T18
          </span>
        );
      case "T16":
        return (
          <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
            T16
          </span>
        );
      case "T13":
        return (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
            T13
          </span>
        );
      case "K":
        return (
          <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-700">
            K
          </span>
        );
      case "P":
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
            P
          </span>
        );
    }
  };
  const confirmDelete = async () => {
    // Kiểm tra xem state selectedMovie có tồn tại không
    if (!selectedMovie) {
      toast.error("Không tìm thấy thông tin phim để xóa");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/movies/${selectedMovie.ma_phim}`);
      toast.success("Xóa phim thành công");
      setOpenDelete(false);
      setSelectedMovie(null);
      fetchMovies();  // load lại danh sách

    } catch (error) {
      toast.error("Xóa phim thất bại");
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
              Quản lý phim
            </h1>
            <p className="mt-2 text-[17px] text-slate-600">
              Quản lý thông tin phim
            </p>
          </div>

          <button
            onClick={() => {
              setMode("add");
              setSelectedMovie(null);
              setOpenAddModal(true);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Thêm phim
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
                placeholder="Tìm kiếm theo tên phim..."
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
              value={ageRatingFilter}
              onChange={(e) => {
                setPage(1);
                setAgeRatingFilter(e.target.value);
              }}
              className="h-12 min-w-[180px] rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">Tất cả tuổi</option>
              <option value="P">P - Phổ thông</option>
              <option value="K">K - Trẻ em</option>
              <option value="T13">T13 - 13+</option>
              <option value="T16">T16 - 16+</option>
              <option value="T18">T18 - 18+</option>
            </select>

            <select
              value={countryFilter}
              onChange={(e) => {
                setPage(1);
                setCountryFilter(e.target.value);
              }}
              className="h-12 min-w-[180px] rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">Tất cả nước</option>
              <option value="Mỹ">Mỹ</option>
              <option value="Nhật Bản">Nhật Bản</option>
              <option value="Hàn Quốc">Hàn Quốc</option>
              <option value="Trung Quốc">Trung Quốc</option>
              <option value="Việt Nam">Việt Nam</option>
              <option value="Pháp">Pháp</option>
              <option value="Anh">Anh</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="h-12 min-w-[180px] rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Đang chiếu">Đang chiếu</option>
              <option value="Sắp chiếu">Sắp chiếu</option>
              <option value="Ngừng chiếu">Ngừng chiếu</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-800">
                  <th className="px-4 py-4 font-semibold">Mã phim</th>
                  <th className="px-4 py-4 font-semibold">Tên phim</th>
                  <th className="px-4 py-4 font-semibold">Thể loại</th>
                  <th className="px-4 py-4 font-semibold">Thời lượng</th>
                  <th className="px-4 py-4 font-semibold">Độ tuổi</th>
                  <th className="px-4 py-4 font-semibold">Ngày khởi chiếu</th>
                  <th className="px-4 py-4 font-semibold">Nước sản xuất</th>
                  <th className="px-4 py-4 font-semibold">Mô tả</th>
                  <th className="px-4 py-4 font-semibold">Poster</th>
                  <th className="px-4 py-4 font-semibold">Trailer</th>
                  <th className="px-4 py-4 font-semibold">Trạng thái</th>
                  <th className="px-4 py-4 text-center font-semibold">
                    Hoạt động
                  </th>
                </tr>
              </thead>

              <tbody>
                {movies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Không có phim nào phù hợp
                    </td>
                  </tr>
                ) : (
                  movies.map((movie) => (
                    <tr key={movie.ma_phim} className="border-t border-slate-200">

                      <td className="px-4 py-4 text-slate-800 font-semibold">
                        {movie.ma_phim}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {movie.ten_phim}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {movie.the_loai}
                      </td>

                      <td className="px-4 py-4 text-slate-800">
                        {movie.thoi_luong}
                      </td>

                      <td className="px-4 py-4">
                        {getRatingBadge(movie.do_tuoi_gioi_han)}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {movie.ngay_khoi_chieu}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {movie.nuoc_san_xuat || "-"}
                      </td>

                      <td className="px-4 py-4 text-slate-600 max-w-xs">
                        <span className="line-clamp-2 text-xs">
                          {movie.mo_ta ? movie.mo_ta.substring(0, 50) + "..." : "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {movie.anh_poster ? (
                          <div className="h-16 w-12 overflow-hidden rounded-md border border-slate-300">
                            <img
                              src={movie.anh_poster.startsWith('http') ? movie.anh_poster : `http://localhost:5000${movie.anh_poster}`}
                              alt={movie.ten_phim}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {movie.link_trailer ? (
                          <a
                            href={movie.link_trailer}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >
                            Xem
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {getStatusBadge(movie.tinh_trang)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedMovie(movie);
                              setOpenDetail(true);
                            }}
                            className="text-blue-600 transition hover:scale-110"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedMovie(movie);
                              setMode("edit");
                              setOpenForm(true);
                            }}
                            className="text-amber-500 transition hover:scale-110"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(movie)}
                            className="text-red-500 transition hover:scale-110"
                            title="Xóa phim"
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
          Hiển thị {movies.length} / {totalMovies} phim
        </div>
      </div>

      <MovieDetailModal
        movie={selectedMovie}
        open={openDetail}
        onOpenChange={setOpenDetail}
      />

      <MovieFormModal
        movie={selectedMovie}
        mode={mode}
        open={openAddModal || openForm}
        onOpenChange={() => {
          setOpenAddModal(false);
          setOpenForm(false);
        }}
        onSuccess={() => {
          setOpenAddModal(false);
          setOpenForm(false);
          fetchMovies();
        }}
      />

      <LocalDeleteConfirmModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
        title="Xóa phim"
        message={`Bạn có chắc muốn xóa phim ${selectedMovie?.ten_phim}? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
};
export default Movies;
